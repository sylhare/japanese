import { Page, expect } from '@playwright/test';

export async function verifyPageIsFound(page: Page) {
  await page.waitForLoadState('networkidle');
  
  const notFoundHeading = page.locator('h1.hero__title', { hasText: 'Page Not Found' });
  await expect(notFoundHeading).not.toBeVisible({ timeout: 5000 });
}

