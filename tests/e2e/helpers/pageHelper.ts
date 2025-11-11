import { expect, Page } from '@playwright/test';

/**
 * Helper: Verify that a page has loaded successfully (not a 404 page)
 */
export async function verifyPageIsFound(page: Page) {
  await page.waitForLoadState('networkidle');
  const pageContent = await page.textContent('body');
  expect(pageContent).not.toContain('Page Not Found');
  const article = page.locator('article').first();
  await expect(article).toBeVisible();
}

