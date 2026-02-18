import { Locator, Page, expect } from '@playwright/test';

/**
 * Helper: Wait for tables to load on a page
 */
export async function waitForTables(page: Page) {
  await page.waitForLoadState('networkidle', { timeout: 30000 });
  await page.waitForSelector('article', { timeout: 10000 });
  await page.waitForSelector('table', { timeout: 30000 });
  const tables = page.locator('table');
  await tables.first().waitFor({ state: 'attached', timeout: 10000 });
  return tables;
}

/**
 * Helper: Find the index of the "Type" column in a table (returns -1 if not found)
 */
export async function findTypeColumnIndex(table: Locator): Promise<number> {
  const headers = table.locator('thead tr th, tr:first-child th');
  const headerCount = await headers.count();

  for (let i = 0; i < headerCount; i++) {
    const headerText = await headers.nth(i).textContent();
    const normalizedText = headerText?.trim().toLowerCase() || '';

    if (normalizedText === 'type') {
      return i;
    }
  }

  return -1;
}

/**
 * Helper: Find all tables that have a "Type" column
 */
export async function findTablesWithTypeColumn(tables: Locator): Promise<number[]> {
  const tableCount = await tables.count();
  const tablesWithType: number[] = [];

  for (let i = 0; i < tableCount; i++) {
    const table = tables.nth(i);
    const typeColumnIndex = await findTypeColumnIndex(table);

    if (typeColumnIndex !== -1) {
      tablesWithType.push(i);
    }
  }

  return tablesWithType;
}

/**
 * Helper: Verify that a specific column is hidden in a table (header + all cells)
 */
export async function verifyColumnIsHidden(table: Locator, columnIndex: number) {
  const headers = table.locator('thead tr th, tr:first-child th');
  const typeHeader = headers.nth(columnIndex);

  await expect(typeHeader).toBeHidden();
  const headerDisplay = await typeHeader.evaluate((el) => window.getComputedStyle(el).display);
  expect(headerDisplay).toBe('none');

  const allRows = table.locator('tr');
  const rowCount = await allRows.count();

  for (let rowIndex = 1; rowIndex < rowCount; rowIndex++) {
    const row = allRows.nth(rowIndex);
    const cells = row.locator('td, th');
    const cell = cells.nth(columnIndex);

    await expect(cell).toBeHidden();
    const cellDisplay = await cell.evaluate((el) => window.getComputedStyle(el).display);
    expect(cellDisplay).toBe('none');
  }
}

