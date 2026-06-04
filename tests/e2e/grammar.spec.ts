import { expect, test } from '@playwright/test';
import { GRAMMAR_LESSONS, GRAMMAR_SECTIONS } from './helpers/lessonData';
import { runLessonSuite } from './helpers/lessonSuite';
import { verifyPageIsFound } from './helpers/pageHelper';

runLessonSuite({
  title: 'Grammar Pages',
  segment: 'grammar',
  landingHeading: /grammar/i,
  navTitle: 'Grammar Landing Page Navigation',
  lessons: GRAMMAR_LESSONS,
  sections: GRAMMAR_SECTIONS,
  sectionTitle: section => `Grammar ${section} Page`,
  directAccessTitle: 'Individual Grammar Pages',
});

test.describe('Grammar Cross-references', () => {
  test('should navigate from Question Words to Indirect Questions via NextSteps', async ({ page }) => {
    await page.goto('./docs/lessons/grammar/sentence-building/question-words');
    await page.waitForLoadState('networkidle');

    const indirectQuestionsLink = page.locator('a[href*="sentence-building/indirect-questions"]').first();
    await expect(indirectQuestionsLink).toBeVisible();
    await indirectQuestionsLink.click();
    await verifyPageIsFound(page);
    await expect(page.getByRole('heading', { name: /indirect questions/i }).first()).toBeVisible();
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
