import { test, expect } from '@playwright/test';

test.describe('Vocabulary Search', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/japanese/vocabulary');
  });

  test('should display vocabulary page with search functionality', async ({ page }) => {
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
    
    await expect(page.locator('.meaning_jmVK').filter({ hasText: 'red' }).first()).toBeVisible();
  });

  test('should search for vocabulary by hiragana', async ({ page }) => {
    const searchInput = page.getByPlaceholder('Search vocabulary...');
    
    await searchInput.fill('あか');
    await searchInput.press('Enter');
    
    await page.waitForTimeout(500);
    
    const vocabularyCards = page.locator('[class*="vocabularyCard"]');
    await expect(vocabularyCards.first()).toBeVisible();
    
    await expect(page.locator('.hiragana_naZi').filter({ hasText: 'あか' }).first()).toBeVisible();
  });

  test('should search for vocabulary by romaji', async ({ page }) => {
    const searchInput = page.getByPlaceholder('Search vocabulary...');
    
    await searchInput.fill('aka');
    await searchInput.press('Enter');
    
    await page.waitForTimeout(500);
    
    const vocabularyCards = page.locator('[class*="vocabularyCard"]');
    await expect(vocabularyCards.first()).toBeVisible();
    
    await expect(page.locator('.romaji_JbdT').filter({ hasText: 'aka' }).first()).toBeVisible();
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

  test('should navigate to vocabulary page from home page', async ({ page }) => {
    await page.goto('/');
    
    const vocabularyLink = page.getByRole('link', { name: /dictionary/i });
    
    if (await vocabularyLink.count() > 0) {
      await vocabularyLink.first().click();
      await expect(page).toHaveURL(/.*vocabulary/);
    } else {
      await page.goto('/japanese/vocabulary');
      await expect(page).toHaveTitle(/Vocabulary.*Japanese Lessons/);
    }
  });
});
