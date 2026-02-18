import { expect, test, type Page } from '@playwright/test';
import { verifyPageIsFound, navigateViaTag } from './helpers/pageHelper';

const VOCAB_TAGS = [
  { name: 'Colors', href: '/vocabulary/colors', heading: /colors/i },
  { name: 'Tastes', href: '/vocabulary/tastes', heading: /tastes/i },
  { name: 'Time',   href: '/vocabulary/time',   heading: /time/i },
];

const GRAMMAR_TAGS = [
  { name: 'Experience', href: '/grammar/experience', heading: /experience/i },
  { name: 'Advice',     href: '/grammar/advice',     heading: /advice/i },
  { name: 'Comparison', href: '/grammar/comparison', heading: /comparison/i },
  { name: 'Desire',     href: '/grammar/desire',     heading: /desire/i },
  { name: 'Excess',     href: '/grammar/excess',     heading: /excess|too much/i },
];

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
    for (const { name, href, heading } of VOCAB_TAGS) {
      test(`should navigate to ${name} from tag`, async ({ page }) => {
        await navigateViaTag(page, href, heading);
      });
    }

    test('should navigate to Family from tag', async ({ page }) => {
      await page.waitForSelector('a[class*="tag"]', { timeout: 15000 });

      const familyTag = page.locator('a[class*="tag"]').filter({ hasText: /^family$/i }).first();
      await expect(familyTag).toBeVisible({ timeout: 10000 });
      await familyTag.click();
      await page.waitForLoadState('networkidle');
      await expect(page.locator('a[class*="tag"]').filter({ hasText: /^family$/i }).first()).toBeVisible();
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
    for (const { name, href, heading } of GRAMMAR_TAGS) {
      test(`should navigate to ${name} grammar lesson from tag`, async ({ page }) => {
        await navigateViaTag(page, href, heading);
      });
    }

    test('grammar tags should NOT link to vocabulary folder', async ({ page }) => {
      await page.waitForSelector('a[class*="tag"]', { timeout: 15000 });

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

  test.describe('Vocabulary Tags - Time Lessons', () => {
    test('tomorrow (ashita) should have a days-and-weeks tag', async ({ page }) => {
      const searchInput = page.getByPlaceholder('Search vocabulary...');

      await searchInput.fill('ashita');
      await searchInput.press('Enter');

      await page.waitForTimeout(500);

      const vocabularyCard = page.locator('[class*="vocabularyCard"]').filter({ hasText: 'tomorrow' }).first();
      await expect(vocabularyCard).toBeVisible();

      const tags = vocabularyCard.locator('a[class*="tag"]');
      const tagCount = await tags.count();
      expect(tagCount).toBeGreaterThanOrEqual(1);

      await expect(vocabularyCard.locator('a[class*="tag"]').filter({ hasText: 'days-and-weeks' })).toBeVisible();
    });

    test('next week (raishuu) should have a days-and-weeks tag', async ({ page }) => {
      const searchInput = page.getByPlaceholder('Search vocabulary...');

      await searchInput.fill('raishuu');
      await searchInput.press('Enter');

      await page.waitForTimeout(500);

      const vocabularyCard = page.locator('[class*="vocabularyCard"]').filter({ hasText: 'next week' }).first();
      await expect(vocabularyCard).toBeVisible();

      const tags = vocabularyCard.locator('a[class*="tag"]');
      const tagCount = await tags.count();
      expect(tagCount).toBeGreaterThanOrEqual(1);
      await expect(vocabularyCard.locator('a[class*="tag"]').filter({ hasText: 'days-and-weeks' })).toBeVisible();
    });

    test('tags should link to correct lessons', async ({ page }) => {
      const searchInput = page.getByPlaceholder('Search vocabulary...');

      await searchInput.fill('ashita');
      await searchInput.press('Enter');

      await page.waitForTimeout(500);

      const vocabularyCard = page.locator('[class*="vocabularyCard"]').filter({ hasText: 'tomorrow' }).first();
      await expect(vocabularyCard).toBeVisible();

      const daysTag = vocabularyCard.locator('a[class*="tag"]').filter({ hasText: 'days-and-weeks' });
      await expect(daysTag).toBeVisible();
      const daysHref = await daysTag.getAttribute('href');
      expect(daysHref).toContain('/vocabulary/time/days-and-weeks');
    });

    test('clicking tag navigates to correct lesson', async ({ page }) => {
      const searchInput = page.getByPlaceholder('Search vocabulary...');

      await searchInput.fill('ashita');
      await searchInput.press('Enter');

      await page.waitForTimeout(500);

      const vocabularyCard = page.locator('[class*="vocabularyCard"]').filter({ hasText: 'tomorrow' }).first();
      await expect(vocabularyCard).toBeVisible();

      const daysTag = vocabularyCard.locator('a[class*="tag"]').filter({ hasText: 'days-and-weeks' });
      await expect(daysTag).toBeVisible();
      await daysTag.click();

      await verifyPageIsFound(page);
      await expect(page.getByRole('heading', { name: /days and weeks/i }).first()).toBeVisible();
    });
  });

  test.describe('Vocabulary Tags - Miru', () => {
    const findMiruCard = async (page: Page) => {
      const searchInput = page.getByPlaceholder('Search vocabulary...');
      await searchInput.fill('miru');
      await searchInput.press('Enter');
      await page.waitForTimeout(500);

      const vocabularyCard = page.locator('[class*="vocabularyCard"]').filter({ hasText: 'to see' }).first();
      await expect(vocabularyCard).toBeVisible();
      return vocabularyCard;
    };

    test('miru should show dictionary-form, confusing-kanji, and N5 tags', async ({ page }) => {
      const vocabularyCard = await findMiruCard(page);

      const dictionaryFormTag = vocabularyCard.locator('a[class*="tag"]').filter({ hasText: /^dictionary-form$/i });
      const confusingKanjiTag = vocabularyCard.locator('a[class*="tag"]').filter({ hasText: /^confusing-kanji$/i });
      const n5Tag = vocabularyCard.locator('a[class*="tag"]').filter({ hasText: /^N5$/ });

      await expect(dictionaryFormTag).toBeVisible();
      await expect(confusingKanjiTag).toBeVisible();
      await expect(n5Tag).toBeVisible();

      await expect(dictionaryFormTag).toHaveAttribute('href', /\/docs\/lessons\/conjugation\/dictionary-form$/);
      await expect(confusingKanjiTag).toHaveAttribute('href', /\/docs\/lessons\/vocabulary\/confusing-kanji$/);
      await expect(n5Tag).toHaveAttribute('href', /\/docs\/reference\/n5-vocabulary$/);
    });

    test('miru tags should redirect to the correct pages', async ({ page }) => {
      let vocabularyCard = await findMiruCard(page);

      const dictionaryFormTag = vocabularyCard.locator('a[class*="tag"]').filter({ hasText: /^dictionary-form$/i });
      await dictionaryFormTag.click();
      await verifyPageIsFound(page);
      await expect(page).toHaveURL(/\/docs\/lessons\/conjugation\/dictionary-form/);

      await page.goto('./dictionary');
      await page.waitForLoadState('networkidle');
      vocabularyCard = await findMiruCard(page);
      const confusingKanjiTag = vocabularyCard.locator('a[class*="tag"]').filter({ hasText: /^confusing-kanji$/i });
      await confusingKanjiTag.click();
      await verifyPageIsFound(page);
      await expect(page).toHaveURL(/\/docs\/lessons\/vocabulary\/confusing-kanji/);
      await expect(page.getByRole('heading', { name: /confusing kanji/i }).first()).toBeVisible();

      await page.goto('./dictionary');
      await page.waitForLoadState('networkidle');
      vocabularyCard = await findMiruCard(page);
      const n5Tag = vocabularyCard.locator('a[class*="tag"]').filter({ hasText: /^N5$/ });
      await n5Tag.click();
      await verifyPageIsFound(page);
      await expect(page).toHaveURL(/\/docs\/reference\/n5-vocabulary/);
      await expect(page.getByRole('heading', { name: /n5 vocabulary reference/i }).first()).toBeVisible();
    });
  });
});
