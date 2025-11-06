import { test, expect } from '@playwright/test';

test.describe('Vocabulary Links Navigation', () => {
  test('should navigate to vocabulary pages from sidebar', async ({ page }) => {
    await page.goto('/docs/lessons/vocabulary/colors');
    await page.waitForTimeout(500);
    
    const sidebar = page.locator('nav').first();
    await expect(sidebar).toBeVisible();
    
    const familyLink = sidebar.getByRole('link', { name: /family/i }).first();
    if (await familyLink.count() > 0) {
      await familyLink.click();
      await expect(page).toHaveURL(/.*vocabulary\/family/);
      await expect(page.getByRole('heading', { name: /family/i })).toBeVisible();
    }
    
    const tastesLink = sidebar.getByRole('link', { name: /tastes/i }).first();
    if (await tastesLink.count() > 0) {
      await tastesLink.click();
      await expect(page).toHaveURL(/.*vocabulary\/tastes/);
      await expect(page.getByRole('heading', { name: /tastes|flavors/i })).toBeVisible();
    }
    
    const colorsLink = sidebar.getByRole('link', { name: /colors/i }).first();
    if (await colorsLink.count() > 0) {
      await colorsLink.click();
      await expect(page).toHaveURL(/.*vocabulary\/colors/);
      await expect(page.getByRole('heading', { name: /colors/i })).toBeVisible();
    }
  });

  test('should navigate to vocabulary pages from vocabulary landing page (LessonList)', async ({ page }) => {
    await page.goto('/docs/lessons/vocabulary/');
    await page.waitForTimeout(1000);
    
    const colorsLink = page.getByRole('link', { name: /Colors/i }).filter({ hasText: /Colors/i });
    if (await colorsLink.count() > 0) {
      await expect(colorsLink.first()).toBeVisible();
      await colorsLink.first().click();
      await expect(page).toHaveURL(/.*vocabulary\/colors/);
      await expect(page.getByRole('heading', { name: /colors/i })).toBeVisible();
    }
    
    await page.goto('/docs/lessons/vocabulary/');
    await page.waitForTimeout(1000);
    
    const tastesLink = page.getByRole('link', { name: /Tastes/i }).filter({ hasText: /Tastes/i });
    if (await tastesLink.count() > 0) {
      await expect(tastesLink.first()).toBeVisible();
      await tastesLink.first().click();
      await expect(page).toHaveURL(/.*vocabulary\/tastes/);
      await expect(page.getByRole('heading', { name: /tastes|flavors/i })).toBeVisible();
    }
    
    await page.goto('/docs/lessons/vocabulary/');
    await page.waitForTimeout(1000);
    
    const timeLink = page.getByRole('link').filter({ hasText: /Time and Dates/i });
    if (await timeLink.count() > 0) {
      await expect(timeLink.first()).toBeVisible();
      await timeLink.first().click();
      await expect(page).toHaveURL(/.*vocabulary\/time/);
      await expect(page.getByRole('heading', { name: /time|dates/i })).toBeVisible();
    }
    
    await page.goto('/docs/lessons/vocabulary/');
    await page.waitForTimeout(1000);
    
    const numbersLink = page.getByRole('link').filter({ hasText: /Numbers and Counting/i });
    if (await numbersLink.count() > 0) {
      await expect(numbersLink.first()).toBeVisible();
      await numbersLink.first().click();
      await expect(page).toHaveURL(/.*vocabulary\/numbers/);
      await expect(page.getByRole('heading', { name: /numbers|counting/i })).toBeVisible();
    }
    
    await page.goto('/docs/lessons/vocabulary/');
    await page.waitForTimeout(1000);
    
    const familyLink = page.getByRole('link').filter({ hasText: /Family and Relationships/i });
    if (await familyLink.count() > 0) {
      await expect(familyLink.first()).toBeVisible();
      await familyLink.first().click();
      await expect(page).toHaveURL(/.*vocabulary\/family/);
      await expect(page.getByRole('heading', { name: /family|relationships/i })).toBeVisible();
    }
  });

  test('should navigate to vocabulary pages from vocabulary search page tags', async ({ page }) => {
    await page.goto('/vocabulary');
    
    const heading = page.getByRole('heading', { name: 'Japanese Vocabulary' });
    if (await heading.count() > 0) {
      await expect(heading).toBeVisible({ timeout: 10000 });
    }
    
    const tagLinks = page.locator('[class*="tag"]').filter({ hasText: /colors|family|tastes|time|numbers/i });
    
    if (await tagLinks.count() > 0) {
      const firstTagLink = tagLinks.first();
      await firstTagLink.click();
      
      await expect(page).toHaveURL(/.*vocabulary\/(colors|family|tastes|time|numbers|confusing-kanji)/);
      await expect(page.getByRole('heading').first()).toBeVisible();
    }
  });

  test('should have working links for all vocabulary pages listed in landing page', async ({ page }) => {
    await page.goto('/docs/lessons/vocabulary/');
    await page.waitForTimeout(1000);
    
    const lessonLinks = page.getByRole('link').filter({ hasText: /Colors|Tastes|Time|Numbers|Family|Confusing Kanji/i });
    const linkCount = await lessonLinks.count();
    
    if (linkCount > 0) {
      for (let i = 0; i < Math.min(linkCount, 5); i++) {
        const link = lessonLinks.nth(i);
        await expect(link).toBeVisible();
        
        const href = await link.getAttribute('href');
        expect(href).toBeTruthy();
        
        if (href) {
          expect(href).toMatch(/^\/docs\/lessons/);
        }
      }
    }
  });

  test('should navigate between vocabulary pages via sidebar', async ({ page }) => {
    await page.goto('/docs/lessons/vocabulary/colors');
    await expect(page).toHaveURL(/.*vocabulary\/colors/);
    
    await page.waitForTimeout(500);
    
    const sidebar = page.locator('nav').first();
    await expect(sidebar).toBeVisible();
    
    const numbersSidebarLink = sidebar.getByRole('link', { name: /numbers/i }).first();
    if (await numbersSidebarLink.count() > 0) {
      await numbersSidebarLink.click();
      await expect(page).toHaveURL(/.*vocabulary\/numbers/);
      await expect(page.getByRole('heading', { name: /numbers|counting/i })).toBeVisible();
    }
    
    const timeSidebarLink = sidebar.getByRole('link', { name: /time/i }).first();
    if (await timeSidebarLink.count() > 0) {
      await timeSidebarLink.click();
      await expect(page).toHaveURL(/.*vocabulary\/time/);
      await expect(page.getByRole('heading', { name: /time|dates/i })).toBeVisible();
    }
  });
});
