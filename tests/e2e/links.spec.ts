import { test, expect } from '@playwright/test';

async function verifyPageIsFound(page: any) {
  await page.waitForLoadState('networkidle');
  const pageContent = await page.textContent('body');
  expect(pageContent).not.toContain('Page Not Found');
  const article = page.locator('article').first();
  await expect(article).toBeVisible();
}

test.describe('Vocabulary Sidebar Links', () => {
  test('should navigate to Colors from sidebar', async ({ page }) => {
    await page.goto('./docs/lessons/vocabulary/');
    await page.waitForLoadState('networkidle');
    
    const colorsLink = page.locator('a.menu__link[href$="/vocabulary/colors"]').first();
    await expect(colorsLink).toBeVisible();
    await colorsLink.click();
    await verifyPageIsFound(page);
    await expect(page.getByRole('heading', { name: /colors/i }).first()).toBeVisible();
  });

  test('should navigate to Tastes from sidebar', async ({ page }) => {
    await page.goto('./docs/lessons/vocabulary/');
    await page.waitForLoadState('networkidle');
    
    const tastesLink = page.locator('a.menu__link[href$="/vocabulary/tastes"]').first();
    await expect(tastesLink).toBeVisible();
    await tastesLink.click();
    await verifyPageIsFound(page);
    await expect(page.getByRole('heading', { name: /tastes|flavors/i }).first()).toBeVisible();
  });

  test('should navigate to Time from sidebar', async ({ page }) => {
    await page.goto('./docs/lessons/vocabulary/');
    await page.waitForLoadState('networkidle');
    
    const timeLink = page.locator('a.menu__link[href$="/vocabulary/time"]').first();
    await expect(timeLink).toBeVisible();
    await timeLink.click();
    await verifyPageIsFound(page);
    await expect(page.getByRole('heading', { name: /time|dates/i }).first()).toBeVisible();
  });

  test('should navigate to Numbers from sidebar', async ({ page }) => {
    await page.goto('./docs/lessons/vocabulary/');
    await page.waitForLoadState('networkidle');
    
    const numbersLink = page.locator('a.menu__link[href$="/vocabulary/numbers"]').first();
    await expect(numbersLink).toBeVisible();
    await numbersLink.click();
    await verifyPageIsFound(page);
    await expect(page.getByRole('heading', { name: /numbers|counting/i }).first()).toBeVisible();
  });

  test('should navigate to Family from sidebar', async ({ page }) => {
    await page.goto('./docs/lessons/vocabulary/');
    await page.waitForLoadState('networkidle');
    
    const familyLink = page.locator('a.menu__link[href$="/vocabulary/family"]').first();
    await expect(familyLink).toBeVisible();
    await familyLink.click();
    await verifyPageIsFound(page);
    await expect(page.getByRole('heading', { name: /family|relationships/i }).first()).toBeVisible();
  });

  test('should navigate to Confusing Kanji from sidebar', async ({ page }) => {
    await page.goto('./docs/lessons/vocabulary/');
    await page.waitForLoadState('networkidle');
    
    const kanjiLink = page.locator('a.menu__link[href$="/vocabulary/confusing-kanji"]').first();
    await expect(kanjiLink).toBeVisible();
    await kanjiLink.click();
    await verifyPageIsFound(page);
    await expect(page.getByRole('heading', { name: /confusing kanji/i }).first()).toBeVisible();
  });
});

test.describe('Vocabulary Landing Page Links (LessonList)', () => {
  test('should navigate to Colors from landing page', async ({ page }) => {
    await page.goto('./docs/lessons/vocabulary/');
    await page.waitForLoadState('networkidle');
    
    const colorsCard = page.locator('a[class*="lessonCard"][href$="/vocabulary/colors"]').first();
    await expect(colorsCard).toBeVisible();
    await colorsCard.click();
    await verifyPageIsFound(page);
    await expect(page.getByRole('heading', { name: /colors/i }).first()).toBeVisible();
  });

  test('should navigate to Tastes from landing page', async ({ page }) => {
    await page.goto('./docs/lessons/vocabulary/');
    await page.waitForLoadState('networkidle');
    
    const tastesCard = page.locator('a[class*="lessonCard"][href$="/vocabulary/tastes"]').first();
    await expect(tastesCard).toBeVisible();
    await tastesCard.click();
    await verifyPageIsFound(page);
    await expect(page.getByRole('heading', { name: /tastes|flavors/i }).first()).toBeVisible();
  });

  test('should navigate to Time from landing page', async ({ page }) => {
    await page.goto('./docs/lessons/vocabulary/');
    await page.waitForLoadState('networkidle');
    
    const timeCard = page.locator('a[class*="lessonCard"][href$="/vocabulary/time"]').first();
    await expect(timeCard).toBeVisible();
    await timeCard.click();
    await verifyPageIsFound(page);
    await expect(page.getByRole('heading', { name: /time|dates/i }).first()).toBeVisible();
  });

  test('should navigate to Numbers from landing page', async ({ page }) => {
    await page.goto('./docs/lessons/vocabulary/');
    await page.waitForLoadState('networkidle');
    
    const numbersCard = page.locator('a[class*="lessonCard"][href$="/vocabulary/numbers"]').first();
    await expect(numbersCard).toBeVisible();
    await numbersCard.click();
    await verifyPageIsFound(page);
    await expect(page.getByRole('heading', { name: /numbers|counting/i }).first()).toBeVisible();
  });

  test('should navigate to Family from landing page', async ({ page }) => {
    await page.goto('./docs/lessons/vocabulary/');
    await page.waitForLoadState('networkidle');
    
    const familyCard = page.locator('a[class*="lessonCard"][href$="/vocabulary/family"]').first();
    await expect(familyCard).toBeVisible();
    await familyCard.click();
    await verifyPageIsFound(page);
    await expect(page.getByRole('heading', { name: /family|relationships/i }).first()).toBeVisible();
  });

  test('should navigate to Confusing Kanji from landing page', async ({ page }) => {
    await page.goto('./docs/lessons/vocabulary/');
    await page.waitForLoadState('networkidle');
    
    const kanjiCard = page.locator('a[class*="lessonCard"][href$="/vocabulary/confusing-kanji"]').first();
    await expect(kanjiCard).toBeVisible();
    await kanjiCard.click();
    await verifyPageIsFound(page);
    await expect(page.getByRole('heading', { name: /confusing kanji/i }).first()).toBeVisible();
  });
});

test.describe('Vocabulary Search Page', () => {
  test('should display Japanese Vocabulary heading', async ({ page }) => {
    await page.goto('./vocabulary');
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('h1');
    
    const heading = page.locator('h1').filter({ hasText: 'Japanese Vocabulary' });
    await expect(heading).toBeVisible({ timeout: 10000 });
  });

  test('should navigate to Colors from tag', async ({ page }) => {
    await page.goto('./vocabulary');
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('a[class*="tag"]', { timeout: 15000 });
    
    const colorsTag = page.locator('a[class*="tag"][href$="/vocabulary/colors"]').first();
    await expect(colorsTag).toBeVisible({ timeout: 10000 });
    await colorsTag.click();
    await verifyPageIsFound(page);
    await expect(page.getByRole('heading', { name: /colors/i }).first()).toBeVisible();
  });

  test('should navigate to Family from tag', async ({ page }) => {
    await page.goto('./vocabulary');
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('a[class*="tag"]', { timeout: 15000 });
    
    const familyTag = page.locator('a[class*="tag"][href$="/vocabulary/family"]').first();
    await expect(familyTag).toBeVisible({ timeout: 10000 });
    await familyTag.click();
    await verifyPageIsFound(page);
    await expect(page.getByRole('heading', { name: /family/i }).first()).toBeVisible();
  });

  test('should navigate to Tastes from tag', async ({ page }) => {
    await page.goto('./vocabulary');
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('a[class*="tag"]', { timeout: 15000 });
    
    const tastesTag = page.locator('a[class*="tag"][href$="/vocabulary/tastes"]').first();
    await expect(tastesTag).toBeVisible({ timeout: 10000 });
    await tastesTag.click();
    await verifyPageIsFound(page);
    await expect(page.getByRole('heading', { name: /tastes/i }).first()).toBeVisible();
  });

  test('should navigate to Time from tag', async ({ page }) => {
    await page.goto('./vocabulary');
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('a[class*="tag"]', { timeout: 15000 });
    
    const timeTag = page.locator('a[class*="tag"][href$="/vocabulary/time"]').first();
    await expect(timeTag).toBeVisible({ timeout: 10000 });
    await timeTag.click();
    await verifyPageIsFound(page);
    await expect(page.getByRole('heading', { name: /time/i }).first()).toBeVisible();
  });

  test('should navigate to Numbers from tag', async ({ page }) => {
    await page.goto('./vocabulary');
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('a[class*="tag"]', { timeout: 15000 });
    
    const numbersTag = page.locator('a[class*="tag"][href$="/vocabulary/numbers"]').first();
    await expect(numbersTag).toBeVisible({ timeout: 10000 });
    await numbersTag.click();
    await verifyPageIsFound(page);
    await expect(page.getByRole('heading', { name: /numbers/i }).first()).toBeVisible();
  });
});

test.describe('Link Validation', () => {
  test('should have valid href attributes for all vocabulary sidebar links', async ({ page }) => {
    await page.goto('./docs/lessons/vocabulary/');
    await page.waitForLoadState('networkidle');
    
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
    await page.goto('./docs/lessons/vocabulary/');
    await page.waitForLoadState('networkidle');
    
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
