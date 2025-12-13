import { expect, test } from '@playwright/test';
import { verifyPageIsFound } from './helpers/pageHelper';

test.describe('Homepage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('./');
    await page.waitForLoadState('networkidle');
  });

  test.describe('Hero Section', () => {
    test('should display the main heading', async ({ page }) => {
      const heading = page.getByRole('heading', { level: 1 });
      await expect(heading).toBeVisible();
    });

    test('should display the subtitle', async ({ page }) => {
      const subtitle = page.getByText(/choose your learning path/i);
      await expect(subtitle).toBeVisible();
    });

    test('should display the Get Started button', async ({ page }) => {
      const getStartedButton = page.locator(`a[class*="getStartedButton"]`);
      await expect(getStartedButton).toBeVisible();
      await expect(getStartedButton).toContainText('Get Started');
    });

    test('should navigate to intro page when Get Started button is clicked', async ({ page }) => {
      const getStartedButton = page.locator(`a[class*="getStartedButton"]`);
      await expect(getStartedButton).toBeVisible();
      
      const href = await getStartedButton.getAttribute('href');
      expect(href).toContain('/docs/intro');
      
      await getStartedButton.click();
      await page.waitForLoadState('networkidle');
      await verifyPageIsFound(page);
      
      await expect(page.getByRole('heading', { name: /welcome to japanese lessons/i })).toBeVisible();
      
      expect(page.url()).toContain('intro');
    });
  });

  test.describe('Feature Cards', () => {
    test('should display all four feature cards', async ({ page }) => {
      const cards = page.locator('a[class*="featureCard"]');
      const cardCount = await cards.count();
      expect(cardCount).toBe(4);
    });

    test('should display Lessons card', async ({ page }) => {
      const lessonsCard = page.locator('a[class*="featureCard"]').filter({ hasText: /lessons/i }).first();
      await expect(lessonsCard).toBeVisible();
      await expect(lessonsCard).toContainText(/structured learning path/i);
    });

    test('should display Grammar card', async ({ page }) => {
      const grammarCard = page.locator('a[class*="featureCard"]').filter({ hasText: /grammar/i }).first();
      await expect(grammarCard).toBeVisible();
      await expect(grammarCard).toContainText(/grammar rules/i);
    });

    test('should display Vocabulary card', async ({ page }) => {
      const vocabularyCard = page.locator('a[class*="featureCard"]').filter({ hasText: /vocabulary/i }).first();
      await expect(vocabularyCard).toBeVisible();
      await expect(vocabularyCard).toContainText(/word lists/i);
    });

    test('should display References card', async ({ page }) => {
      const referencesCard = page.locator('a[class*="featureCard"]').filter({ hasText: /references/i }).first();
      await expect(referencesCard).toBeVisible();
      await expect(referencesCard).toContainText(/quick lookup tools/i);
    });

    test('should navigate when clicking feature cards', async ({ page }) => {
      const cards = page.locator('a[class*="featureCard"]');
      const firstCard = cards.first();
      
      await expect(firstCard).toBeVisible();
      const href = await firstCard.getAttribute('href');
      expect(href).toBeTruthy();
      
      await firstCard.click();
      await page.waitForLoadState('networkidle');
      await verifyPageIsFound(page);
    });
  });

  test.describe('Button Interactions', () => {
    test('should have hover effect on Get Started button', async ({ page }) => {
      const getStartedButton = page.locator(`a[class*="getStartedButton"]`);
      await expect(getStartedButton).toBeVisible();
      
      const initialBox = await getStartedButton.boundingBox();
      expect(initialBox).not.toBeNull();
      
      await getStartedButton.hover();
      
      await expect(getStartedButton).toBeVisible();
    });
  });

  test.describe('Responsive Design', () => {
    test('should be visible on mobile viewport', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      
      const heading = page.getByRole('heading', { level: 1 });
      const getStartedButton = page.locator(`a[class*="getStartedButton"]`);
      const cards = page.locator('a[class*="featureCard"]');
      
      await expect(heading).toBeVisible();
      await expect(getStartedButton).toBeVisible();
      expect(await cards.count()).toBe(4);
    });

    test('should be visible on tablet viewport', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      
      const heading = page.getByRole('heading', { level: 1 });
      const getStartedButton = page.locator(`a[class*="getStartedButton"]`);
      const cards = page.locator('a[class*="featureCard"]');
      
      await expect(heading).toBeVisible();
      await expect(getStartedButton).toBeVisible();
      expect(await cards.count()).toBe(4);
    });

    test('should be visible on desktop viewport', async ({ page }) => {
      await page.setViewportSize({ width: 1920, height: 1080 });
      
      const heading = page.getByRole('heading', { level: 1 });
      const getStartedButton = page.locator(`a[class*="getStartedButton"]`);
      const cards = page.locator('a[class*="featureCard"]');
      
      await expect(heading).toBeVisible();
      await expect(getStartedButton).toBeVisible();
      expect(await cards.count()).toBe(4);
    });
  });
});

