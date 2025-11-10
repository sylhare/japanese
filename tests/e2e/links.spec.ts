import { test, expect } from '@playwright/test';

async function verifyPageIsFound(page: any) {
  await page.waitForLoadState('networkidle');
  const pageContent = await page.textContent('body');
  expect(pageContent).not.toContain('Page Not Found');
  const article = page.locator('article').first();
  await expect(article).toBeVisible();
}

test.describe('Vocabulary Links Navigation', () => {
  test('should navigate to vocabulary pages from sidebar', async ({ page }) => {
    await page.goto('/docs/lessons/vocabulary/colors');
    
    const sidebar = page.locator('nav').first();
    await expect(sidebar).toBeVisible();
    
    const familyLink = sidebar.getByRole('link', { name: /family/i }).first();
    await familyLink.click();
    await verifyPageIsFound(page);
    await expect(page.getByRole('heading', { name: /family/i })).toBeVisible();
    
    const tastesLink = sidebar.getByRole('link', { name: /tastes/i }).first();
    await tastesLink.click();
    await verifyPageIsFound(page);
    await expect(page.getByRole('heading', { name: /tastes|flavors/i })).toBeVisible();
    
    const colorsLink = sidebar.getByRole('link', { name: /colors/i }).first();
    await colorsLink.click();
    await verifyPageIsFound(page);
    await expect(page.getByRole('heading', { name: /colors/i })).toBeVisible();
  });

  test('should navigate to vocabulary pages from vocabulary landing page (LessonList)', async ({ page }) => {
    await page.goto('/docs/lessons/vocabulary/');
    await page.waitForTimeout(1000);
    
    const colorsLink = page.getByRole('link', { name: /Colors/i }).filter({ hasText: /Colors/i });
      await expect(colorsLink.first()).toBeVisible();
      await colorsLink.first().click();
      await verifyPageIsFound(page);
      await expect(page.getByRole('heading', { name: /colors/i })).toBeVisible();

    
    await page.goto('/docs/lessons/vocabulary/');
    await page.waitForTimeout(1000);
    
    const tastesLink = page.getByRole('link', { name: /Tastes/i }).filter({ hasText: /Tastes/i });
      await expect(tastesLink.first()).toBeVisible();
      await tastesLink.first().click();
      await verifyPageIsFound(page);
      await expect(page.getByRole('heading', { name: /tastes|flavors/i })).toBeVisible();
    
    await page.goto('/docs/lessons/vocabulary/');
    await page.waitForTimeout(1000);
    
    const timeLink = page.getByRole('link').filter({ hasText: /Time and Dates/i });
    await expect(timeLink.first()).toBeVisible();
    await timeLink.first().click();
    await verifyPageIsFound(page);
    await expect(page.getByRole('heading', { name: /time|dates/i })).toBeVisible();
    
    await page.goto('/docs/lessons/vocabulary/');
    await page.waitForTimeout(1000);
    
    const numbersLink = page.getByRole('link').filter({ hasText: /Numbers and Counting/i });
      await expect(numbersLink.first()).toBeVisible();
      await numbersLink.first().click();
      await verifyPageIsFound(page);
      await expect(page.getByRole('heading', { name: /numbers|counting/i })).toBeVisible();
    
    await page.goto('/docs/lessons/vocabulary/');
    await page.waitForTimeout(1000);
    
    const familyLink = page.getByRole('link').filter({ hasText: /Family and Relationships/i });
      await expect(familyLink.first()).toBeVisible();
      await familyLink.first().click();
      await verifyPageIsFound(page);
      await expect(page.getByRole('heading', { name: /family|relationships/i })).toBeVisible();
  });

  test('should navigate to vocabulary pages from vocabulary search page tags', async ({ page }) => {
    await page.goto('/vocabulary');
    
    const heading = page.getByRole('heading', { name: 'Japanese Vocabulary' });
      await expect(heading).toBeVisible({ timeout: 10000 });
    
    const tagLinks = page.locator('[class*="tag"]').filter({ hasText: /colors|family|tastes|time|numbers/i });
    const firstTagLink = tagLinks.first();
    await firstTagLink.click();
    await verifyPageIsFound(page);
    await expect(page.getByRole('heading').first()).toBeVisible();
  });

  test('should have working links for all vocabulary pages listed in landing page', async ({ page }) => {
    await page.goto('/docs/lessons/vocabulary/');
    await page.waitForTimeout(1000);
    
    const lessonLinks = page.getByRole('link').filter({ hasText: /Colors|Tastes|Time|Numbers|Family|Confusing Kanji/i });
    const linkCount = await lessonLinks.count();
    
    for (let i = 0; i < Math.min(linkCount, 5); i++) {
      const link = lessonLinks.nth(i);
      await expect(link).toBeVisible();
      
      const href = await link.getAttribute('href');
      expect(href).toBeTruthy();
      expect(href).toMatch(/^\/docs\/lessons/);
      
      await link.click();
      await verifyPageIsFound(page);
      await expect(page.getByRole('heading').first()).toBeVisible();
      
      await page.goto('/docs/lessons/vocabulary/');
      await page.waitForTimeout(1000);
    }
  });

  test('should navigate between vocabulary pages via sidebar', async ({ page }) => {
    await page.goto('/docs/lessons/vocabulary/colors');
    
    const sidebar = page.locator('nav').first();
    await expect(sidebar).toBeVisible();
    
    const numbersSidebarLink = sidebar.getByRole('link', { name: /numbers/i }).first();
      await numbersSidebarLink.click();
      await verifyPageIsFound(page);
      await expect(page.getByRole('heading', { name: /numbers|counting/i })).toBeVisible();
    
    const timeSidebarLink = sidebar.getByRole('link', { name: /time/i }).first();
      await timeSidebarLink.click();
      await verifyPageIsFound(page);
      await expect(page.getByRole('heading', { name: /time|dates/i })).toBeVisible();
  });

  test('should fail when navigating to non-existent page', async ({ page }) => {
    test.fail();
    await page.goto('/docs/lessons/vocabulary/this-page-does-not-exist');
    await verifyPageIsFound(page);
  });
});
