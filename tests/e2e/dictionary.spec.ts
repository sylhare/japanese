import { test, expect } from '@playwright/test';
import { verifyPageIsFound } from './helpers/pageHelper';

test.describe('Dictionary', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('./dictionary');
    await page.waitForLoadState('networkidle');
  });

  test.describe('Dictionary Search', () => {
    test('should navigate to dictionary page from home page', async ({ page }) => {
      await page.goto('/');
      
      const dictionaryLink = page.getByRole('link', { name: /dictionary/i });
      
      await dictionaryLink.first().click();
      await expect(page).toHaveURL(/.*dictionary/);
      
      await expect(page).toHaveTitle(/Vocabulary.*Japanese Lessons/);
      await expect(page.getByRole('heading', { name: 'Japanese Vocabulary' })).toBeVisible();
      
      const searchInput = page.getByPlaceholder('Search vocabulary...');
      await expect(searchInput).toBeVisible();
      
      const vocabularyCards = page.locator('[class*="vocabularyCard"]');
      await expect(vocabularyCards.first()).toBeVisible();
    });

    test('should search for vocabulary by English meaning', async ({ page }) => {
      const searchInput = page.getByPlaceholder('Search vocabulary...');
      
      await searchInput.fill('red');
      await searchInput.press('Enter');
      
      await page.waitForTimeout(500);
      
      const vocabularyCards = page.locator('[class*="vocabularyCard"]');
      await expect(vocabularyCards.first()).toBeVisible();
      
      await expect(page.locator('[class*="meaning"]').filter({ hasText: 'red' }).first()).toBeVisible();
    });

    test('should search for vocabulary by hiragana', async ({ page }) => {
      const searchInput = page.getByPlaceholder('Search vocabulary...');
      
      await searchInput.fill('あか');
      await searchInput.press('Enter');
      
      await page.waitForTimeout(500);
      
      const vocabularyCards = page.locator('[class*="vocabularyCard"]');
      await expect(vocabularyCards.first()).toBeVisible();
      
      await expect(page.locator('[class*="hiragana"]').filter({ hasText: 'あか' }).first()).toBeVisible();
    });

    test('should search for vocabulary by romaji', async ({ page }) => {
      const searchInput = page.getByPlaceholder('Search vocabulary...');
      
      await searchInput.fill('aka');
      await searchInput.press('Enter');
      
      await page.waitForTimeout(500);
      
      const vocabularyCards = page.locator('[class*="vocabularyCard"]');
      await expect(vocabularyCards.first()).toBeVisible();
      
      await expect(page.locator('[class*="romaji"]').filter({ hasText: 'aka' }).first()).toBeVisible();
    });

    test('should filter vocabulary by category', async ({ page }) => {
      const categorySelect = page.locator('select').first();
      await expect(categorySelect).toBeVisible();
      
      await categorySelect.selectOption('vocabulary');
      
      await page.waitForTimeout(500);
      
      const vocabularyCards = page.locator('[class*="vocabularyCard"]');
      await expect(vocabularyCards.first()).toBeVisible();
    });

    test('should sort vocabulary by different options', async ({ page }) => {
      const sortSelect = page.locator('select').nth(1);
      await expect(sortSelect).toBeVisible();
      
      await sortSelect.selectOption('romaji');
      
      await page.waitForTimeout(500);
      
      const vocabularyCards = page.locator('[class*="vocabularyCard"]');
      await expect(vocabularyCards.first()).toBeVisible();
    });

    test('should show no results message when search yields no matches', async ({ page }) => {
      const searchInput = page.getByPlaceholder('Search vocabulary...');
      
      await searchInput.fill('nonexistentword12345');
      await searchInput.press('Enter');
      
      await page.waitForTimeout(500);
      
      await expect(page.getByText('No vocabulary found')).toBeVisible();
      await expect(page.getByText('Try adjusting your search terms or filters.')).toBeVisible();
    });

    test('should display vocabulary cards with all required elements', async ({ page }) => {
      const vocabularyCards = page.locator('[class*="vocabularyCard"]');
      await expect(vocabularyCards.first()).toBeVisible();
      
      const firstCard = vocabularyCards.first();
      
      await expect(firstCard.locator('[class*="japanese"]')).toBeVisible();
      
      await expect(firstCard.locator('[class*="romaji"]')).toBeVisible();
      
      await expect(firstCard.locator('[class*="meaning"]')).toBeVisible();
    });
  });

  test.describe('Tag Navigation', () => {
    test('should navigate to Colors from tag', async ({ page }) => {
      await page.waitForSelector('a[class*="tag"]', { timeout: 15000 });
      
      const colorsTag = page.locator('a[class*="tag"][href$="/vocabulary/colors"]').first();
      await expect(colorsTag).toBeVisible({ timeout: 10000 });
      await colorsTag.click();
      await verifyPageIsFound(page);
      await expect(page.getByRole('heading', { name: /colors/i }).first()).toBeVisible();
    });

    test('should navigate to Family from tag', async ({ page }) => {
      await page.waitForSelector('a[class*="tag"]', { timeout: 15000 });
      
      const familyTag = page.locator('a[class*="tag"][href$="/vocabulary/family"]').first();
      await expect(familyTag).toBeVisible({ timeout: 10000 });
      await familyTag.click();
      await verifyPageIsFound(page);
      await expect(page.getByRole('heading', { name: /family/i }).first()).toBeVisible();
    });

    test('should navigate to Tastes from tag', async ({ page }) => {
      await page.waitForSelector('a[class*="tag"]', { timeout: 15000 });
      
      const tastesTag = page.locator('a[class*="tag"][href$="/vocabulary/tastes"]').first();
      await expect(tastesTag).toBeVisible({ timeout: 10000 });
      await tastesTag.click();
      await verifyPageIsFound(page);
      await expect(page.getByRole('heading', { name: /tastes/i }).first()).toBeVisible();
    });

    test('should navigate to Time from tag', async ({ page }) => {
      await page.waitForSelector('a[class*="tag"]', { timeout: 15000 });
      
      const timeTag = page.locator('a[class*="tag"][href$="/vocabulary/time"]').first();
      await expect(timeTag).toBeVisible({ timeout: 10000 });
      await timeTag.click();
      await verifyPageIsFound(page);
      await expect(page.getByRole('heading', { name: /time/i }).first()).toBeVisible();
    });

    test('should navigate to Numbers from tag', async ({ page }) => {
      await page.waitForSelector('a[class*="tag"]', { timeout: 15000 });
      
      const numbersTag = page.locator('a[class*="tag"][href$="/vocabulary/numbers"]').first();
      await expect(numbersTag).toBeVisible({ timeout: 10000 });
      await numbersTag.click();
      await verifyPageIsFound(page);
      await expect(page.getByRole('heading', { name: /numbers/i }).first()).toBeVisible();
    });
  });
});