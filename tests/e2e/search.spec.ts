import { expect, test } from '@playwright/test';
import { verifyPageIsFound } from './helpers/pageHelper';

test.describe('Local Search', () => {
  const searchInput = 'input.navbar__search-input';

  test.beforeEach(async ({ page }) => {
    await page.goto('./');
    await page.waitForLoadState('networkidle');
  });

  test('should display the search bar in the navbar', async ({ page }) => {
    const input = page.locator('nav.navbar').locator(searchInput);
    await expect(input).toBeVisible();
    await expect(input).toHaveAttribute('aria-label', 'Search');
  });

  test('should return results for a query', async ({ page }) => {
    const input = page.locator(searchInput);
    await input.click();
    await input.fill('hiragana');

    const options = page.getByRole('option');
    await expect(options.first()).toBeVisible({ timeout: 15000 });
    expect(await options.count()).toBeGreaterThan(0);
    await expect(page.getByRole('listbox')).toContainText(/hiragana/i);
  });

  test('should navigate to a page when a result is clicked', async ({ page }) => {
    const input = page.locator(searchInput);
    await input.click();
    await input.fill('hiragana');

    const firstResult = page.getByRole('option').first();
    await expect(firstResult).toBeVisible({ timeout: 15000 });
    await firstResult.click();

    await expect(page).toHaveURL(/\/docs\//);
    await verifyPageIsFound(page);
    await expect(page.locator('article')).toBeVisible();
  });

  test('should show no results for a nonsense query', async ({ page }) => {
    const input = page.locator(searchInput);
    await input.click();
    await input.fill('zzzznonexistentqueryzzzz');

    await expect(page.getByText(/no results/i)).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole('option')).toHaveCount(0);
  });

  test('should open the full search results page with results', async ({ page }) => {
    await page.goto('./search?q=hiragana');
    await page.waitForLoadState('networkidle');

    await verifyPageIsFound(page);
    await expect(page.locator('input[name="q"]')).toHaveValue('hiragana');

    const resultLinks = page.locator('article a[href*="/docs/"]');
    await expect(resultLinks.first()).toBeVisible({ timeout: 15000 });
  });
});
