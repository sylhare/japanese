import { Page, expect } from '@playwright/test';

/**
 * Helper: Verify that a page has loaded successfully (not a 404 page)
 * Checks that the page doesn't contain "Page Not Found" heading and has visible content
 */
export async function verifyPageIsFound(page: Page) {
  await page.waitForLoadState('domcontentloaded');
  
  const notFoundHeading = page.locator('h1', { hasText: 'Page Not Found' });
  await expect(notFoundHeading).not.toBeVisible();
  
  await page.waitForLoadState('networkidle');
  const hasContent = await page.locator('article, main, h1').first().isVisible();
  expect(hasContent).toBe(true);
}

