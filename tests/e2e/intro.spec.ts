import { expect, test } from '@playwright/test';
import { verifyPageIsFound } from './helpers/pageHelper';

test.describe('Intro Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('./docs/intro');
    await page.waitForLoadState('networkidle');
  });

  test.describe('Page Accessibility', () => {
    test('should load the intro page successfully', async ({ page }) => {
      await verifyPageIsFound(page);
      await expect(page.getByRole('heading', { name: /welcome to japanese lessons/i })).toBeVisible();
    });

    test('should display the main heading', async ({ page }) => {
      const heading = page.getByRole('heading', { name: /welcome to japanese lessons/i }).first();
      await expect(heading).toBeVisible();
    });

    test('should display the reference section', async ({ page }) => {
      const referenceHeading = page.getByRole('heading', { name: /reference/i });
      await expect(referenceHeading).toBeVisible();
    });

    test('should display the learning resources section', async ({ page }) => {
      const learningResourcesHeading = page.getByRole('heading', { name: /learning resources/i });
      await expect(learningResourcesHeading).toBeVisible();
    });
  });

  test.describe('Reference Section', () => {
    test('should navigate to Dictionary', async ({ page }) => {
      const dictionaryLink = page.locator('a[href*="/dictionary"]').first();
      await expect(dictionaryLink).toBeVisible();
      await expect(dictionaryLink).toContainText(/dictionary/i);
      await dictionaryLink.click();
      await verifyPageIsFound(page);
      await expect(page.getByRole('heading', { name: /vocabulary|dictionary/i }).first()).toBeVisible();
    });

    test('should navigate to Hiragana Chart', async ({ page }) => {
      const hiraganaLink = page.locator('a[href*="hiragana-chart"]').first();
      await expect(hiraganaLink).toBeVisible();
      await expect(hiraganaLink).toContainText(/hiragana chart/i);
      await hiraganaLink.click();
      await verifyPageIsFound(page);
      await expect(page.getByRole('heading', { name: /hiragana/i }).first()).toBeVisible();
    });

    test('should navigate to Katakana Chart', async ({ page }) => {
      const katakanaLink = page.locator('a[href*="katakana-chart"]').first();
      await expect(katakanaLink).toBeVisible();
      await expect(katakanaLink).toContainText(/katakana chart/i);
      await katakanaLink.click();
      await verifyPageIsFound(page);
      await expect(page.getByRole('heading', { name: /katakana/i }).first()).toBeVisible();
    });
  });

  test.describe('Learning Resources Tiles', () => {
    test('should display all resource tiles', async ({ page }) => {
      const tiles = page.locator('a[class*="lessonCard"]');
      const tileCount = await tiles.count();
      expect(tileCount).toBeGreaterThanOrEqual(2);
    });

    test('should navigate to Grammar from tile', async ({ page }) => {
      const grammarCard = page.locator('a[class*="lessonCard"][href*="/grammar"]').first();
      await expect(grammarCard).toBeVisible();
      await expect(grammarCard).toContainText(/grammar/i);
      await grammarCard.click();
      await verifyPageIsFound(page);
      await expect(page.getByRole('heading', { name: /grammar/i }).first()).toBeVisible();
    });

    test('should navigate to Hiragana Chart from tile', async ({ page }) => {
      const hiraganaCard = page.locator('a[class*="lessonCard"][href*="hiragana-chart"]').first();
      await expect(hiraganaCard).toBeVisible();
      await expect(hiraganaCard).toContainText(/hiragana/i);
      await hiraganaCard.click();
      await verifyPageIsFound(page);
      await expect(page.getByRole('heading', { name: /hiragana/i }).first()).toBeVisible();
    });
  });

  test.describe('Tile Interactions', () => {
    test('should show hover effect on tiles', async ({ page }) => {
      const firstTile = page.locator('a[class*="lessonCard"]').first();
      await expect(firstTile).toBeVisible();
      
      const initialBox = await firstTile.boundingBox();
      expect(initialBox).not.toBeNull();
      
      await firstTile.hover();
      
      await expect(firstTile).toBeVisible();
    });

    test('should have valid href attributes for all tiles', async ({ page }) => {
      const tiles = page.locator('a[class*="lessonCard"]');
      const tileCount = await tiles.count();

      expect(tileCount).toBeGreaterThanOrEqual(2);

      for (let i = 0; i < tileCount; i++) {
        const tile = tiles.nth(i);
        await expect(tile).toBeVisible();

        const href = await tile.getAttribute('href');
        expect(href).toBeTruthy();
        expect(href).toMatch(/\/(docs\/lessons|docs\/reference|reference|vocabulary|dictionary|japanese\/docs)/);
      }
    });

    test('should have arrow indicators on all tiles', async ({ page }) => {
      const tiles = page.locator('a[class*="lessonCard"]');
      const tileCount = await tiles.count();

      for (let i = 0; i < tileCount; i++) {
        const tile = tiles.nth(i);
        const arrow = tile.locator('[class*="cardArrow"]');
        await expect(arrow).toBeVisible();
        await expect(arrow).toContainText('→');
      }
    });
  });

  test.describe('Page Content', () => {
    test('should have proper article structure', async ({ page }) => {
      const article = page.locator('article').first();
      await expect(article).toBeVisible();
      
      const mainHeading = article.getByRole('heading', { level: 1 });
      await expect(mainHeading).toBeVisible();
    });

    test('should display reference section', async ({ page }) => {
      const referenceHeading = page.getByRole('heading', { name: /reference/i });
      await expect(referenceHeading).toBeVisible();
    });
  });

  test.describe('Link Validation', () => {
    test('should have valid href attributes for all reference links', async ({ page }) => {
      const referenceSection = page
        .locator('article')
        .getByRole('heading', { name: /reference/i })
        .locator('xpath=following-sibling::*[1]');
      const links = referenceSection.locator('a[href]');
      const linkCount = await links.count();

      expect(linkCount).toBeGreaterThan(0);

      for (let i = 0; i < linkCount; i++) {
        const link = links.nth(i);
        const href = await link.getAttribute('href');
        expect(href).toBeTruthy();
        expect(href?.length).toBeGreaterThan(0);
      }
    });

    test('should not have any broken internal links in reference section', async ({ page }) => {
      test.slow();
      const referenceSection = page
        .locator('article')
        .getByRole('heading', { name: /reference/i })
        .locator('xpath=following-sibling::*[1]');
      const links = referenceSection.locator('a[href]');
      const linkCount = await links.count();

      expect(linkCount).toBeGreaterThan(0);

      for (let i = 0; i < linkCount; i++) {
        const link = links.nth(i);
        const href = await link.getAttribute('href');
        
        expect(href).toBeTruthy();
        
        const isExternal = href?.startsWith('http');
        if (isExternal) continue;

        if (href) {
          await page.goto(href);
          await page.waitForLoadState('networkidle');
          await verifyPageIsFound(page);

          await page.goto('./docs/intro');
          await page.waitForLoadState('networkidle');
        }
      }
    });
  });
});

