import { expect, test } from '@playwright/test';
import { verifyPageIsFound } from './helpers/pageHelper';

test.describe('Conjugation', () => {
  test.describe('Conjugation Landing Page', () => {
    test('should load conjugation index page', async ({ page }) => {
      await page.goto('./docs/lessons/conjugation/');
      await page.waitForLoadState('networkidle');
      await verifyPageIsFound(page);
      await expect(page.getByRole('heading', { name: /conjugation/i }).first()).toBeVisible();
    });
  });

  test.describe('Conjugation Lessons Navigation', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('./docs/lessons/conjugation/');
      await page.waitForLoadState('networkidle');
    });

    test.describe('Sidebar Links', () => {
      test('should navigate to Verb Conjugation Basics from sidebar', async ({ page }) => {
        const conjugationLink = page.locator('a.menu__link[href$="/conjugation/basics"]').first();
        await expect(conjugationLink).toBeVisible();
        await conjugationLink.click();
        await verifyPageIsFound(page);
        await expect(page.getByRole('heading', { name: /verb conjugation|conjugation/i }).first()).toBeVisible();
      });

      test('should navigate to Verb Conjugation Reference from sidebar', async ({ page }) => {
        const verbConjugationLink = page.locator('a.menu__link[href$="/conjugation/verb-conjugation"]').first();
        await expect(verbConjugationLink).toBeVisible();
        await verbConjugationLink.click();
        await verifyPageIsFound(page);
        await expect(page.getByRole('heading', { name: /verb conjugation reference/i }).first()).toBeVisible();
      });
    });

    test.describe('Landing Page Links (LessonList)', () => {
      test('should navigate to Verb Conjugation Basics from landing page', async ({ page }) => {
        const conjugationCard = page.locator('a[class*="lessonCard"][href$="/conjugation/basics"]').first();
        await expect(conjugationCard).toBeVisible();
        await conjugationCard.click();
        await verifyPageIsFound(page);
        await expect(page.getByRole('heading', { name: /verb conjugation|conjugation/i }).first()).toBeVisible();
      });

      test('should navigate to Verb Conjugation Reference from landing page', async ({ page }) => {
        const verbConjugationCard = page.locator('a[class*="lessonCard"][href$="/conjugation/verb-conjugation"]').first();
        await expect(verbConjugationCard).toBeVisible();
        await verbConjugationCard.click();
        await verifyPageIsFound(page);
        await expect(page.getByRole('heading', { name: /verb conjugation reference/i }).first()).toBeVisible();
      });
    });

    test.describe('Link Validation', () => {
      test('should have valid href attributes for all conjugation sidebar links', async ({ page }) => {
        // Wait for sidebar to be fully loaded
        await page.waitForSelector('nav.menu', { timeout: 10000 });
        const conjugationLinks = page.locator('a.menu__link[href*="/conjugation/"]').filter({ hasNotText: /^Conjugation$/ });
        const linkCount = await conjugationLinks.count();

        expect(linkCount).toBeGreaterThanOrEqual(2); // Should have at least basics and verb-conjugation

        for (let i = 0; i < linkCount; i++) {
          const link = conjugationLinks.nth(i);
          const href = await link.getAttribute('href');
          expect(href).toBeTruthy();
          expect(href).toMatch(/conjugation\//);
        }
      });

      test('should have valid href attributes for all conjugation card links', async ({ page }) => {
        const cardLinks = page.locator('a[class*="lessonCard"][href*="/conjugation/"]');
        const linkCount = await cardLinks.count();

        expect(linkCount).toBeGreaterThan(0);

        for (let i = 0; i < linkCount; i++) {
          const link = cardLinks.nth(i);
          await expect(link).toBeVisible();

          const href = await link.getAttribute('href');
          expect(href).toBeTruthy();
          expect(href).toMatch(/conjugation\//);
        }
      });
    });
  });

  test.describe('Direct Page Access', () => {
    test('should load basics.md directly', async ({ page }) => {
      await page.goto('./docs/lessons/conjugation/basics');
      await page.waitForLoadState('networkidle');
      await verifyPageIsFound(page);
      await expect(page.getByRole('heading', { name: /verb conjugation|conjugation/i }).first()).toBeVisible();
    });

    test('should load verb-conjugation.md directly', async ({ page }) => {
      await page.goto('./docs/lessons/conjugation/verb-conjugation');
      await page.waitForLoadState('networkidle');
      await verifyPageIsFound(page);
      await expect(page.getByRole('heading', { name: /verb conjugation reference/i }).first()).toBeVisible();
    });
  });

  test.describe('Cross-references', () => {
    test('should have working links to grammar pages from conjugation lessons', async ({ page }) => {
      await page.goto('./docs/lessons/conjugation/basics');
      await page.waitForLoadState('networkidle');

      const particleLink = page.locator('a[href*="particle-guide"]').first();
      await expect(particleLink).toBeVisible();
      await particleLink.click();
      await verifyPageIsFound(page);
      await expect(page.getByRole('heading', { name: /particle/i }).first()).toBeVisible();
    });

    test('should navigate between conjugation lessons', async ({ page }) => {
      await page.goto('./docs/lessons/conjugation/basics');
      await page.waitForLoadState('networkidle');

      const verbConjugationLink = page.locator('a[href*="verb-conjugation"]').first();
      await expect(verbConjugationLink).toBeVisible();
      await verbConjugationLink.click();
      await verifyPageIsFound(page);
      await expect(page.getByRole('heading', { name: /verb conjugation reference/i }).first()).toBeVisible();
    });
  });
});

