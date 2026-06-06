import { expect, test } from '@playwright/test';
import { VOCABULARY_LESSONS, VOCABULARY_SECTIONS } from './helpers/lessonData';
import { runLessonSuite } from './helpers/lessonSuite';
import { verifyPageIsFound } from './helpers/pageHelper';

runLessonSuite({
  title: 'Vocabulary Pages',
  segment: 'vocabulary',
  landingHeading: /vocabulary/i,
  navTitle: 'Vocabulary Landing Page Navigation',
  lessons: VOCABULARY_LESSONS,
  sections: VOCABULARY_SECTIONS,
  sectionTitle: section => `${section} Pages`,
  directAccessTitle: 'Individual Vocabulary Pages',
  includeSidebarNav: true,
  matchLessonPathByAttr: true,
  directAccessNonPartialOnly: true,
  sectionTrailingSlash: true,
  sectionSubDirect: true,
  sectionSubSidebar: true,
});

test.describe('Vocabulary Cross-references', () => {
  test('should navigate from Calendar to Frequency Counters via NextSteps', async ({ page }) => {
    await page.goto('./docs/lessons/vocabulary/time/calendar');
    await page.waitForLoadState('networkidle');

    const countersLink = page.locator('a[href*="time/frequency"]').first();
    await expect(countersLink).toBeVisible();
    await countersLink.click();
    await verifyPageIsFound(page);
    await expect(page.getByRole('heading', { name: /frequency counters/i }).first()).toBeVisible();
  });

  test('should navigate from Food to Cooking via NextSteps', async ({ page }) => {
    await page.goto('./docs/lessons/vocabulary/food/food-and-ingredients');
    await page.waitForLoadState('networkidle');

    const cookingLink = page.locator('a[href*="food/cooking"]').first();
    await expect(cookingLink).toBeVisible();
    await cookingLink.click();
    await verifyPageIsFound(page);
    await expect(page.getByRole('heading', { name: /cooking|food prep/i }).first()).toBeVisible();
  });

  test('should navigate from Food to Tastes via NextSteps', async ({ page }) => {
    await page.goto('./docs/lessons/vocabulary/food/food-and-ingredients');
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
