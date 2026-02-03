import { expect, test } from '@playwright/test';
import { verifyPageIsFound } from './helpers/pageHelper';

const lessonsIntroLinks = [
  { name: 'Grammar', hrefPattern: '/grammar', headingPattern: /grammar/i },
  { name: 'Vocabulary', hrefPattern: '/vocabulary', headingPattern: /vocabulary/i },
  { name: 'Conjugation', hrefPattern: '/conjugation', headingPattern: /conjugation/i },
  { name: 'Dictionary', hrefPattern: '/dictionary', headingPattern: /vocabulary|dictionary/i },
  { name: 'Hiragana Chart', hrefPattern: 'hiragana-chart', headingPattern: /hiragana/i },
  { name: 'Katakana Chart', hrefPattern: 'katakana-chart', headingPattern: /katakana/i },
];

const grammarLinks = [
  { name: 'Particle Guide', hrefPattern: 'particle-guide', headingPattern: /particle/i },
  { name: 'Experience', hrefPattern: 'experience', headingPattern: /experience/i },
  { name: 'Conjunctions', hrefPattern: 'conjunctions', headingPattern: /listing items|conjunctions/i },
  { name: 'Excess', hrefPattern: 'excess', headingPattern: /too much|excess|すぎる/i },
  { name: 'Comparison', hrefPattern: 'comparison', headingPattern: /comparison/i },
  { name: 'Advice', hrefPattern: 'advice', headingPattern: /advice/i },
  { name: 'Obligation', hrefPattern: 'obligation', headingPattern: /obligation/i },
  { name: 'Reason', hrefPattern: 'reason', headingPattern: /reason/i },
  { name: 'Desire', hrefPattern: 'desire', headingPattern: /desire/i },
  { name: 'Appearance', hrefPattern: 'appearance', headingPattern: /appearance/i },
  { name: 'Actions and Thinking', hrefPattern: 'actions-and-thinking', headingPattern: /actions|thinking/i },
  { name: 'Sequential Actions', hrefPattern: 'sequential-actions', headingPattern: /sequential|てから/i },
  { name: 'Prohibition', hrefPattern: 'prohibition', headingPattern: /prohibition|いけません|だめ/i },
];

const vocabularyLinks = [
  { name: 'Colors', hrefPattern: 'colors', headingPattern: /colors/i },
  { name: 'Tastes', hrefPattern: 'tastes', headingPattern: /tastes|flavors/i },
  { name: 'Time', hrefPattern: '/time', headingPattern: /time|dates/i },
  { name: 'Numbers', hrefPattern: '/numbers', headingPattern: /numbers|counting/i },
  { name: 'Family', hrefPattern: 'family', headingPattern: /family|relationships/i },
  { name: 'Clothes', hrefPattern: 'clothes', headingPattern: /clothes|wearing/i },
  { name: 'Weather', hrefPattern: 'weather', headingPattern: /weather/i },
  { name: 'Cooking', hrefPattern: 'cooking', headingPattern: /cooking|food prep/i },
  { name: 'Confusing Kanji', hrefPattern: 'confusing-kanji', headingPattern: /confusing kanji/i },
];

const conjugationLinks = [
  { name: 'Verb Conjugation Basics', hrefPattern: 'basics', headingPattern: /verb conjugation|conjugation/i },
  { name: 'Dictionary Form', hrefPattern: 'dictionary-form', headingPattern: /introduction/i },
];

const numbersLinks = [
  { name: 'Basic Numbers', hrefPattern: 'basics', headingPattern: /basic numbers|numbers/i },
  { name: 'Reading Numbers', hrefPattern: 'counting', headingPattern: /reading numbers|counting/i },
  { name: 'Counters', hrefPattern: 'counters', headingPattern: /counters|frequency/i },
];

const timeLinks = [
  { name: 'Days and Weeks', hrefPattern: 'days-and-weeks', headingPattern: /days.*weeks|days of the week/i },
  { name: 'Calendar', hrefPattern: 'calendar', headingPattern: /calendar|dates/i },
];

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

    lessonsIntroLinks.forEach(({ name, hrefPattern, headingPattern }) => {
      test(`navigates to ${name}`, async ({ page }) => {
        const card = page.locator(`a[class*="lessonCard"][href*="${hrefPattern}"]`).first();
        await expect(card).toBeVisible();
        await card.click();
        await verifyPageIsFound(page);
        await expect(page.getByRole('heading', { name: headingPattern }).first()).toBeVisible();
      });
    });
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

    grammarLinks.forEach(({ name, hrefPattern, headingPattern }) => {
      test(`navigates to ${name}`, async ({ page }) => {
        const card = page.locator(`a[class*="lessonCard"][href*="${hrefPattern}"]`).first();
        await expect(card).toBeVisible();
        await card.click();
        await verifyPageIsFound(page);
        await expect(page.getByRole('heading', { name: headingPattern }).first()).toBeVisible();
      });
    });
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

    vocabularyLinks.forEach(({ name, hrefPattern, headingPattern }) => {
      test(`navigates to ${name}`, async ({ page }) => {
        const card = page.locator(`a[class*="lessonCard"][href*="${hrefPattern}"]`).first();
        await expect(card).toBeVisible();
        await card.click();
        await verifyPageIsFound(page);
        await expect(page.getByRole('heading', { name: headingPattern }).first()).toBeVisible();
      });
    });
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

    conjugationLinks.forEach(({ name, hrefPattern, headingPattern }) => {
      test(`navigates to ${name}`, async ({ page }) => {
        const card = page.locator(`a[class*="lessonCard"][href*="${hrefPattern}"]`).first();
        await expect(card).toBeVisible();
        await card.click();
        await verifyPageIsFound(page);
        await expect(page.getByRole('heading', { name: headingPattern }).first()).toBeVisible();
      });
    });
  });

  test.describe('Numbers Page', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('./docs/lessons/vocabulary/numbers');
      await page.waitForLoadState('networkidle');
    });

    test('page loads successfully', async ({ page }) => {
      await verifyPageIsFound(page);
      await expect(page.getByRole('heading', { name: /numbers|counting/i }).first()).toBeVisible();
    });

    numbersLinks.forEach(({ name, hrefPattern, headingPattern }) => {
      test(`navigates to ${name}`, async ({ page }) => {
        const card = page.locator(`a[class*="lessonCard"][href*="${hrefPattern}"]`).first();
        await expect(card).toBeVisible();
        await card.click();
        await verifyPageIsFound(page);
        await expect(page.getByRole('heading', { name: headingPattern }).first()).toBeVisible();
      });
    });
  });

  test.describe('Time Page', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('./docs/lessons/vocabulary/time');
      await page.waitForLoadState('networkidle');
    });

    test('page loads successfully', async ({ page }) => {
      await verifyPageIsFound(page);
      await expect(page.getByRole('heading', { name: /time|dates/i }).first()).toBeVisible();
    });

    timeLinks.forEach(({ name, hrefPattern, headingPattern }) => {
      test(`navigates to ${name}`, async ({ page }) => {
        const card = page.locator(`a[class*="lessonCard"][href*="${hrefPattern}"]`).first();
        await expect(card).toBeVisible();
        await card.click();
        await verifyPageIsFound(page);
        await expect(page.getByRole('heading', { name: headingPattern }).first()).toBeVisible();
      });
    });
  });
});
