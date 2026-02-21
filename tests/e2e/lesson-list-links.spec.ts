import { expect, test } from '@playwright/test';
import { CONJUGATION_LESSONS, GRAMMAR_LESSONS, INTRO_LINKS, VOCABULARY_LESSONS, VOCABULARY_SECTIONS } from './helpers/lessonData';
import { verifyPageIsFound } from './helpers/pageHelper';

test.describe('LessonList Links', () => {
  test.describe('Intro Page', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('./docs/intro');
      await page.waitForLoadState('networkidle');
    });

    test('page loads successfully', async ({ page }) => {
      await verifyPageIsFound(page);
      await expect(page.getByRole('heading', { name: /welcome to japanese lessons/i }).first()).toBeVisible();
    });

    for (const lesson of INTRO_LINKS) {
      test(`navigates to ${lesson.name}`, async ({ page }) => {
        const card = page.locator(`a[class*="lessonCard"][href*="${lesson.path}"]`).first();
        await expect(card).toBeVisible();
        await card.click();
        await verifyPageIsFound(page);
        await expect(page.getByRole('heading', { name: lesson.heading }).first()).toBeVisible();
      });
    }
  });

  test.describe('Grammar Page', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('./docs/lessons/grammar');
      await page.waitForLoadState('networkidle');
    });

    test('page loads successfully', async ({ page }) => {
      await verifyPageIsFound(page);
      await expect(page.getByRole('heading', { name: /grammar/i }).first()).toBeVisible();
    });

    for (const lesson of GRAMMAR_LESSONS) {
      test(`navigates to ${lesson.name}`, async ({ page }) => {
        const card = page.locator(`a[class*="lessonCard"][href*="/grammar/${lesson.path}"]`).first();
        await expect(card).toBeVisible();
        await card.click();
        await verifyPageIsFound(page);
        await expect(page.getByRole('heading', { name: lesson.heading }).first()).toBeVisible();
      });
    }
  });

  test.describe('Vocabulary Page', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('./docs/lessons/vocabulary');
      await page.waitForLoadState('networkidle');
    });

    test('page loads successfully', async ({ page }) => {
      await verifyPageIsFound(page);
      await expect(page.getByRole('heading', { name: /vocabulary/i }).first()).toBeVisible();
    });

    for (const lesson of VOCABULARY_LESSONS) {
      test(`navigates to ${lesson.name}`, async ({ page }) => {
        const attr = lesson.partial ? '*=' : '$=';
        const card = page.locator(`a[class*="lessonCard"][href${attr}"/vocabulary/${lesson.path}"]`).first();
        await expect(card).toBeVisible();
        await card.click();
        await verifyPageIsFound(page);
        await expect(page.getByRole('heading', { name: lesson.heading }).first()).toBeVisible();
      });
    }
  });

  test.describe('Conjugation Page', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('./docs/lessons/conjugation');
      await page.waitForLoadState('networkidle');
    });

    test('page loads successfully', async ({ page }) => {
      await verifyPageIsFound(page);
      await expect(page.getByRole('heading', { name: /conjugation/i }).first()).toBeVisible();
    });

    for (const lesson of CONJUGATION_LESSONS) {
      test(`navigates to ${lesson.name}`, async ({ page }) => {
        const card = page.locator(`a[class*="lessonCard"][href*="${lesson.path}"]`).first();
        await expect(card).toBeVisible();
        await card.click();
        await verifyPageIsFound(page);
        await expect(page.getByRole('heading', { name: lesson.heading }).first()).toBeVisible();
      });
    }
  });

  for (const { section, basePath, heading, subLessons } of VOCABULARY_SECTIONS) {
    test.describe(`${section} Page`, () => {
      test.beforeEach(async ({ page }) => {
        await page.goto(`./docs/lessons/vocabulary/${basePath}`);
        await page.waitForLoadState('networkidle');
      });

      test('page loads successfully', async ({ page }) => {
        await verifyPageIsFound(page);
        await expect(page.getByRole('heading', { name: heading }).first()).toBeVisible();
      });

      for (const sub of subLessons) {
        test(`navigates to ${sub.name}`, async ({ page }) => {
          const card = page.locator(`a[class*="lessonCard"][href*="${sub.path}"]`).first();
          await expect(card).toBeVisible();
          await card.click();
          await verifyPageIsFound(page);
          await expect(page.getByRole('heading', { name: sub.heading }).first()).toBeVisible();
        });
      }
    });
  }
});
