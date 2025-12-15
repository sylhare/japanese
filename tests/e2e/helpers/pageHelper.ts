import { Page, expect } from '@playwright/test';

export async function verifyPageIsFound(page: Page) {
  await page.waitForLoadState('networkidle');
  
  const pageContent = await page.content();
  
  expect(pageContent.toLowerCase()).not.toContain('page not found');
  expect(pageContent).not.toContain('We could not find what you were looking for');
  
  const article = page.locator('article');
  await expect(article).toBeVisible({ timeout: 10000 });
  
  const contentHeading = article.locator('h1, h2').first();
  await expect(contentHeading).toBeVisible({ timeout: 5000 });
}

