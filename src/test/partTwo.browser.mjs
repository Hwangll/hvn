/* global process, console, window, document, getComputedStyle, innerWidth, sessionStorage */
// Run against Vite: STORY_BASE_URL=http://127.0.0.1:5174 node src/test/partTwo.browser.mjs
import assert from 'node:assert/strict';
import { chromium } from '@playwright/test';

const baseURL = process.env.STORY_BASE_URL ?? 'http://127.0.0.1:5174';
const browser = await chromium.launch({ headless: true });
const errors = [];
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
page.on('pageerror', (error) => errors.push(error.message));
const ids = ['in-person-meeting', 'our-dates', 'aquarium', 'cafe', 'sunset'];
const jump = async (id, offset = 210) => {
  await page.locator(`#${id}`).evaluate((element, gap) => window.scrollTo({
    top: element.getBoundingClientRect().top + window.scrollY - gap, behavior: 'instant',
  }), offset);
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
  await jump('aquarium', 680);
  await page.waitForFunction(() => {
    const opacity = Number(getComputedStyle(document.querySelector('.offline-mood-aquarium')).opacity);
    return opacity > 0.48 && opacity < 0.52;
  });
  assert.equal(await page.locator('[data-offline-panel="aquarium"]').evaluate((el) => {
    const alpha = Number(getComputedStyle(el).opacity);
    return alpha > 0.48 && alpha < 0.52;
  }), true);
  await jump('aquarium');
  await settledPanel('aquarium');
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
  await page.waitForTimeout(500);
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
