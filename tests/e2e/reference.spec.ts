import { expect, test } from '@playwright/test';
import { verifyPageExists, verifyPageIsFound } from './helpers/pageHelper';

test.describe('Reference Pages', () => {
  test.describe('Main Page Reference Link', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('./');
      await page.waitForLoadState('networkidle');
    });

    test('should navigate to reference index from main page', async ({ page }) => {
      const referenceCard = page.locator('a[href="/docs/reference"], a[href="/japanese/docs/reference"]').first();
      await expect(referenceCard).toBeVisible();
      
      const cardTitle = referenceCard.locator('h3');
      await expect(cardTitle).toHaveText('References');
      
      await referenceCard.click();
      await verifyPageIsFound(page);
      
      await expect(page.getByRole('heading', { name: /kana reference/i }).first()).toBeVisible();
    });
  });

  test.describe('Reference Index Links', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('./docs/reference/');
      await page.waitForLoadState('networkidle');
    });

    test('should have working Hiragana Chart link', async ({ page }) => {
      const hiraganaLink = page.getByRole('link', { name: /View Hiragana Chart/i });
      await expect(hiraganaLink).toBeVisible();
      
      await hiraganaLink.click();
      await verifyPageIsFound(page);
      
      await expect(page.getByRole('heading', { name: /hiragana/i }).first()).toBeVisible();
    });

    test('should have working Katakana Chart link', async ({ page }) => {
      const katakanaLink = page.getByRole('link', { name: /View Katakana Chart/i });
      await expect(katakanaLink).toBeVisible();
      
      await katakanaLink.click();
      await verifyPageIsFound(page);
      
      await expect(page.getByRole('heading', { name: /katakana/i }).first()).toBeVisible();
    });

    test('should have working Dictionary link', async ({ page }) => {
      const dictionaryLink = page.getByRole('link', { name: /Open Dictionary/i });
      await expect(dictionaryLink).toBeVisible();
      
      await dictionaryLink.click();
      await page.waitForLoadState('networkidle');
      await verifyPageExists(page);
      
      await expect(page.getByRole('heading', { name: 'Japanese Vocabulary' })).toBeVisible();
      await expect(page.getByPlaceholder('Search vocabulary...')).toBeVisible();
      await expect(page.locator('[class*="vocabularyCard"]').first()).toBeVisible();
    });

    test('should display all three reference cards', async ({ page }) => {
      const hiraganaCard = page.locator('h3:has-text("Hiragana Chart")').locator('..');
      const katakanaCard = page.locator('h3:has-text("Katakana Chart")').locator('..');
      const dictionaryCard = page.locator('h3:has-text("Dictionary")').locator('..');
      
      await expect(hiraganaCard).toBeVisible();
      await expect(katakanaCard).toBeVisible();
      await expect(dictionaryCard).toBeVisible();
    });
  });

  test.describe('Reference Index Content', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('./docs/reference/');
      await page.waitForLoadState('networkidle');
    });

    test('should display page title and description', async ({ page }) => {
      await expect(page.getByRole('heading', { name: /kana reference/i }).first()).toBeVisible();
      await expect(page.getByRole('heading', { name: /what are kana/i })).toBeVisible();
    });

    test('should explain hiragana and katakana', async ({ page }) => {
      const content = await page.textContent('main');
      expect(content).toContain('Hiragana');
      expect(content).toContain('Katakana');
      expect(content).toContain('ひらがな');
      expect(content).toContain('カタカナ');
    });
  });

  test.describe('Navigation from Reference Pages', () => {
    test('should navigate from hiragana chart back to reference index', async ({ page }) => {
      await page.goto('./docs/reference/hiragana-chart');
      await page.waitForLoadState('networkidle');
      
      const referenceLink = page.locator('a.menu__link[href$="/reference/"]').first();
      await expect(referenceLink).toBeVisible();
      
      await referenceLink.click();
      await verifyPageIsFound(page);
      
      await expect(page.getByRole('heading', { name: /kana reference/i }).first()).toBeVisible();
    });

    test('should navigate from katakana chart back to reference index', async ({ page }) => {
      await page.goto('./docs/reference/katakana-chart');
      await page.waitForLoadState('networkidle');
      
      const referenceLink = page.locator('a.menu__link[href$="/reference/"]').first();
      await expect(referenceLink).toBeVisible();
      
      await referenceLink.click();
      await verifyPageIsFound(page);
      
      await expect(page.getByRole('heading', { name: /kana reference/i }).first()).toBeVisible();
    });
  });
});

