import { Page, expect } from '@playwright/test';

export async function verifyPageIsFound(page: Page) {
  await page.waitForLoadState('networkidle');

  const notFoundHeading = page.locator('h1.hero__title', { hasText: 'Page Not Found' });
  await expect(notFoundHeading).not.toBeVisible({ timeout: 5000 });
}

export async function navigateViaTag(page: Page, href: string, heading: RegExp) {
  await page.waitForSelector('a[class*="tag"]', { timeout: 15000 });
  const tag = page.locator(`a[class*="tag"][href*="${href}"]`).first();
  await expect(tag).toBeVisible({ timeout: 10000 });
  await tag.click();
  await verifyPageIsFound(page);
  await expect(page.getByRole('heading', { name: heading }).first()).toBeVisible();
}

export async function validateSidebarLinks(page: Page, section: string) {
  await page.waitForSelector('nav.menu', { timeout: 10000 });
  const links = page.locator(`a.menu__link[href*="/${section}/"]`)
    .filter({ hasNotText: new RegExp(`^${section}$`, 'i') });
  const count = await links.count();
  expect(count).toBeGreaterThan(0);
  for (let i = 0; i < count; i++) {
    const href = await links.nth(i).getAttribute('href');
    expect(href).toBeTruthy();
    expect(href).toMatch(new RegExp(`${section}/`));
  }
}

export async function validateCardLinks(page: Page, section: string) {
  const cardLinks = page.locator(`a[class*="lessonCard"][href*="/${section}/"]`);
  const count = await cardLinks.count();
  expect(count).toBeGreaterThan(0);
  for (let i = 0; i < count; i++) {
    const link = cardLinks.nth(i);
    await expect(link).toBeVisible();
    const href = await link.getAttribute('href');
    expect(href).toBeTruthy();
    expect(href).toMatch(/\/(docs\/lessons|japanese\/docs\/lessons)/);
  }
}
