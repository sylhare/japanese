import { expect, test } from '@playwright/test';
import { verifyPageIsFound } from './helpers/pageHelper';

const optionButtons = (page: import('@playwright/test').Page) =>
  page.locator('button[class*="option"]');

async function answerFirstQuestion(page: import('@playwright/test').Page) {
  const options = optionButtons(page);
  await expect(options.first()).toBeVisible();
  await options.first().click();
}

test.describe('Study', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('./study');
    await page.waitForLoadState('networkidle');

    await page.evaluate(() => window.localStorage.clear());
    await page.reload();
    await page.waitForLoadState('networkidle');
  });

  test('reaches the study page from the navbar', async ({ page }) => {
    await page.goto('/');
    const studyLink = page.getByRole('link', { name: /^study$/i });
    await studyLink.first().click();
    await expect(page).toHaveURL(/.*study/);
    await expect(page.getByRole('heading', { name: 'Study Vocabulary' })).toBeVisible();
  });

  test('shows a prompt with four answer options', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Study Vocabulary' })).toBeVisible();
    await expect(optionButtons(page)).toHaveCount(4);
  });

  test('gives feedback and reveals word details after answering', async ({ page }) => {
    await answerFirstQuestion(page);

    await expect(page.getByText(/^(Correct!|Incorrect)$/)).toBeVisible();
    await expect(page.locator('[class*="detail"]').first()).toBeVisible();
    await expect(page.getByRole('button', { name: 'Next' })).toBeVisible();

    await expect(page.locator('button[class*="optionCorrect"]')).toHaveCount(1);
  });

  test('advances to a new question and increments answered count', async ({ page }) => {
    await expect(page.getByText('Answered: 0')).toBeVisible();
    await answerFirstQuestion(page);
    await page.getByRole('button', { name: 'Next' }).click();

    await expect(page.getByText('Answered: 1')).toBeVisible();
    await expect(page.getByText(/^(Correct!|Incorrect)$/)).toBeHidden();
  });

  test('persists progress across reloads and resets it', async ({ page }) => {
    await answerFirstQuestion(page);
    await page.getByRole('button', { name: 'Next' }).click();
    await expect(page.getByText('Answered: 1')).toBeVisible();

    await page.reload();
    await page.waitForLoadState('networkidle');
    await expect(page.getByText('Answered: 1')).toBeVisible();

    await page.getByRole('button', { name: 'Reset progress' }).click();
    await expect(page.getByText('Answered: 0')).toBeVisible();
  });

  test('filters the study set through settings', async ({ page }) => {
    await page.getByRole('button', { name: 'Settings' }).click();
    await expect(page.getByText('Sources', { exact: true })).toBeVisible();
    await expect(page.getByText('Word types', { exact: true })).toBeVisible();

    await page.getByRole('button', { name: 'None' }).nth(1).click();

    await expect(page.getByText('No words to study')).toBeVisible();
  });

  test('navigates to a lesson from a revealed tag', async ({ page }) => {
    await answerFirstQuestion(page);

    const tag = page.locator('[class*="detail"] a[class*="tag"]').first();
    await expect(tag).toBeVisible();
    await tag.click();

    await verifyPageIsFound(page);
    // Tags resolve to lesson pages or reference articles (e.g. the N5 tag).
    await expect(page).toHaveURL(/\/docs\//);
  });
});
