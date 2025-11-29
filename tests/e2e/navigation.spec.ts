import { expect, test } from '@playwright/test';
import { verifyPageExists, verifyPageIsFound } from './helpers/pageHelper';

test.describe('Site Navigation', () => {
  test.describe('Header Navigation', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('./');
      await page.waitForLoadState('networkidle');
    });

    test('should have working header navigation links', async ({ page }) => {
      const header = page.locator('nav.navbar');
      await expect(header).toBeVisible();

      const headerLinks = header.locator('a').filter({
        has: page.locator('[href]'),
      }).filter({
        hasNotText: /^$/,
      });

      const linkCount = await headerLinks.count();
      expect(linkCount).toBeGreaterThan(0);

      for (let i = 0; i < linkCount; i++) {
        const link = headerLinks.nth(i);
        const href = await link.getAttribute('href');
        const linkText = await link.textContent();

        await link.click();
        await verifyPageExists(page);

        await page.goto('./');
        await page.waitForLoadState('networkidle');
      }
    });

    test('should display header logo', async ({ page }) => {
      const header = page.locator('nav.navbar');
      await expect(header).toBeVisible();

      const logo = header.locator('.navbar__brand');
      await expect(logo).toBeVisible();
    });

    test('should have all expected header links', async ({ page }) => {
      const header = page.locator('nav.navbar');
      
      const lessonsLink = header.locator('a.navbar__link').filter({ hasText: /^Lessons$/i });
      await expect(lessonsLink).toBeVisible();

      const dictionaryLink = header.locator('a.navbar__link').filter({ hasText: /^Dictionary$/i });
      await expect(dictionaryLink).toBeVisible();

      const kanaLink = header.locator('a').filter({ hasText: /kana/i }).first();
      await expect(kanaLink).toBeVisible();
    });
  });

  test.describe('Footer Navigation', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('./');
      await page.waitForLoadState('networkidle');
    });

    test('should have working footer navigation links', async ({ page }) => {
      const footer = page.locator('footer.footer');
      await expect(footer).toBeVisible();

      const footerLinks = footer.locator('a').filter({
        has: page.locator('[href]'),
      }).filter({
        hasNotText: /^$/,
      });

      const linkCount = await footerLinks.count();
      expect(linkCount).toBeGreaterThan(0);

      for (let i = 0; i < linkCount; i++) {
        const link = footerLinks.nth(i);
        const href = await link.getAttribute('href');
        const linkText = await link.textContent();

        await link.click();
        await verifyPageExists(page);

        await page.goto('./');
        await page.waitForLoadState('networkidle');
      }
    });

    test('should display footer content', async ({ page }) => {
      const footer = page.locator('footer.footer');
      await expect(footer).toBeVisible();

      const footerText = await footer.textContent();
      expect(footerText).toContain('Japanese Lessons');
    });

    test('should have footer sections', async ({ page }) => {
      const footer = page.locator('footer.footer');
      await expect(footer).toBeVisible();

      const footerSections = footer.locator('.footer__col');
      const sectionCount = await footerSections.count();
      expect(sectionCount).toBeGreaterThan(0);
    });
  });

  test.describe('Sidebar Navigation', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('./docs/intro');
      await page.waitForLoadState('networkidle');
    });

    test('should display sidebar on docs pages', async ({ page }) => {
      const sidebar = page.locator('aside.theme-doc-sidebar-container');
      await expect(sidebar).toBeVisible();
    });

    test('should have expandable categories in sidebar', async ({ page }) => {
      const sidebar = page.locator('aside.theme-doc-sidebar-container');
      const categories = sidebar.locator('.menu__list-item--collapsed, .theme-doc-sidebar-item-category');
      const categoryCount = await categories.count();
      
      expect(categoryCount).toBeGreaterThan(0);
    });

    test('should highlight active page in sidebar', async ({ page }) => {
      const sidebar = page.locator('aside.theme-doc-sidebar-container');
      const activeLink = sidebar.locator('a.menu__link--active');
      
      await expect(activeLink.first()).toBeVisible();
    });
  });

  test.describe('Breadcrumb Navigation', () => {
    test('should display breadcrumbs on docs pages', async ({ page }) => {
      await page.goto('./docs/lessons/vocabulary/colors');
      await page.waitForLoadState('networkidle');

      const breadcrumbs = page.locator('nav.theme-doc-breadcrumbs');
      await expect(breadcrumbs).toBeVisible();
    });

    test('should have working breadcrumb links', async ({ page }) => {
      await page.goto('./docs/lessons/vocabulary/colors');
      await page.waitForLoadState('networkidle');

      const breadcrumbs = page.locator('nav.theme-doc-breadcrumbs');
      const breadcrumbLinks = breadcrumbs.locator('a');
      
      expect(await breadcrumbLinks.count()).toBeGreaterThan(0);
      
      const firstLink = breadcrumbLinks.first();
      await firstLink.click();
      await verifyPageExists(page);
    });
  });

  test.describe('Mobile Navigation', () => {
    test.use({ viewport: { width: 375, height: 667 } });

    test('should show mobile menu button on small screens', async ({ page }) => {
      await page.goto('./');
      await page.waitForLoadState('networkidle');

      const mobileMenuButton = page.locator('button.navbar__toggle');
      await expect(mobileMenuButton).toBeVisible();
    });

    test('should open mobile menu when clicked', async ({ page }) => {
      await page.goto('./');
      await page.waitForLoadState('networkidle');

      const mobileMenuButton = page.locator('button.navbar__toggle');
      await mobileMenuButton.click();

      const mobileMenu = page.locator('.navbar-sidebar');
      await expect(mobileMenu).toBeVisible();
    });
  });
});

