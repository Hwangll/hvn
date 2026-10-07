/* global process, console, window, document, getComputedStyle, innerWidth */
// Run against Vite: STORY_BASE_URL=http://127.0.0.1:5174 node src/test/partThree.browser.mjs
import assert from 'node:assert/strict';
import { chromium, expect } from '@playwright/test';

const baseURL = process.env.STORY_BASE_URL ?? 'http://127.0.0.1:5174';
const browser = await chromium.launch({ headless: true });
const errors = [];
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
page.on('pageerror', (error) => errors.push(error.message));
// The love counter and both envelopes read the clock: pin it to a known day (timers keep running).
await page.clock.setFixedTime(new Date('2026-10-06T09:00:00+07:00'));
const ids = [
  'first-homestay', 'loving-more', 'hoang-mai-afternoon', 'lang-bac', 'chua-mot-cot', 'rain-and-dusk',
  'rainy-karaoke', 'clinic-day', 'van-quan-rain', 'tiny-cafe', 'cuc-cu-night',
  'birthday-plans', 'mid-autumn', 'phung-khoang', 'hoang-birthday',
];
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
const opacity = (selector) => page.locator(selector).evaluate(element => Number(getComputedStyle(element).opacity));
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
const noSideScroll = async () => assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);

try {
  await page.goto(`${baseURL}/part-3/`);
  await page.evaluate(() => document.fonts.ready);
  await page.getByRole('heading', { name: 'Quá nhanh, quá nguy hiểm' }).waitFor();
  await page.waitForTimeout(400);
  assert.equal(await page.locator('.part-three-atmosphere').evaluate((el) => getComputedStyle(el).position), 'fixed');
  assert.equal(await page.locator('body').evaluate((el) => el.classList.contains('is-scroll-locked')), false);
  assert.equal(await page.locator('[data-offline-panel]').count(), 15);
  // Part III is its own page: none of Part II's chapters, and no keepsake box before its credits.
  assert.equal(await page.locator('#in-person-meeting').count(), 0);
  assert.equal(await page.locator('.keepsake-playground').count(), 0);
  for (const id of ids) {
    await jump(id);
    await settledPanel(id);
    await noSideScroll();
  }

  // The Inlove counter counts in Hà Nội's calendar: on 6 October 2026, 5 months, 1 week and 5 days since 24 April.
  await jump('loving-more');
  assert.match(await page.locator('[data-offline-panel="loving-more"] .p3-counter').innerText(), /165 ngày iu nhau/);
  assert.deepEqual(await page.locator('[data-offline-panel="loving-more"] .p3-counter li b').allInnerTexts(), ['0', '5', '1', '5']);

  // A stop with two photos changes them like slides: never both half-faded on top of each other.
  for (const id of ['hoang-mai-afternoon', 'rainy-karaoke', 'cuc-cu-night']) {
    const prints = `[data-offline-panel="${id}"] .p3-photo`;
    for (const offset of [600, 450, 300, 150, 0, -150, -300]) {
      await jump(id, offset);
      const [first, second] = await page.locator(prints).evaluateAll(elements => elements.map(el => Number(getComputedStyle(el).opacity)));
      assert.ok(Math.min(first, second) < 0.3, `${id}: photos overlap half-faded at ${offset}px: ${first} / ${second}`);
    }
  }
  // The long route names the stop in hand and its chapter; the birthday leaves its page for him, by the red lilies.
  await jump('hoang-birthday');
  await settledPanel('hoang-birthday');
  assert.match(await page.locator('.memory-route-heading').innerText(), /CHƯƠNG 06\s*·\s*SINH NHẬT\s*15 \/ 15/i);
  assert.equal(await page.locator('[data-offline-panel="hoang-birthday"] .p3-lilies .lily-sprite').count(), 3);
  assert.equal(await page.locator('[data-offline-panel="hoang-birthday"] .p3-his-letter b').innerText(), 'Tadaaaa');

  // Handing one stop to the next never dips into an empty stage, and a photo stays the anchor.
  await jump('hoang-mai-afternoon');
  await settledPanel('hoang-mai-afternoon');
  for (const offset of [850, 700, 560, 440]) {
    await jump('lang-bac', offset);
    const alpha = await page.locator('[data-offline-panel]').evaluateAll(elements => elements.map(el => Number(getComputedStyle(el).opacity)));
    assert.ok(Math.abs(alpha.reduce((sum, value) => sum + value, 0) - 1) < 0.01, 'dissolve must not dip into an empty stage');
    const photoAlpha = await page.locator('[data-offline-panel]').evaluateAll(elements => elements.reduce((sum, panel) =>
      sum + Number(getComputedStyle(panel).opacity) * Math.max(0, ...[...panel.querySelectorAll('.memory-photo')].map(photo => Number(getComputedStyle(photo).opacity))), 0));
    assert.ok(photoAlpha > 0.75, `photos must remain a readable anchor during the handoff (${photoAlpha.toFixed(2)} at ${offset}px)`);
  }
  await page.screenshot({ path: '/tmp/part-three-verified-desktop.png' });
  // Real route links.
  await page.getByRole('link', { name: 'Chiều tà', exact: true }).click();
  await settledPanel('rain-and-dusk');
  await page.getByRole('link', { name: 'Homestay', exact: true }).click();
  await settledPanel('first-homestay');

  // The credits close the curtains, and the next chapter waits in its envelope.
  await page.locator('.part-three-ending').scrollIntoViewIfNeeded();
  await page.waitForFunction(() => document.querySelector('.part-three-ending')?.classList.contains('is-revealed'));
  await page.getByText('Mở vào ngày 20/12/2026', { exact: true }).waitFor();
  assert.equal(await page.getByRole('link', { name: 'Về Phần II' }).getAttribute('href'), '/part-2/');
  assert.equal(await page.getByRole('link', { name: 'Xem lại từ đầu' }).getAttribute('href'), '/');
  await noSideScroll();

  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForSelector('.mobile-chapter-journey');
  assert.equal(await page.locator('[data-offline-panel]').count(), 0);
  for (const id of ids) {
    await jump(id, 110);
    await page.waitForFunction((sceneId) => document.querySelector(`#${sceneId}-copy`)?.getAttribute('aria-current') === 'step', id);
    assert.equal(await page.locator(`#${id} .story-step-body`).isVisible(), true);
    await noSideScroll();
  }
  for (const id of ids) await readingLine(`#${id} .story-step-body p:last-child`);
  await jump('first-homestay', 110);
  await page.screenshot({ path: '/tmp/part-three-verified-mobile.png' });
  await page.setViewportSize({ width: 320, height: 700 });
  await noSideScroll();

  // Reduced motion: every stop in reading order, each at its opening pose.
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.waitForSelector('.mobile-chapter-journey');
  assert.equal(await page.locator('.sticky-memory-stage').count(), 0);
  assert.equal(await page.locator('.mobile-chapter-block').count(), 15);
  assert.equal(await page.locator('#hoang-mai-afternoon .p3-photo-second').evaluate(el => getComputedStyle(el).display), 'none');
  assert.equal(await opacity('#hoang-mai-afternoon .p3-photo:not(.p3-photo-second)'), 1);
  assert.equal(await page.locator('.story-part-3').evaluate(element => element.getAnimations({ subtree: true }).length), 0);
  await page.emulateMedia({ reducedMotion: 'no-preference' });

  // Part II's envelope has opened, onto this page.
  await page.goto(`${baseURL}/part-2/`);
  await page.getByRole('heading', { name: 'Thật sự đứng cạnh nhau' }).waitFor();
  const next = page.getByRole('link', { name: 'Đọc Phần III' });
  await next.scrollIntoViewIfNeeded();
  assert.equal(await next.getAttribute('href'), '/part-3/');
  assert.deepEqual(errors, []);
  console.log('PASS: Part III desktop stops (15), love counter, slide-change photos, the birthday stop, handoffs, route jumps, credits and envelope, mobile 390/320px, reduced motion, Part II link, no runtime errors.');
} finally {
  await browser.close();
}
