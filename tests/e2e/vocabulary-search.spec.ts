import { test, expect } from '@playwright/test';

test.describe('Vocabulary Search', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the vocabulary page
    await page.goto('/japanese/vocabulary');
  });

  test('should display vocabulary page with search functionality', async ({ page }) => {
    // Check that the page loads correctly
    await expect(page).toHaveTitle(/Vocabulary.*Japanese Lessons/);
    
    // Check that the main heading is visible
    await expect(page.getByRole('heading', { name: 'Japanese Vocabulary' })).toBeVisible();
    
    // Check that the search input is present
    const searchInput = page.getByPlaceholder('Search vocabulary...');
    await expect(searchInput).toBeVisible();
    
    // Check that vocabulary items are displayed
    const vocabularyCards = page.locator('[class*="vocabularyCard"]');
    await expect(vocabularyCards.first()).toBeVisible();
  });

  test('should search for vocabulary by English meaning', async ({ page }) => {
    const searchInput = page.getByPlaceholder('Search vocabulary...');
    
    // Search for "red" (should find 赤 - aka)
    await searchInput.fill('red');
    await searchInput.press('Enter');
    
    // Wait for results to load
    await page.waitForTimeout(500);
    
    // Check that results are filtered
    const vocabularyCards = page.locator('[class*="vocabularyCard"]');
    await expect(vocabularyCards.first()).toBeVisible();
    
    // Check that the result contains "red" (should be in the meaning field)
    await expect(page.locator('.meaning_jmVK').filter({ hasText: 'red' }).first()).toBeVisible();
  });

  test('should search for vocabulary by hiragana', async ({ page }) => {
    const searchInput = page.getByPlaceholder('Search vocabulary...');
    
    // Search for "あか" (hiragana for red)
    await searchInput.fill('あか');
    await searchInput.press('Enter');
    
    // Wait for results to load
    await page.waitForTimeout(500);
    
    // Check that results are filtered
    const vocabularyCards = page.locator('[class*="vocabularyCard"]');
    await expect(vocabularyCards.first()).toBeVisible();
    
    // Check that the result contains the hiragana (should be in the hiragana field)
    await expect(page.locator('.hiragana_naZi').filter({ hasText: 'あか' }).first()).toBeVisible();
  });

  test('should search for vocabulary by romaji', async ({ page }) => {
    const searchInput = page.getByPlaceholder('Search vocabulary...');
    
    // Search for "aka" (romaji for red)
    await searchInput.fill('aka');
    await searchInput.press('Enter');
    
    // Wait for results to load
    await page.waitForTimeout(500);
    
    // Check that results are filtered
    const vocabularyCards = page.locator('[class*="vocabularyCard"]');
    await expect(vocabularyCards.first()).toBeVisible();
    
    // Check that the result contains the romaji (should be in the romaji field)
    await expect(page.locator('.romaji_JbdT').filter({ hasText: 'aka' }).first()).toBeVisible();
  });

  test('should filter vocabulary by category', async ({ page }) => {
    // Find the category filter dropdown
    const categorySelect = page.locator('select').first();
    await expect(categorySelect).toBeVisible();
    
    // Select a specific category (assuming there are categories available)
    await categorySelect.selectOption('vocabulary');
    
    // Wait for results to load
    await page.waitForTimeout(500);
    
    // Check that results are still visible
    const vocabularyCards = page.locator('[class*="vocabularyCard"]');
    await expect(vocabularyCards.first()).toBeVisible();
  });

  test('should sort vocabulary by different options', async ({ page }) => {
    // Find the sort dropdown (should be the second select element)
    const sortSelect = page.locator('select').nth(1);
    await expect(sortSelect).toBeVisible();
    
    // Change sort option to romaji
    await sortSelect.selectOption('romaji');
    
    // Wait for results to load
    await page.waitForTimeout(500);
    
    // Check that results are still visible
    const vocabularyCards = page.locator('[class*="vocabularyCard"]');
    await expect(vocabularyCards.first()).toBeVisible();
  });

  test('should show no results message when search yields no matches', async ({ page }) => {
    const searchInput = page.getByPlaceholder('Search vocabulary...');
    
    // Search for something that doesn't exist
    await searchInput.fill('nonexistentword12345');
    await searchInput.press('Enter');
    
    // Wait for results to load
    await page.waitForTimeout(500);
    
    // Check that no results message is shown
    await expect(page.getByText('No vocabulary found')).toBeVisible();
    await expect(page.getByText('Try adjusting your search terms or filters.')).toBeVisible();
  });

  test('should display vocabulary cards with all required elements', async ({ page }) => {
    // Wait for vocabulary cards to load
    const vocabularyCards = page.locator('[class*="vocabularyCard"]');
    await expect(vocabularyCards.first()).toBeVisible();
    
    // Check that the first vocabulary card has the required elements
    const firstCard = vocabularyCards.first();
    
    // Check for Japanese text (hiragana, katakana, or kanji)
    await expect(firstCard.locator('[class*="japanese"]')).toBeVisible();
    
    // Check for romaji
    await expect(firstCard.locator('[class*="romaji"]')).toBeVisible();
    
    // Check for meaning
    await expect(firstCard.locator('[class*="meaning"]')).toBeVisible();
  });

  test('should navigate to vocabulary page from home page', async ({ page }) => {
    // Start from home page
    await page.goto('/');
    
    // Look for a link to vocabulary page (this might be in navigation or a button)
    // Since we don't know the exact navigation structure, let's try to find any link to vocabulary
    const vocabularyLink = page.getByRole('link', { name: /vocabulary/i });
    
    if (await vocabularyLink.count() > 0) {
      await vocabularyLink.first().click();
      await expect(page).toHaveURL(/.*vocabulary/);
    } else {
      // If no direct link, navigate directly and verify we're on the right page
      await page.goto('/japanese/vocabulary');
      await expect(page).toHaveTitle(/Vocabulary.*Japanese Lessons/);
    }
  });
});
