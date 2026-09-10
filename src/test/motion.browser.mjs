/* global process, console, window, document, getComputedStyle, sessionStorage, innerWidth */
// Run against Vite: STORY_BASE_URL=http://127.0.0.1:5174 node src/test/motion.browser.mjs
import assert from 'node:assert/strict';
import { chromium } from '@playwright/test';

const browser = await chromium.launch();
const page = await browser.newPage();
const errors = [];
page.on('pageerror', error => errors.push(error.message));
await page.addInitScript(() => sessionStorage.setItem('hvn-memory-intro-seen', 'true'));

const jump = async id => {
  await page.locator(`#${id}`).evaluate(element => window.scrollTo({
    top: element.getBoundingClientRect().top + window.scrollY - 130,
    behavior: 'instant',
  }));
  await page.waitForFunction(value => document.querySelector(`[data-story-step-id="${value}"]`)?.classList.contains('is-active'), id);
};

try {
  for (const width of [1440, 390]) {
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.setViewportSize({ width, height: 900 });
    await page.goto(process.env.STORY_BASE_URL ?? 'http://127.0.0.1:5174');
    await page.evaluate(() => document.fonts.ready);
    await page.waitForFunction(() => document.querySelector('.keepsake-stage'));
    await page.waitForFunction(() => [...document.querySelectorAll('.intro-title-word')].every(element => Number(getComputedStyle(element).opacity) === 1));
    const ids = await page.locator('[data-story-step]').evaluateAll(elements => elements.map(element => element.id));
    assert.equal(ids.length, 5);
    for (const id of ids) {
      await jump(id);
      if (width > 900) {
        await page.waitForFunction(() => Number(getComputedStyle(document.querySelector('.memory-canvas-scene')).opacity) > 0.999);
      }
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
    }
    // A reverse jump followed immediately by a preference change must not leave a half-faded scene.
    await jump(ids[3]);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.waitForFunction(() => document.querySelector('.call-timer')?.textContent === '08:00:00');
    await page.waitForFunction(() => [...document.querySelectorAll('[data-memory-reveal]')].every(element => element.getAnimations().length === 0));
    if (width > 900) {
      assert.equal(await page.locator('.memory-canvas-scene').evaluate(element => getComputedStyle(element).opacity), '1');
      assert.equal(await page.locator('.memory-canvas-scene').evaluate(element => getComputedStyle(element).transform), 'none');
    }
    await jump(ids[0]);
    await page.screenshot({ path: `/tmp/story-motion-${width}.png` });
    console.log(`PASS ${width}px: five Part I scenes, reverse jumps, runtime motion preference, readable reveals, no overflow`);
  }
  assert.deepEqual(errors, []);
} finally {
  await browser.close();
}
