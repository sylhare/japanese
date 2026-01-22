import { expect, test } from '@playwright/test';
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

  test.describe('Tag Navigation - Vocabulary', () => {
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

      const familyTag = page.locator('a[class*="tag"]').filter({ hasText: /^family$/i }).first();
      await expect(familyTag).toBeVisible({ timeout: 10000 });
      await familyTag.click();
      await page.waitForLoadState('networkidle');
      await expect(page.locator('a[class*="tag"]').filter({ hasText: /^family$/i }).first()).toBeVisible();
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

      const timeTag = page.locator('a[class*="tag"][href*="/vocabulary/time"]').first();
      await expect(timeTag).toBeVisible({ timeout: 10000 });
      await timeTag.click();
      await verifyPageIsFound(page);
      await expect(page.getByRole('heading', { name: /time/i }).first()).toBeVisible();
    });

    test('should have functional tag filtering', async ({ page }) => {
      await page.waitForSelector('a[class*="tag"]', { timeout: 15000 });

      const allTags = page.locator('a[class*="tag"]');
      const tagCount = await allTags.count();
      expect(tagCount).toBeGreaterThan(0);

      const firstTag = allTags.first();
      await expect(firstTag).toBeVisible();
      await firstTag.click();
      await page.waitForLoadState('networkidle');
      
      await verifyPageIsFound(page);
    });
  });

  test.describe('Tag Navigation - Grammar', () => {
    test('should navigate to Experience grammar lesson from tag', async ({ page }) => {
      await page.waitForSelector('a[class*="tag"]', { timeout: 15000 });

      const experienceTag = page.locator('a[class*="tag"][href$="/grammar/experience"]').first();
      await expect(experienceTag).toBeVisible({ timeout: 10000 });
      await experienceTag.click();
      await verifyPageIsFound(page);
      await expect(page.getByRole('heading', { name: /experience/i }).first()).toBeVisible();
    });

    test('should navigate to Advice grammar lesson from tag', async ({ page }) => {
      await page.waitForSelector('a[class*="tag"]', { timeout: 15000 });

      const adviceTag = page.locator('a[class*="tag"][href$="/grammar/advice"]').first();
      await expect(adviceTag).toBeVisible({ timeout: 10000 });
      await adviceTag.click();
      await verifyPageIsFound(page);
      await expect(page.getByRole('heading', { name: /advice/i }).first()).toBeVisible();
    });

    test('should navigate to Comparison grammar lesson from tag', async ({ page }) => {
      await page.waitForSelector('a[class*="tag"]', { timeout: 15000 });

      const comparisonTag = page.locator('a[class*="tag"][href$="/grammar/comparison"]').first();
      await expect(comparisonTag).toBeVisible({ timeout: 10000 });
      await comparisonTag.click();
      await verifyPageIsFound(page);
      await expect(page.getByRole('heading', { name: /comparison/i }).first()).toBeVisible();
    });

    test('should navigate to Desire grammar lesson from tag', async ({ page }) => {
      await page.waitForSelector('a[class*="tag"]', { timeout: 15000 });

      const desireTag = page.locator('a[class*="tag"][href$="/grammar/desire"]').first();
      await expect(desireTag).toBeVisible({ timeout: 10000 });
      await desireTag.click();
      await verifyPageIsFound(page);
      await expect(page.getByRole('heading', { name: /desire/i }).first()).toBeVisible();
    });

    test('should navigate to Excess grammar lesson from tag', async ({ page }) => {
      await page.waitForSelector('a[class*="tag"]', { timeout: 15000 });

      const excessTag = page.locator('a[class*="tag"][href$="/grammar/excess"]').first();
      await expect(excessTag).toBeVisible({ timeout: 10000 });
      await excessTag.click();
      await verifyPageIsFound(page);
      await expect(page.getByRole('heading', { name: /excess|too much/i }).first()).toBeVisible();
    });

    test('grammar tags should NOT link to vocabulary folder', async ({ page }) => {
      await page.waitForSelector('a[class*="tag"]', { timeout: 15000 });

      // Verify grammar tags have correct href (grammar/, not vocabulary/)
      const grammarTags = ['experience', 'advice', 'comparison', 'desire', 'excess'];
      
      for (const tag of grammarTags) {
        const tagElement = page.locator(`a[class*="tag"]`).filter({ hasText: new RegExp(`^${tag}$`, 'i') }).first();
        if (await tagElement.isVisible()) {
          const href = await tagElement.getAttribute('href');
          expect(href).toContain('/grammar/');
          expect(href).not.toContain('/vocabulary/');
        }
      }
    });
  });

  test.describe('Merged Tags - Vocabulary in Multiple Lessons', () => {
    test('tomorrow (ashita) should have tags from multiple lessons', async ({ page }) => {
      const searchInput = page.getByPlaceholder('Search vocabulary...');

      await searchInput.fill('ashita');
      await searchInput.press('Enter');

      await page.waitForTimeout(500);

      // Find the vocabulary card for "tomorrow"
      const vocabularyCard = page.locator('[class*="vocabularyCard"]').filter({ hasText: 'tomorrow' }).first();
      await expect(vocabularyCard).toBeVisible();

      // Verify it has multiple tags (should have days-and-weeks, future, and time)
      const tags = vocabularyCard.locator('a[class*="tag"]');
      const tagCount = await tags.count();
      expect(tagCount).toBeGreaterThanOrEqual(2);

      // Verify specific tags exist
      await expect(vocabularyCard.locator('a[class*="tag"]').filter({ hasText: 'future' })).toBeVisible();
      await expect(vocabularyCard.locator('a[class*="tag"]').filter({ hasText: /days-and-weeks|time/i })).toBeVisible();
    });

    test('next week (raishuu) should have tags from multiple lessons', async ({ page }) => {
      const searchInput = page.getByPlaceholder('Search vocabulary...');

      await searchInput.fill('raishuu');
      await searchInput.press('Enter');

      await page.waitForTimeout(500);

      // Find the vocabulary card for "next week"
      const vocabularyCard = page.locator('[class*="vocabularyCard"]').filter({ hasText: 'next week' }).first();
      await expect(vocabularyCard).toBeVisible();

      // Verify it has multiple tags
      const tags = vocabularyCard.locator('a[class*="tag"]');
      const tagCount = await tags.count();
      expect(tagCount).toBeGreaterThanOrEqual(2);
    });

    test('merged tags should link to correct lessons', async ({ page }) => {
      const searchInput = page.getByPlaceholder('Search vocabulary...');

      await searchInput.fill('ashita');
      await searchInput.press('Enter');

      await page.waitForTimeout(500);

      const vocabularyCard = page.locator('[class*="vocabularyCard"]').filter({ hasText: 'tomorrow' }).first();
      await expect(vocabularyCard).toBeVisible();

      // Verify future tag links to conjugation lesson
      const futureTag = vocabularyCard.locator('a[class*="tag"]').filter({ hasText: 'future' });
      await expect(futureTag).toBeVisible();
      const futureHref = await futureTag.getAttribute('href');
      expect(futureHref).toContain('/conjugation/future');

      // Verify days-and-weeks tag links to vocabulary/time lesson
      const daysTag = vocabularyCard.locator('a[class*="tag"]').filter({ hasText: 'days-and-weeks' });
      if (await daysTag.isVisible()) {
        const daysHref = await daysTag.getAttribute('href');
        expect(daysHref).toContain('/vocabulary/time/days-and-weeks');
      }
    });

    test('clicking merged tag navigates to correct lesson', async ({ page }) => {
      const searchInput = page.getByPlaceholder('Search vocabulary...');

      await searchInput.fill('ashita');
      await searchInput.press('Enter');

      await page.waitForTimeout(500);

      const vocabularyCard = page.locator('[class*="vocabularyCard"]').filter({ hasText: 'tomorrow' }).first();
      await expect(vocabularyCard).toBeVisible();

      // Click on the future tag and verify navigation
      const futureTag = vocabularyCard.locator('a[class*="tag"]').filter({ hasText: 'future' });
      await expect(futureTag).toBeVisible();
      await futureTag.click();

      await verifyPageIsFound(page);
      await expect(page.getByRole('heading', { name: /future/i }).first()).toBeVisible();
    });
  });
});
