/* global process, console, window, document, getComputedStyle, innerWidth, sessionStorage, Event */
// Run against Vite: STORY_BASE_URL=http://127.0.0.1:5174 node src/test/partTwo.browser.mjs
import assert from 'node:assert/strict';
import { chromium, expect } from '@playwright/test';

const baseURL = process.env.STORY_BASE_URL ?? 'http://127.0.0.1:5174';
const browser = await chromium.launch({ headless: true });
const errors = [];
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
page.on('pageerror', (error) => errors.push(error.message));
const ids = ['in-person-meeting', 'our-dates', 'aquarium', 'cafe', 'sunset'];
// Wait for the scroll paint itself, not a transient opacity crossed by the scrub tween.
const settledPaint = async () => {
  let previous;
  let stable = 0;
  await expect.poll(async () => {
    const current = await page.locator('[data-offline-panel], [data-step-reveal], [data-parallax], [data-water-depth]').evaluateAll(elements =>
      JSON.stringify([window.scrollY, ...elements.map(element => element.getAttribute('style'))]));
    stable = current === previous ? stable + 1 : 0;
    previous = current;
    return stable;
  }, { intervals: [80], timeout: 8000 }).toBeGreaterThanOrEqual(3);
};
const jump = async (id, offset = 210) => {
  await page.locator(`#${id}`).evaluate((element, gap) => window.scrollTo({
    top: element.getBoundingClientRect().top + window.scrollY - gap, behavior: 'instant',
  }), offset);
  await settledPaint();
};
const scenePaint = async (selector) => page.locator(selector).evaluate(element => {
  const style = getComputedStyle(element);
  return { transform: style.transform, opacity: style.opacity };
});
const layoutState = () => page.locator('#aquarium').evaluate(element => ({
  y: window.scrollY, top: element.getBoundingClientRect().top, height: element.offsetHeight,
  rootTop: document.querySelector('.story-sequence').getBoundingClientRect().top + window.scrollY,
  rootHeight: document.querySelector('.story-sequence').offsetHeight,
}));
const readingLine = async (selector) => {
  await page.locator(selector).evaluate(element => window.scrollTo({
    top: element.getBoundingClientRect().top + window.scrollY - window.innerHeight * 0.55,
    behavior: 'instant',
  }));
  await settledPaint();
  assert.equal(await page.locator(selector).evaluate(element => {
    const style = getComputedStyle(element);
    return Number(style.opacity) === 1 && Number(style.getPropertyValue('--reveal')) === 1;
  }), true, `${selector} must be fully readable at the reading line`);
};
const settledPanel = async (id) => {
  await page.waitForFunction((sceneId) => {
    const panel = document.querySelector(`[data-offline-panel="${sceneId}"]`);
    return panel && Number(getComputedStyle(panel).opacity) > 0.999 && getComputedStyle(panel).visibility === 'visible';
  }, id);
  await page.waitForFunction((sceneId) => document.querySelector('.memory-journey-route a[aria-current="step"]')?.getAttribute('href') === `#${sceneId}`, id);
};

try {
  await page.goto(`${baseURL}/part-2/`);
  await page.evaluate(() => document.fonts.ready);
  await page.waitForFunction(() => document.querySelector('.keepsake-playground'));
  await page.waitForTimeout(400);
  assert.equal(await page.locator('.part-two-atmosphere').evaluate((el) => getComputedStyle(el).position), 'fixed');
  assert.equal(await page.locator('body').evaluate((el) => el.classList.contains('is-scroll-locked')), false);
  assert.equal(await page.locator('[data-offline-panel]').count(), 5);
  for (const id of ids) {
    await jump(id);
    await settledPanel(id);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
  }
  await page.getByRole('button', { name: /Vé thủy cung/ }).click();
  assert.equal(await page.locator('.keepsake-playground').getAttribute('data-selected-keepsake'), 'aquarium-ticket');
  // A reverse jump must reconstruct previous visuals, even when intermediate scenes are skipped.
  await jump('our-dates');
  await settledPanel('our-dates');
  const blends = [];
  for (const offset of [850, 780, 680, 560, 440]) {
    await jump('aquarium', offset);
    const alpha = await page.locator('[data-offline-panel]').evaluateAll(elements => elements.map(el => Number(getComputedStyle(el).opacity)));
    assert.ok(Math.abs(alpha.reduce((sum, value) => sum + value, 0) - 1) < 0.01, 'dissolve must not dip into an empty stage');
    const photoAlpha = await page.locator('[data-offline-panel]').evaluateAll(elements => elements.reduce((sum, panel) =>
      sum + Number(getComputedStyle(panel).opacity) * Number(getComputedStyle(panel.querySelector('.memory-photo')).opacity), 0));
    assert.ok(photoAlpha > 0.75, 'photos must remain a readable anchor during the handoff');
    blends.push({ offset, alpha, layout: await layoutState() });
  }
  for (const { offset, alpha, layout } of blends.toReversed()) {
    await jump('aquarium', offset);
    assert.deepEqual(await page.locator('[data-offline-panel]').evaluateAll(elements => elements.map(el => Number(getComputedStyle(el).opacity))), alpha, JSON.stringify({ offset, before: layout, after: await layoutState() }));
  }
  await jump('aquarium');
  await settledPanel('aquarium');
  // CSS idle motion must not override the scroll-owned transform.
  for (const selector of ['.offline-mood-aquarium .water-surface', '[data-offline-panel="aquarium"] .aquarium-light-one', '[data-offline-panel="aquarium"] .aquarium-caustic']) {
    assert.equal(await page.locator(selector).evaluate(element => element.getAnimations().some(animation =>
      animation.effect?.getKeyframes().some(frame => 'transform' in frame))), false, `${selector} has competing transform drivers`);
  }
  const fish = '[data-offline-panel="aquarium"] .fish-one';
  const forwardFish = await scenePaint(fish);
  await jump('sunset');
  await jump('aquarium');
  assert.deepEqual(await scenePaint(fish), forwardFish);
  await readingLine('#aquarium .story-step-body p:last-child');
  const revealBeforeResize = await scenePaint('#aquarium .story-step-body p:last-child');
  await page.evaluate(() => window.dispatchEvent(new Event('resize')));
  await settledPaint();
  assert.deepEqual(await scenePaint('#aquarium .story-step-body p:last-child'), revealBeforeResize);
  await page.screenshot({ path: '/tmp/part-two-verified-desktop.png' });
  // Real route links, plus the persisted stable IDs used by keepsake unlocks.
  await page.getByRole('link', { name: 'Hoàng hôn', exact: true }).click();
  await settledPanel('sunset');
  await page.getByRole('link', { name: 'Đi lượn', exact: true }).click();
  await settledPanel('in-person-meeting');

  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForSelector('.mobile-chapter-journey');
  assert.equal(await page.locator('[data-offline-panel]').count(), 0);
  for (const id of ids) {
    await jump(id, 110);
    await page.waitForFunction((sceneId) => document.querySelector(`#${sceneId}-copy`)?.getAttribute('aria-current') === 'step', id);
    assert.equal(await page.locator(`#${id} .story-step-body`).isVisible(), true);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
  }
  await jump('aquarium', 110);
  const mobileFish = '#aquarium .fish-one';
  const mobileForward = await scenePaint(mobileFish);
  await jump('sunset', 110);
  await jump('aquarium', 110);
  assert.deepEqual(await scenePaint(mobileFish), mobileForward);
  for (const id of ids) await readingLine(`#${id} .story-step-body p:last-child`);
  for (const id of ids.toReversed()) await readingLine(`#${id} .story-step-body p:first-child`);
  // Same mobile DOM survives preference changes: no cached rotation may accumulate.
  await jump('our-dates', 110);
  const clock = '#our-dates .date-clock-hand-hour';
  const clockBefore = await scenePaint(clock);
  for (let toggle = 0; toggle < 2; toggle++) {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await settledPaint();
    assert.equal(await page.locator(clock).evaluate(element => getComputedStyle(element).transform), 'none');
    assert.equal(await page.locator('.story-part-2').evaluate(element => element.getAnimations({ subtree: true }).length), 0);
    await readingLine('#sunset .story-step-quote');
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await jump('our-dates', 110);
    assert.deepEqual(await scenePaint(clock), clockBefore, 'motion preference must restore the authored rotation');
  }
  await jump('aquarium', 110);
  await page.screenshot({ path: '/tmp/part-two-verified-mobile.png' });
  await page.setViewportSize({ width: 320, height: 700 });
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.waitForSelector('[data-offline-panel]', { state: 'attached' });
  await jump('cafe');
  await settledPanel('cafe');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.waitForSelector('.mobile-chapter-journey');
  assert.equal(await page.locator('.sticky-memory-stage').count(), 0);
  assert.equal(await page.locator('.mobile-chapter-block').count(), 5);
  assert.equal(await page.locator('.sunset-statement').evaluate((el) => getComputedStyle(el).opacity), '1');
  assert.equal(await page.locator('.water-rays').evaluate((el) => getComputedStyle(el).transform), 'none');
  await jump('sunset', 110);
  await page.waitForFunction(() => document.querySelector('#sunset-copy')?.getAttribute('aria-current') === 'step');
  await page.screenshot({ path: '/tmp/part-two-verified-reduced.png' });

  // Part I still renders its intro, then its original five-step story.
  await page.goto(`${baseURL}/`);
  assert.equal(await page.locator('.app-shell').evaluate((el) => el.classList.contains('experience-intro')), true);
  await page.evaluate(() => sessionStorage.setItem('hvn-memory-intro-seen', 'true'));
  await page.reload();
  await page.getByRole('heading', { name: 'Khởi đầu như bao khởi đầu' }).waitFor();
  assert.equal(await page.locator('.part-two-atmosphere').count(), 0);
  assert.equal(await page.locator('[data-story-step]').count(), 5);
  assert.deepEqual(errors, []);
  console.log('PASS: desktop scenes, intermediate blend, reverse scroll, route jumps, mobile 390/320px, responsive rebuild, reduced motion, Part I intro/story, no runtime errors.');
} finally {
  await browser.close();
}
