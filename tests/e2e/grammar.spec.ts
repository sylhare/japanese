import { expect, test } from '@playwright/test';
import { verifyPageIsFound, validateSidebarLinks, validateCardLinks } from './helpers/pageHelper';
import { GRAMMAR_LESSONS } from './helpers/lessonData';

test.describe('Grammar Pages', () => {
  test.describe('Grammar Landing Page', () => {
    test('should load grammar index page', async ({ page }) => {
      await page.goto('./docs/lessons/grammar/');
      await page.waitForLoadState('networkidle');
      await verifyPageIsFound(page);
      await expect(page.getByRole('heading', { name: /grammar/i }).first()).toBeVisible();
    });
  });

  test.describe('Grammar Landing Page Navigation', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('./docs/lessons/grammar/');
      await page.waitForLoadState('networkidle');
    });

    test.describe('Sidebar Links', () => {
      for (const lesson of GRAMMAR_LESSONS) {
        test(`should navigate to ${lesson.name} from sidebar`, async ({ page }) => {
          const link = page.locator(`a.menu__link[href$="/grammar/${lesson.path}"]`).first();
          await expect(link).toBeVisible();
          await link.click();
          await verifyPageIsFound(page);
          await expect(page.getByRole('heading', { name: lesson.heading }).first()).toBeVisible();
        });
      }
    });

    test.describe('Landing Page Cards (LessonList)', () => {
      for (const lesson of GRAMMAR_LESSONS) {
        test(`should navigate to ${lesson.name} from landing page`, async ({ page }) => {
          const card = page.locator(`a[class*="lessonCard"][href$="/grammar/${lesson.path}"]`).first();
          await expect(card).toBeVisible();
          await card.click();
          await verifyPageIsFound(page);
          await expect(page.getByRole('heading', { name: lesson.heading }).first()).toBeVisible();
        });
      }
    });

    test.describe('Link Validation', () => {
      test('should have valid href attributes for all grammar sidebar links', async ({ page }) => {
        await validateSidebarLinks(page, 'grammar');
      });

      test('should have valid href attributes for all grammar card links', async ({ page }) => {
        await validateCardLinks(page, 'grammar');
      });
    });
  });

  test.describe('Individual Grammar Pages', () => {
    for (const lesson of GRAMMAR_LESSONS) {
      test(`should load ${lesson.name} page directly`, async ({ page }) => {
        await page.goto(`./docs/lessons/grammar/${lesson.path}`);
        await page.waitForLoadState('networkidle');
        await verifyPageIsFound(page);
        await expect(page.getByRole('heading', { name: lesson.heading }).first()).toBeVisible();
      });
    }
  });

  test.describe('Cross-references', () => {
    test('should navigate from Question Words to Linking Words via NextSteps', async ({ page }) => {
      await page.goto('./docs/lessons/grammar/question-words');
      await page.waitForLoadState('networkidle');

      const linkingWordsLink = page.locator('a[href*="vocabulary/linking-words"]').first();
      await expect(linkingWordsLink).toBeVisible();
      await linkingWordsLink.click();
      await verifyPageIsFound(page);
      await expect(page.getByRole('heading', { name: /linking words/i }).first()).toBeVisible();
    });

    test('should navigate from Question Words to Particle Guide via NextSteps', async ({ page }) => {
      await page.goto('./docs/lessons/grammar/question-words');
      await page.waitForLoadState('networkidle');

      const particleLink = page.locator('a[href*="grammar/particle-guide"]').first();
      await expect(particleLink).toBeVisible();
      await particleLink.click();
      await verifyPageIsFound(page);
      await expect(page.getByRole('heading', { name: /particle/i }).first()).toBeVisible();
    });
  });
});
