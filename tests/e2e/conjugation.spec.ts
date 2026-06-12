import { expect, test } from '@playwright/test';
import { CONJUGATION_LESSONS, CONJUGATION_SECTIONS } from './helpers/lessonData';
import { runLessonSuite } from './helpers/lessonSuite';
import { verifyPageIsFound } from './helpers/pageHelper';

runLessonSuite({
  title: 'Conjugation',
  segment: 'conjugation',
  landingHeading: /conjugation/i,
  navTitle: 'Conjugation Lessons Navigation',
  lessons: CONJUGATION_LESSONS,
  sections: CONJUGATION_SECTIONS,
  sectionTitle: section => `${section} Forms Page`,
  directAccessTitle: 'Direct Page Access',
  includeSidebarNav: true,
  matchLessonPathByAttr: true,
});

test.describe('Conjugation Cross-references', () => {
  test('should navigate between conjugation lessons', async ({ page }) => {
    await page.goto('./docs/lessons/conjugation/basics');
    await page.waitForLoadState('networkidle');

    const dictionaryLink = page.locator('a[href*="conjugation/dictionary-form"]').first();
    await expect(dictionaryLink).toBeVisible();
    await dictionaryLink.click();
    await verifyPageIsFound(page);
    await expect(page.getByRole('heading', { name: /dictionary form/i }).first()).toBeVisible();
  });
});
