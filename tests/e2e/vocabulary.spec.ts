import { expect, test } from '@playwright/test';
import { verifyPageIsFound } from './helpers/pageHelper';
import { VOCABULARY_LESSONS, VOCABULARY_SECTIONS } from './helpers/lessonData';

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
      for (const lesson of VOCABULARY_LESSONS) {
        test(`should navigate to ${lesson.name} from sidebar`, async ({ page }) => {
          const attr = lesson.partial ? '*=' : '$=';
          const link = page.locator(`a.menu__link[href${attr}"/vocabulary/${lesson.path}"]`).first();
          await expect(link).toBeVisible();
          await link.click();
          await verifyPageIsFound(page);
          await expect(page.getByRole('heading', { name: lesson.heading }).first()).toBeVisible();
        });
      }
    });

    test.describe('Landing Page Cards (LessonList)', () => {
      for (const lesson of VOCABULARY_LESSONS) {
        test(`should navigate to ${lesson.name} from landing page`, async ({ page }) => {
          const attr = lesson.partial ? '*=' : '$=';
          const card = page.locator(`a[class*="lessonCard"][href${attr}"/vocabulary/${lesson.path}"]`).first();
          await expect(card).toBeVisible();
          await card.click();
          await verifyPageIsFound(page);
          await expect(page.getByRole('heading', { name: lesson.heading }).first()).toBeVisible();
        });
      }
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
  });

  for (const { section, basePath, heading, subLessons } of VOCABULARY_SECTIONS) {
    test.describe(`${section} Pages`, () => {
      test(`should load ${section.toLowerCase()} index page`, async ({ page }) => {
        await page.goto(`./docs/lessons/vocabulary/${basePath}/`);
        await page.waitForLoadState('networkidle');
        await verifyPageIsFound(page);
        await expect(page.getByRole('heading', { name: heading }).first()).toBeVisible();
      });

      test.describe(`${section} Sub-lessons from Landing Page`, () => {
        test.beforeEach(async ({ page }) => {
          await page.goto(`./docs/lessons/vocabulary/${basePath}/`);
          await page.waitForLoadState('networkidle');
        });

        for (const sub of subLessons) {
          test(`should navigate to ${sub.name} from ${section.toLowerCase()} landing page`, async ({ page }) => {
            const card = page.locator(`a[class*="lessonCard"][href*="${sub.path}"]`).first();
            await expect(card).toBeVisible();
            await card.click();
            await verifyPageIsFound(page);
            await expect(page.getByRole('heading', { name: sub.heading }).first()).toBeVisible();
          });
        }
      });

      test.describe(`${section} Sub-lessons Direct Navigation`, () => {
        for (const sub of subLessons) {
          test(`should load ${sub.name} page directly`, async ({ page }) => {
            await page.goto(`./docs/lessons/vocabulary/${basePath}/${sub.path}`);
            await page.waitForLoadState('networkidle');
            await verifyPageIsFound(page);
            await expect(page.getByRole('heading', { name: sub.heading }).first()).toBeVisible();
          });
        }
      });

      test.describe(`${section} Sidebar Navigation`, () => {
        test.beforeEach(async ({ page }) => {
          await page.goto(`./docs/lessons/vocabulary/${basePath}/`);
          await page.waitForLoadState('networkidle');
        });

        for (const sub of subLessons) {
          test(`should have ${sub.name} in sidebar`, async ({ page }) => {
            const link = page.locator(`a.menu__link[href*="/vocabulary/${basePath}/${sub.path}"]`).first();
            await expect(link).toBeVisible();
            await link.click();
            await verifyPageIsFound(page);
            await expect(page.getByRole('heading', { name: sub.heading }).first()).toBeVisible();
          });
        }
      });
    });
  }

  test.describe('Individual Vocabulary Pages', () => {
    for (const lesson of VOCABULARY_LESSONS.filter(l => !l.partial)) {
      test(`should load ${lesson.name} page directly`, async ({ page }) => {
        await page.goto(`./docs/lessons/vocabulary/${lesson.path}`);
        await page.waitForLoadState('networkidle');
        await verifyPageIsFound(page);
        await expect(page.getByRole('heading', { name: lesson.heading }).first()).toBeVisible();
      });
    }
  });

  test.describe('Cross-references', () => {
    test('should navigate from Calendar to Counters via NextSteps', async ({ page }) => {
      await page.goto('./docs/lessons/vocabulary/time/calendar');
      await page.waitForLoadState('networkidle');

      const countersLink = page.locator('a[href*="numbers/counters"]').first();
      await expect(countersLink).toBeVisible();
      await countersLink.click();
      await verifyPageIsFound(page);
      await expect(page.getByRole('heading', { name: /counters|frequency/i }).first()).toBeVisible();
    });

    test('should navigate from Food to Cooking via NextSteps', async ({ page }) => {
      await page.goto('./docs/lessons/vocabulary/food/food');
      await page.waitForLoadState('networkidle');

      const cookingLink = page.locator('a[href*="food/cooking"]').first();
      await expect(cookingLink).toBeVisible();
      await cookingLink.click();
      await verifyPageIsFound(page);
      await expect(page.getByRole('heading', { name: /cooking|food prep/i }).first()).toBeVisible();
    });

    test('should navigate from Food to Tastes via NextSteps', async ({ page }) => {
      await page.goto('./docs/lessons/vocabulary/food/food');
      await page.waitForLoadState('networkidle');

      const tastesLink = page.locator('a[href*="food/tastes"]').first();
      await expect(tastesLink).toBeVisible();
      await tastesLink.click();
      await verifyPageIsFound(page);
      await expect(page.getByRole('heading', { name: /tastes|flavors/i }).first()).toBeVisible();
    });

    test('should navigate from Tastes to Cooking via NextSteps', async ({ page }) => {
      await page.goto('./docs/lessons/vocabulary/food/tastes');
      await page.waitForLoadState('networkidle');

      const cookingLink = page.locator('a[href*="food/cooking"]').first();
      await expect(cookingLink).toBeVisible();
      await cookingLink.click();
      await verifyPageIsFound(page);
      await expect(page.getByRole('heading', { name: /cooking|food prep/i }).first()).toBeVisible();
    });
  });
});
