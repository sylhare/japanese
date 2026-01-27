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

      test('should navigate to Clothes from sidebar', async ({ page }) => {
        const clothesLink = page.locator('a.menu__link[href$="/vocabulary/clothes"]').first();
        await expect(clothesLink).toBeVisible();
        await clothesLink.click();
        await verifyPageIsFound(page);
        await expect(page.getByRole('heading', { name: /clothes|wearing/i }).first()).toBeVisible();
      });

      test('should navigate to Weather from sidebar', async ({ page }) => {
        const weatherLink = page.locator('a.menu__link[href$="/vocabulary/weather"]').first();
        await expect(weatherLink).toBeVisible();
        await weatherLink.click();
        await verifyPageIsFound(page);
        await expect(page.getByRole('heading', { name: /weather/i }).first()).toBeVisible();
      });

      test('should navigate to Cooking from sidebar', async ({ page }) => {
        const cookingLink = page.locator('a.menu__link[href$="/vocabulary/cooking"]').first();
        await expect(cookingLink).toBeVisible();
        await cookingLink.click();
        await verifyPageIsFound(page);
        await expect(page.getByRole('heading', { name: /cooking|food prep/i }).first()).toBeVisible();
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

      test('should navigate to Clothes from landing page', async ({ page }) => {
        const clothesCard = page.locator('a[class*="lessonCard"][href$="/vocabulary/clothes"]').first();
        await expect(clothesCard).toBeVisible();
        await clothesCard.click();
        await verifyPageIsFound(page);
        await expect(page.getByRole('heading', { name: /clothes|wearing/i }).first()).toBeVisible();
      });

      test('should navigate to Weather from landing page', async ({ page }) => {
        const weatherCard = page.locator('a[class*="lessonCard"][href$="/vocabulary/weather"]').first();
        await expect(weatherCard).toBeVisible();
        await weatherCard.click();
        await verifyPageIsFound(page);
        await expect(page.getByRole('heading', { name: /weather/i }).first()).toBeVisible();
      });

      test('should navigate to Cooking from landing page', async ({ page }) => {
        const cookingCard = page.locator('a[class*="lessonCard"][href$="/vocabulary/cooking"]').first();
        await expect(cookingCard).toBeVisible();
        await cookingCard.click();
        await verifyPageIsFound(page);
        await expect(page.getByRole('heading', { name: /cooking|food prep/i }).first()).toBeVisible();
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
  });

  test.describe('Time Pages', () => {
    test('should load time index page', async ({ page }) => {
      await page.goto('./docs/lessons/vocabulary/time/');
      await page.waitForLoadState('networkidle');
      await verifyPageIsFound(page);
      await expect(page.getByRole('heading', { name: /time|dates/i }).first()).toBeVisible();
    });

    test.describe('Time Sub-lessons from Landing Page', () => {
      test.beforeEach(async ({ page }) => {
        await page.goto('./docs/lessons/vocabulary/time/');
        await page.waitForLoadState('networkidle');
      });

      test('should navigate to Days and Weeks from time landing page', async ({ page }) => {
        const daysWeeksCard = page.locator('a[class*="lessonCard"][href*="days-and-weeks"]').first();
        await expect(daysWeeksCard).toBeVisible();
        await daysWeeksCard.click();
        await verifyPageIsFound(page);
        await expect(page.getByRole('heading', { name: /days.*weeks|days of the week/i }).first()).toBeVisible();
      });

      test('should navigate to Calendar from time landing page', async ({ page }) => {
        const calendarCard = page.locator('a[class*="lessonCard"][href*="calendar"]').first();
        await expect(calendarCard).toBeVisible();
        await calendarCard.click();
        await verifyPageIsFound(page);
        await expect(page.getByRole('heading', { name: /calendar|dates/i }).first()).toBeVisible();
      });
    });

    test.describe('Time Sub-lessons Direct Navigation', () => {
      test('should load Days and Weeks page directly', async ({ page }) => {
        await page.goto('./docs/lessons/vocabulary/time/days-and-weeks');
        await page.waitForLoadState('networkidle');
        await verifyPageIsFound(page);
        await expect(page.getByRole('heading', { name: /days.*weeks|days of the week/i }).first()).toBeVisible();
      });

      test('should load Calendar page directly', async ({ page }) => {
        await page.goto('./docs/lessons/vocabulary/time/calendar');
        await page.waitForLoadState('networkidle');
        await verifyPageIsFound(page);
        await expect(page.getByRole('heading', { name: /calendar|dates/i }).first()).toBeVisible();
      });
    });

    test.describe('Time Sidebar Navigation', () => {
      test.beforeEach(async ({ page }) => {
        await page.goto('./docs/lessons/vocabulary/time/');
        await page.waitForLoadState('networkidle');
      });

      test('should have Days and Weeks in sidebar', async ({ page }) => {
        const daysWeeksLink = page.locator('a.menu__link[href*="days-and-weeks"]').first();
        await expect(daysWeeksLink).toBeVisible();
        await daysWeeksLink.click();
        await verifyPageIsFound(page);
        await expect(page.getByRole('heading', { name: /days.*weeks|days of the week/i }).first()).toBeVisible();
      });

      test('should have Calendar in sidebar', async ({ page }) => {
        const calendarLink = page.locator('a.menu__link[href*="calendar"]').first();
        await expect(calendarLink).toBeVisible();
        await calendarLink.click();
        await verifyPageIsFound(page);
        await expect(page.getByRole('heading', { name: /calendar|dates/i }).first()).toBeVisible();
      });
    });
  });

  test.describe('Numbers Pages', () => {
    test('should load numbers index page', async ({ page }) => {
      await page.goto('./docs/lessons/vocabulary/numbers/');
      await page.waitForLoadState('networkidle');
      await verifyPageIsFound(page);
      await expect(page.getByRole('heading', { name: /numbers|counting/i }).first()).toBeVisible();
    });

    test.describe('Numbers Sub-lessons from Landing Page', () => {
      test.beforeEach(async ({ page }) => {
        await page.goto('./docs/lessons/vocabulary/numbers/');
        await page.waitForLoadState('networkidle');
      });

      test('should navigate to Basic Numbers from numbers landing page', async ({ page }) => {
        const basicsCard = page.locator('a[class*="lessonCard"][href*="basics"]').first();
        await expect(basicsCard).toBeVisible();
        await basicsCard.click();
        await verifyPageIsFound(page);
        await expect(page.getByRole('heading', { name: /basic numbers|numbers/i }).first()).toBeVisible();
      });

      test('should navigate to Reading Numbers from numbers landing page', async ({ page }) => {
        const countingCard = page.locator('a[class*="lessonCard"][href*="counting"]').first();
        await expect(countingCard).toBeVisible();
        await countingCard.click();
        await verifyPageIsFound(page);
        await expect(page.getByRole('heading', { name: /reading numbers|counting/i }).first()).toBeVisible();
      });
    });

    test.describe('Numbers Sub-lessons Direct Navigation', () => {
      test('should load Basic Numbers page directly', async ({ page }) => {
        await page.goto('./docs/lessons/vocabulary/numbers/basics');
        await page.waitForLoadState('networkidle');
        await verifyPageIsFound(page);
        await expect(page.getByRole('heading', { name: /basic numbers|numbers/i }).first()).toBeVisible();
      });

      test('should load Reading Numbers page directly', async ({ page }) => {
        await page.goto('./docs/lessons/vocabulary/numbers/counting');
        await page.waitForLoadState('networkidle');
        await verifyPageIsFound(page);
        await expect(page.getByRole('heading', { name: /reading numbers|counting/i }).first()).toBeVisible();
      });

      test('should load Counters page directly', async ({ page }) => {
        await page.goto('./docs/lessons/vocabulary/numbers/counters');
        await page.waitForLoadState('networkidle');
        await verifyPageIsFound(page);
        await expect(page.getByRole('heading', { name: /counters|frequency/i }).first()).toBeVisible();
      });
    });

    test.describe('Numbers Sidebar Navigation', () => {
      test.beforeEach(async ({ page }) => {
        await page.goto('./docs/lessons/vocabulary/numbers/');
        await page.waitForLoadState('networkidle');
      });

      test('should have Basic Numbers in sidebar', async ({ page }) => {
        const basicsLink = page.locator('a.menu__link[href*="/vocabulary/numbers/basics"]').first();
        await expect(basicsLink).toBeVisible();
        await basicsLink.click();
        await verifyPageIsFound(page);
        await expect(page.getByRole('heading', { name: /basic numbers|numbers/i }).first()).toBeVisible();
      });

      test('should have Reading Numbers in sidebar', async ({ page }) => {
        const countingLink = page.locator('a.menu__link[href*="/vocabulary/numbers/counting"]').first();
        await expect(countingLink).toBeVisible();
        await countingLink.click();
        await verifyPageIsFound(page);
        await expect(page.getByRole('heading', { name: /reading numbers|counting/i }).first()).toBeVisible();
      });

      test('should have Counters in sidebar', async ({ page }) => {
        const countersLink = page.locator('a.menu__link[href*="/vocabulary/numbers/counters"]').first();
        await expect(countersLink).toBeVisible();
        await countersLink.click();
        await verifyPageIsFound(page);
        await expect(page.getByRole('heading', { name: /counters|frequency/i }).first()).toBeVisible();
      });
    });
  });

  test.describe('Individual Vocabulary Pages', () => {
    test('should load Clothes page directly', async ({ page }) => {
      await page.goto('./docs/lessons/vocabulary/clothes');
      await page.waitForLoadState('networkidle');
      await verifyPageIsFound(page);
      await expect(page.getByRole('heading', { name: /clothes|wearing/i }).first()).toBeVisible();
    });

    test('should load Weather page directly', async ({ page }) => {
      await page.goto('./docs/lessons/vocabulary/weather');
      await page.waitForLoadState('networkidle');
      await verifyPageIsFound(page);
      await expect(page.getByRole('heading', { name: /weather/i }).first()).toBeVisible();
    });

    test('should load Cooking page directly', async ({ page }) => {
      await page.goto('./docs/lessons/vocabulary/cooking');
      await page.waitForLoadState('networkidle');
      await verifyPageIsFound(page);
      await expect(page.getByRole('heading', { name: /cooking|food prep/i }).first()).toBeVisible();
    });
  });
});
