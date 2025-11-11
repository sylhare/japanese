import { test, expect } from '@playwright/test';
import { 
  waitForTables, 
  findTypeColumnIndex, 
  findTablesWithTypeColumn, 
  verifyColumnIsHidden 
} from './helpers/tableHelper';

test.describe('Vocabulary Type Column Visibility', () => {
  test('should hide Type column in colors article tables', async ({ page }) => {
    await page.goto('./docs/lessons/vocabulary/colors');
    const tables = await waitForTables(page);
    
    expect(await tables.count()).toBeGreaterThan(0);
    
    const tableIndicesWithType = await findTablesWithTypeColumn(tables);
    expect(tableIndicesWithType.length).toBeGreaterThan(0);
    
    for (const tableIndex of tableIndicesWithType) {
      const table = tables.nth(tableIndex);
      const typeColumnIndex = await findTypeColumnIndex(table);
      await verifyColumnIsHidden(table, typeColumnIndex);
    }
  });

  test('should hide Type column in tables across multiple vocabulary articles', async ({ page }) => {
    const articles = [
      '/japanese/docs/lessons/vocabulary/colors',
      '/japanese/docs/lessons/vocabulary/tastes',
      '/japanese/docs/lessons/vocabulary/family',
    ];
    
    for (const articlePath of articles) {
      await page.goto(articlePath);
      const tables = await waitForTables(page);
      
      expect(await tables.count()).toBeGreaterThan(0);
      
      const tableIndicesWithType = await findTablesWithTypeColumn(tables);
      expect(tableIndicesWithType.length).toBeGreaterThan(0);
      
      for (const tableIndex of tableIndicesWithType) {
        const table = tables.nth(tableIndex);
        const typeColumnIndex = await findTypeColumnIndex(table);
        
        const headers = table.locator('thead tr th, tr:first-child th');
        const typeHeader = headers.nth(typeColumnIndex);
        await expect(typeHeader).toBeHidden();
        
        const headerDisplay = await typeHeader.evaluate((el) => window.getComputedStyle(el).display);
        expect(headerDisplay).toBe('none');
      }
    }
  });

  test('should not affect tables without Type columns', async ({ page }) => {
    await page.goto('./docs/lessons/vocabulary/colors');
    const tables = await waitForTables(page);
    
    expect(await tables.count()).toBeGreaterThan(0);
    
    const tableCount = await tables.count();
    const tablesWithoutType: number[] = [];
    
    for (let i = 0; i < tableCount; i++) {
      const table = tables.nth(i);
      const typeColumnIndex = await findTypeColumnIndex(table);
      
      if (typeColumnIndex === -1) {
        tablesWithoutType.push(i);
      }
    }
    
    expect(tablesWithoutType.length).toBeGreaterThan(0);
    
    for (const tableIndex of tablesWithoutType) {
      const table = tables.nth(tableIndex);
      await expect(table).toBeVisible();
      
      const headers = table.locator('thead tr th, tr:first-child th');
      expect(await headers.count()).toBeGreaterThan(0);
      await expect(headers.first()).toBeVisible();
    }
  });
});
