/* global process, console, document, window, sessionStorage, getComputedStyle */
// Run against Vite: STORY_BASE_URL=http://127.0.0.1:5173 node src/test/typography.browser.mjs
import assert from 'node:assert/strict';
import { chromium } from '@playwright/test';

const browser = await chromium.launch();
const page = await browser.newPage({ reducedMotion: 'reduce' });
const baseUrl = process.env.STORY_BASE_URL ?? 'http://127.0.0.1:5173';

const assertAnimatedWordsFit = async (selector, label) => {
  const words = await page.locator(selector).evaluateAll(elements =>
    elements.map(element => ({
      text: element.textContent?.trim(),
      clientWidth: element.clientWidth,
      clientHeight: element.clientHeight,
      scrollWidth: element.scrollWidth,
      scrollHeight: element.scrollHeight,
      overflow: getComputedStyle(element).overflow,
    })),
  );

  assert.ok(words.length > 0, `${label} should render animated title words`);
  for (const word of words) {
    assert.equal(word.overflow, 'visible', `${label} must not mask the ink of “${word.text}”`);
    const roundingTolerance = 1;
    assert.ok(
      word.scrollWidth <= word.clientWidth + roundingTolerance && word.scrollHeight <= word.clientHeight + roundingTolerance,
      `${label} clips “${word.text}”: client ${word.clientWidth}x${word.clientHeight}, scroll ${word.scrollWidth}x${word.scrollHeight}, overflow ${word.overflow}`,
    );
  }
};

try {
  for (const viewport of [
    { width: 1440, height: 900 },
    { width: 390, height: 844 },
    { width: 320, height: 568 },
  ]) {
    await page.setViewportSize(viewport);
    await page.goto(baseUrl);
    await page.evaluate(() => {
      sessionStorage.removeItem('hvn-memory-intro-seen');
      window.location.reload();
    });
    await page.waitForSelector('.memory-title-word');
    await page.evaluate(() => document.fonts.ready);
    await assertAnimatedWordsFit('.memory-title-word', `Memory intro at ${viewport.width}px`);

    await page.goto(`${baseUrl}/part-2/`);
    await page.waitForSelector('.title-word');
    await page.evaluate(() => document.fonts.ready);
    await assertAnimatedWordsFit('.title-word', `Part II titles at ${viewport.width}px`);
  }

  console.log('PASS: animated Vietnamese title words fit their clipping boxes at desktop and mobile widths');
} finally {
  await browser.close();
}
