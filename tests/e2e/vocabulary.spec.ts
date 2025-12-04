import { expect, test } from '@playwright/test';
import { verifyPageIsFound } from './helpers/pageHelper';

test.describe('Vocabulary Pages', () => {
  test.describe('Vocabulary Landing Page', () => {
    test('should load vocabulary index page', async ({ page }) => {
      await page.goto('./docs/lessons/vocabulary/');
      await page.waitForLoadState('networkidle');
      await verifyPageIsFound(page);
      await expect(page.getByRole('heading', { name: /vocabulary/i }).first()).toBeVisible();
    });
  });

  test.describe('Vocabulary Landing Page Navigation', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('./docs/lessons/vocabulary/');
      await page.waitForLoadState('networkidle');
    });

    test.describe('Sidebar Links', () => {
      test('should navigate to Colors from sidebar', async ({ page }) => {
        const colorsLink = page.locator('a.menu__link[href$="/vocabulary/colors"]').first();
        await expect(colorsLink).toBeVisible();
        await colorsLink.click();
        await verifyPageIsFound(page);
        await expect(page.getByRole('heading', { name: /colors/i }).first()).toBeVisible();
      });

      test('should navigate to Tastes from sidebar', async ({ page }) => {
        const tastesLink = page.locator('a.menu__link[href$="/vocabulary/tastes"]').first();
        await expect(tastesLink).toBeVisible();
        await tastesLink.click();
        await verifyPageIsFound(page);
        await expect(page.getByRole('heading', { name: /tastes|flavors/i }).first()).toBeVisible();
      });

      test('should navigate to Time from sidebar', async ({ page }) => {
        const timeLink = page.locator('a.menu__link[href*="/vocabulary/time"]').first();
        await expect(timeLink).toBeVisible();
        await timeLink.click();
        await verifyPageIsFound(page);
        await expect(page.getByRole('heading', { name: /time|dates/i }).first()).toBeVisible();
      });

      test('should navigate to Numbers from sidebar', async ({ page }) => {
        const numbersLink = page.locator('a.menu__link[href*="/vocabulary/numbers"]').first();
        await expect(numbersLink).toBeVisible();
        await numbersLink.click();
        await verifyPageIsFound(page);
        await expect(page.getByRole('heading', { name: /numbers|counting/i }).first()).toBeVisible();
      });

      test('should navigate to Family from sidebar', async ({ page }) => {
        const familyLink = page.locator('a.menu__link[href$="/vocabulary/family"]').first();
        await expect(familyLink).toBeVisible();
        await familyLink.click();
        await verifyPageIsFound(page);
        await expect(page.getByRole('heading', { name: /family|relationships/i }).first()).toBeVisible();
      });

      test('should navigate to Confusing Kanji from sidebar', async ({ page }) => {
        const kanjiLink = page.locator('a.menu__link[href$="/vocabulary/confusing-kanji"]').first();
        await expect(kanjiLink).toBeVisible();
        await kanjiLink.click();
        await verifyPageIsFound(page);
        await expect(page.getByRole('heading', { name: /confusing kanji/i }).first()).toBeVisible();
      });
    });

    test.describe('Landing Page Cards (LessonList)', () => {
      test('should navigate to Colors from landing page', async ({ page }) => {
        const colorsCard = page.locator('a[class*="lessonCard"][href$="/vocabulary/colors"]').first();
        await expect(colorsCard).toBeVisible();
        await colorsCard.click();
        await verifyPageIsFound(page);
        await expect(page.getByRole('heading', { name: /colors/i }).first()).toBeVisible();
      });

      test('should navigate to Tastes from landing page', async ({ page }) => {
        const tastesCard = page.locator('a[class*="lessonCard"][href$="/vocabulary/tastes"]').first();
        await expect(tastesCard).toBeVisible();
        await tastesCard.click();
        await verifyPageIsFound(page);
        await expect(page.getByRole('heading', { name: /tastes|flavors/i }).first()).toBeVisible();
      });

      test('should navigate to Time from landing page', async ({ page }) => {
        const timeCard = page.locator('a[class*="lessonCard"][href*="/vocabulary/time"]').first();
        await expect(timeCard).toBeVisible();
        await timeCard.click();
        await verifyPageIsFound(page);
        await expect(page.getByRole('heading', { name: /time|dates/i }).first()).toBeVisible();
      });

      test('should navigate to Numbers from landing page', async ({ page }) => {
        const numbersCard = page.locator('a[class*="lessonCard"][href*="/vocabulary/numbers"]').first();
        await expect(numbersCard).toBeVisible();
        await numbersCard.click();
        await verifyPageIsFound(page);
        await expect(page.getByRole('heading', { name: /numbers|counting/i }).first()).toBeVisible();
      });

      test('should navigate to Family from landing page', async ({ page }) => {
        const familyCard = page.locator('a[class*="lessonCard"][href$="/vocabulary/family"]').first();
        await expect(familyCard).toBeVisible();
        await familyCard.click();
        await verifyPageIsFound(page);
        await expect(page.getByRole('heading', { name: /family|relationships/i }).first()).toBeVisible();
      });

      test('should navigate to Confusing Kanji from landing page', async ({ page }) => {
        const kanjiCard = page.locator('a[class*="lessonCard"][href$="/vocabulary/confusing-kanji"]').first();
        await expect(kanjiCard).toBeVisible();
        await kanjiCard.click();
        await verifyPageIsFound(page);
        await expect(page.getByRole('heading', { name: /confusing kanji/i }).first()).toBeVisible();
      });
    });

    test.describe('Link Validation', () => {
      test('should have valid href attributes for all vocabulary sidebar links', async ({ page }) => {
        const vocabularyLinks = page.locator('a.menu__link[href$="/vocabulary/"]');
        const linkCount = await vocabularyLinks.count();

        expect(linkCount).toBeGreaterThan(0);

        for (let i = 0; i < linkCount; i++) {
          const link = vocabularyLinks.nth(i);
          const href = await link.getAttribute('href');
          expect(href).toBeTruthy();
          expect(href).toMatch(/vocabulary\//);
        }
      });

      test('should have valid href attributes for all vocabulary card links', async ({ page }) => {
        const cardLinks = page.locator('a[class*="lessonCard"]');
        const linkCount = await cardLinks.count();

        expect(linkCount).toBeGreaterThan(0);

        for (let i = 0; i < linkCount; i++) {
          const link = cardLinks.nth(i);
          await expect(link).toBeVisible();

          const href = await link.getAttribute('href');
          expect(href).toBeTruthy();
          expect(href).toMatch(/\/(docs\/lessons|japanese\/docs\/lessons)/);
        }
      });
    });

    test.describe('Expected Failures', () => {
      test('should fail when navigating to non-existent page', async ({ page }) => {
        test.fail();
        await page.goto('./docs/lessons/vocabulary/this-page-does-not-exist');
        await verifyPageIsFound(page);
      });
    });
  });
});
