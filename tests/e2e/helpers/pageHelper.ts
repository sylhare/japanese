import { Page, expect } from '@playwright/test';

/**
 * Helper: Verify that a page has loaded successfully (not a 404 page)
 * This is a basic check that works for any page type
 */
export async function verifyPageExists(page: Page) {
  await page.waitForLoadState('networkidle');
  const pageContent = await page.textContent('body');
  expect(pageContent).not.toContain('Page Not Found');
}

/**
 * Helper: Verify that a page has loaded successfully with article content
 * Use this for documentation/lesson pages that have an article element
 */
export async function verifyPageIsFound(page: Page) {
  await verifyPageExists(page);
  const article = page.locator('article').first();
  await expect(article).toBeVisible();
}

