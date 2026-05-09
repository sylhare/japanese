import { expect, test } from '@playwright/test';
import { GRAMMAR_LESSONS, GRAMMAR_SECTIONS } from './helpers/lessonData';
import { validateCardLinks, validateSidebarLinks, verifyPageIsFound } from './helpers/pageHelper';

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

    test.describe('Landing Page Cards (LessonList)', () => {
      for (const lesson of GRAMMAR_LESSONS) {
        test(`should navigate to ${lesson.name} from landing page`, async ({ page }) => {
          const card = page.locator(`a[class*="lessonCard"][href*="/grammar/${lesson.path}"]`).first();
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

  for (const { section, basePath, heading, subLessons } of GRAMMAR_SECTIONS) {
    test.describe(`Grammar ${section} Page`, () => {
      test.beforeEach(async ({ page }) => {
        await page.goto(`./docs/lessons/grammar/${basePath}`);
        await page.waitForLoadState('networkidle');
      });

      test('page loads successfully', async ({ page }) => {
        await verifyPageIsFound(page);
        await expect(page.getByRole('heading', { name: heading }).first()).toBeVisible();
      });

      for (const sub of subLessons) {
        test(`should navigate to ${sub.name} from landing page`, async ({ page }) => {
          const card = page.locator(`a[class*="lessonCard"][href*="${sub.path}"]`).first();
          await expect(card).toBeVisible();
          await card.click();
          await verifyPageIsFound(page);
          await expect(page.getByRole('heading', { name: sub.heading }).first()).toBeVisible();
        });
      }
    });
  }

  test.describe('Cross-references', () => {
    test('should navigate from Question Words to Linking Words via NextSteps', async ({ page }) => {
      await page.goto('./docs/lessons/grammar/sentence-building/question-words');
      await page.waitForLoadState('networkidle');

      const linkingWordsLink = page.locator('a[href*="vocabulary/essentials/linking-words"]').first();
      await expect(linkingWordsLink).toBeVisible();
      await linkingWordsLink.click();
      await verifyPageIsFound(page);
      await expect(page.getByRole('heading', { name: /linking words/i }).first()).toBeVisible();
    });

    test('should navigate from Question Words to Particle Guide via NextSteps', async ({ page }) => {
      await page.goto('./docs/lessons/grammar/sentence-building/question-words');
      await page.waitForLoadState('networkidle');

      const particleLink = page.locator('a[href*="grammar/sentence-building/particle-guide"]').first();
      await expect(particleLink).toBeVisible();
      await particleLink.click();
      await verifyPageIsFound(page);
      await expect(page.getByRole('heading', { name: /particle/i }).first()).toBeVisible();
    });
  });
});
