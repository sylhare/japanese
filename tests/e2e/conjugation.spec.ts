import { expect, test } from '@playwright/test';
import { verifyPageIsFound, validateSidebarLinks, validateCardLinks } from './helpers/pageHelper';
import { CONJUGATION_LESSONS } from './helpers/lessonData';

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
      for (const lesson of CONJUGATION_LESSONS) {
        test(`should navigate to ${lesson.name} from sidebar`, async ({ page }) => {
          const link = page.locator(`a.menu__link[href$="/conjugation/${lesson.path}"]`).first();
          await expect(link).toBeVisible();
          await link.click();
          await verifyPageIsFound(page);
          await expect(page.getByRole('heading', { name: lesson.heading }).first()).toBeVisible();
        });
      }
    });

    test.describe('Landing Page Links (LessonList)', () => {
      for (const lesson of CONJUGATION_LESSONS) {
        test(`should navigate to ${lesson.name} from landing page`, async ({ page }) => {
          const card = page.locator(`a[class*="lessonCard"][href$="/conjugation/${lesson.path}"]`).first();
          await expect(card).toBeVisible();
          await card.click();
          await verifyPageIsFound(page);
          await expect(page.getByRole('heading', { name: lesson.heading }).first()).toBeVisible();
        });
      }
    });

    test.describe('Link Validation', () => {
      test('should have valid href attributes for all conjugation sidebar links', async ({ page }) => {
        await validateSidebarLinks(page, 'conjugation');
      });

      test('should have valid href attributes for all conjugation card links', async ({ page }) => {
        await validateCardLinks(page, 'conjugation');
      });
    });
  });

  test.describe('Direct Page Access', () => {
    for (const lesson of CONJUGATION_LESSONS) {
      test(`should load ${lesson.name} page directly`, async ({ page }) => {
        await page.goto(`./docs/lessons/conjugation/${lesson.path}`);
        await page.waitForLoadState('networkidle');
        await verifyPageIsFound(page);
        await expect(page.getByRole('heading', { name: lesson.heading }).first()).toBeVisible();
      });
    }
  });

  test.describe('Cross-references', () => {
    test('should navigate between conjugation lessons', async ({ page }) => {
      await page.goto('./docs/lessons/conjugation/basics');
      await page.waitForLoadState('networkidle');

      // Click the NextSteps link to dictionary (not the navbar Dictionary link)
      const dictionaryLink = page.locator('a[href*="conjugation/dictionary-form"]').first();
      await expect(dictionaryLink).toBeVisible();
      await dictionaryLink.click();
      await verifyPageIsFound(page);
      await expect(page.getByRole('heading', { name: /introduction/i }).first()).toBeVisible();
    });
  });
});
