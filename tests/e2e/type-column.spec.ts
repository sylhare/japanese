import { test, expect } from '@playwright/test';

test.describe('Vocabulary Type Column Visibility', () => {
  test('should hide Type column in colors article tables', async ({ page }) => {
    await page.goto('/docs/lessons/vocabulary/colors');
    
    await page.waitForLoadState('networkidle');
    
    const tables = page.locator('.theme-doc-markdown.markdown table');
    const tableCount = await tables.count();
    
    if (tableCount > 0) {
      await tables.first().waitFor({ state: 'attached', timeout: 10000 });
    }
    
    for (let i = 0; i < tableCount; i++) {
      const table = tables.nth(i);
      const typeHeader = table.locator('th').filter({ hasText: /^Type$/i });
      const typeHeaderCount = await typeHeader.count();
      
      if (typeHeaderCount > 0) {
        await expect(typeHeader.first()).toBeHidden();
        
        const headerStyle = await typeHeader.first().evaluate((el) => {
          return window.getComputedStyle(el).display;
        });
        expect(headerStyle).toBe('none');
        
        const allRows = table.locator('tr');
        const rowCount = await allRows.count();
        
        const headers = table.locator('thead tr th, tr:first-child th');
        let typeColumnIndex = -1;
        const headerCount = await headers.count();
        
        for (let j = 0; j < headerCount; j++) {
          const headerText = await headers.nth(j).textContent();
          if (headerText?.trim().toLowerCase() === 'type') {
            typeColumnIndex = j;
            break;
          }
        }
        
        if (typeColumnIndex !== -1) {
          for (let rowIndex = 1; rowIndex < rowCount; rowIndex++) {
            const row = allRows.nth(rowIndex);
            const cells = row.locator('td, th');
            const cell = cells.nth(typeColumnIndex);
            
            const cellCount = await cell.count();
            if (cellCount > 0) {
              await expect(cell).toBeHidden();
              
              const cellStyle = await cell.evaluate((el) => {
                return window.getComputedStyle(el).display;
              });
              expect(cellStyle).toBe('none');
            }
          }
        }
      }
    }
  });

  test('should hide Type column in tables across multiple vocabulary articles', async ({ page }) => {
    const articles = [
      '/docs/lessons/vocabulary/colors',
      '/docs/lessons/vocabulary/tastes',
      '/docs/lessons/vocabulary/family',
    ];
    
    for (const articlePath of articles) {
      await page.goto(articlePath);
      
      await page.waitForLoadState('networkidle');
      
      const tables = page.locator('.theme-doc-markdown.markdown table');
      const tableCount = await tables.count();
      
      if (tableCount > 0) {
        await tables.first().waitFor({ state: 'attached', timeout: 10000 });
      }
      
      for (let i = 0; i < tableCount; i++) {
        const table = tables.nth(i);
        const typeHeader = table.locator('th').filter({ hasText: /^Type$/i });
        const typeHeaderCount = await typeHeader.count();
        
        if (typeHeaderCount > 0) {
          await expect(typeHeader.first()).toBeHidden();
          
          const headerStyle = await typeHeader.first().evaluate((el) => {
            return window.getComputedStyle(el).display;
          });
          expect(headerStyle).toBe('none');
        }
      }
    }
  });

  test('should not affect tables without Type columns', async ({ page }) => {
    await page.goto('/docs/lessons/vocabulary/colors');
    
    await page.waitForLoadState('networkidle');
    
    const tables = page.locator('.theme-doc-markdown.markdown table');
    const tableCount = await tables.count();
    
    if (tableCount > 0) {
      await tables.first().waitFor({ state: 'attached', timeout: 10000 });
    }
    
    if (tableCount === 0) {
      return;
    }
    
    let tablesWithoutType = 0;
    
    for (let i = 0; i < tableCount; i++) {
      const table = tables.nth(i);
      const typeHeader = table.locator('th').filter({ hasText: /^Type$/i });
      const typeHeaderCount = await typeHeader.count();
      
      if (typeHeaderCount === 0) {
        tablesWithoutType++;
        await expect(table).toBeVisible();
        
        const headers = table.locator('thead tr th, tr:first-child th');
        const headerCount = await headers.count();
        expect(headerCount).toBeGreaterThan(0);
        
        const firstHeader = headers.first();
        await expect(firstHeader).toBeVisible();
      }
    }
    
    expect(tablesWithoutType).toBeGreaterThan(0);
  });
});
