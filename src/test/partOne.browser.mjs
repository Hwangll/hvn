/* global process, console, document, sessionStorage, innerWidth */
// Run against Vite: STORY_BASE_URL=http://127.0.0.1:5174 node src/test/partOne.browser.mjs
import assert from 'node:assert/strict';
import { chromium } from '@playwright/test';

const browser = await chromium.launch();
const page = await browser.newPage({ reducedMotion: 'reduce' });
const errors = [];
page.on('pageerror', error => errors.push(error.message));
await page.addInitScript(() => sessionStorage.setItem('hvn-memory-intro-seen', 'true'));

try {
  for (const width of [1440, 1024, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(process.env.STORY_BASE_URL ?? 'http://127.0.0.1:5174');
    await page.evaluate(() => document.fonts.ready);
    await page.waitForSelector('.keepsake-playground');
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, `page overflow at ${width}`);
    if (width === 1440 || width === 390) await page.screenshot({ path: `/tmp/part-one-ui-hero-${width}.png` });
    await page.getByRole('link', { name: 'Bắt đầu đọc', exact: true }).click();
    assert.ok(await page.locator('#first-meeting').evaluate(element => element.getBoundingClientRect().top < 200));

    const overview = page.getByRole('navigation', { name: 'Mục lục Phần I', exact: true });
    const links = overview.getByRole('link');
    assert.equal(await links.count(), 5);
    await overview.scrollIntoViewIfNeeded();
    for (const link of await links.all()) {
      assert.equal(await link.evaluate(element => {
        const rect = element.getBoundingClientRect();
        return rect.left >= 0 && rect.right <= innerWidth && rect.height >= 44;
      }), true, `index touch target at ${width}`);
    }
    if (width === 1440 || width === 390) await page.screenshot({ path: `/tmp/part-one-ui-index-${width}.png` });

    for (let index = 0; index < 5; index++) {
      const link = links.nth(index);
      const id = (await link.getAttribute('href')).slice(1);
      await link.click();
      await page.waitForFunction(value => document.querySelector(`[data-story-step-id="${value}"]`)?.classList.contains('is-active'), id);
      if (width > 900) {
        const rail = page.getByRole('navigation', { name: 'Chọn chương Phần I', exact: true });
        assert.equal(await rail.locator('[aria-current="step"]').getAttribute('href'), `#${id}`);
        assert.equal(await page.locator('.memory-canvas').evaluate(canvas => {
          const frame = canvas.getBoundingClientRect();
          const scene = canvas.querySelector('.memory-canvas-scene').getBoundingClientRect();
          const header = canvas.querySelector('.memory-canvas-meta').getBoundingClientRect();
          return scene.height > frame.height * 0.55 && header.height < 80;
        }), true, `illustration fills the memory frame at ${width}`);
      }
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
      if ((width === 1440 || width === 320) && (index === 2 || index === 3)) {
        await page.screenshot({ path: `/tmp/part-one-ui-chapter-${index}-${width}.png` });
      }
    }
    if (width > 900) {
      await page.getByRole('navigation', { name: 'Chọn chương Phần I' }).getByRole('link').first().click();
      await page.waitForFunction(() => document.querySelector('#first-meeting')?.classList.contains('is-active'));
    }
    console.log(`PASS ${width}px: start reading, five chapter links, current chapter, readable touch targets, no horizontal overflow`);
  }
  assert.deepEqual(errors, []);
} finally {
  await browser.close();
}
