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

  test('gives feedback and reveals word details after answering', async ({ page }) => {
    await answerFirstQuestion(page);

    await expect(page.getByText(/^(Correct!|Incorrect)$/)).toBeVisible();
    await expect(page.locator('[class*="detail"]').first()).toBeVisible();
    await expect(page.getByRole('button', { name: 'Next' })).toBeVisible();
    await expect(optionButtons(page)).toHaveCount(0);
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

  test('navigates to a lesson from a revealed tag', async ({ page }) => {
    await answerFirstQuestion(page);

    const tag = page.locator('[class*="detail"] a[class*="tag"]').first();
    await expect(tag).toBeVisible();
    await tag.click();

    await verifyPageIsFound(page);
    await expect(page).toHaveURL(/\/docs\//);
  });

  test('switches to kanji mode and answers a kanji reading question', async ({ page }) => {
    const kanjiTab = page.getByRole('tab', { name: 'Learn Kanji' });
    await kanjiTab.click();
    await expect(kanjiTab).toHaveAttribute('aria-selected', 'true');
    await expect(page.getByText('How do you read this kanji?')).toBeVisible();

    const options = optionButtons(page);
    await expect(options).toHaveCount(4);
    await options.first().click();

    await expect(page.getByText(/^(Correct!|Incorrect)$/)).toBeVisible();
    await expect(page.getByRole('button', { name: 'Next' })).toBeVisible();
  });

  test('reveals Why button and shows bad answer explanation on incorrect answer', async ({ page }) => {
    let hitIncorrect = false;
    for (let attempt = 0; attempt < 5; attempt++) {
      const options = optionButtons(page);
      await expect(options.first()).toBeVisible();
      await options.first().click();

      const feedback = page.getByText(/^(Correct!|Incorrect)$/);
      await expect(feedback).toBeVisible();
      const text = await feedback.textContent();

      if (text === 'Incorrect') {
        hitIncorrect = true;
        break;
      }
      await page.getByRole('button', { name: 'Next' }).click();
    }

    expect(hitIncorrect).toBe(true);
    const whyButton = page.getByRole('button', { name: 'Why?' });
    await expect(whyButton).toBeVisible();
    await whyButton.click();
    await expect(page.getByText(/Your answer:/)).toBeVisible();
    await expect(page.getByRole('button', { name: 'Hide explanation' })).toBeVisible();

    await page.getByRole('button', { name: 'Hide explanation' }).click();
    await expect(page.getByText(/Your answer:/)).not.toBeVisible();
  });
});
