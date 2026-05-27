import {beforeEach, describe, expect, it} from 'vitest';
import hideTypeColumnPlugin from '../../src/plugins/hideTypeColumnPlugin';

function getScriptContent(): string {
  const plugin = hideTypeColumnPlugin();
  const htmlTags = plugin.injectHtmlTags?.({} as any);
  return htmlTags?.postBodyTags?.[0]?.innerHTML ?? '';
}

function extractHideTypeColumns(): () => void {
  const script = getScriptContent();
  const match = script.match(/function hideTypeColumns\(\) \{[\s\S]*?\n {2}\}/);
  if (!match) throw new Error('Could not extract hideTypeColumns function');
  return new Function(`${match[0]}; hideTypeColumns();`) as () => void;
}

function createTable(headers: string[], rows: string[][]): HTMLElement {
  const container = document.createElement('div');
  container.className = 'theme-doc-markdown markdown';

  const table = document.createElement('table');
  const thead = document.createElement('thead');
  const headerRow = document.createElement('tr');
  headers.forEach((h) => {
    const th = document.createElement('th');
    th.textContent = h;
    headerRow.appendChild(th);
  });
  thead.appendChild(headerRow);
  table.appendChild(thead);

  const tbody = document.createElement('tbody');
  rows.forEach((row) => {
    const tr = document.createElement('tr');
    row.forEach((cell) => {
      const td = document.createElement('td');
      td.textContent = cell;
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });
  table.appendChild(tbody);

  container.appendChild(table);
  document.body.appendChild(container);
  return container;
}

describe('hideTypeColumnPlugin', () => {
  it('should return a valid Docusaurus plugin', () => {
    const plugin = hideTypeColumnPlugin();

    expect(plugin.name).toBe('hide-type-column-plugin');
    expect(typeof plugin.injectHtmlTags).toBe('function');
  });

  it('should inject a single script tag in postBodyTags', () => {
    const plugin = hideTypeColumnPlugin();
    const htmlTags = plugin.injectHtmlTags?.({} as any);

    expect(htmlTags?.postBodyTags).toHaveLength(1);
    expect(htmlTags?.postBodyTags?.[0]).toMatchObject({tagName: 'script'});
  });

  describe('hideTypeColumns behavior', () => {
    let hideTypeColumns: () => void;

    beforeEach(() => {
      document.body.innerHTML = '';
      hideTypeColumns = extractHideTypeColumns();
    });

    it('should hide the Type column in tables', () => {
      const container = createTable(
        ['Hiragana', 'English', 'Type'],
        [
          ['こんにちは', 'Hello', 'Greeting'],
          ['さようなら', 'Goodbye', 'Greeting'],
        ],
      );

      hideTypeColumns();

      const ths = container.querySelectorAll('th');
      expect(ths[0].style.display).not.toBe('none');
      expect(ths[1].style.display).not.toBe('none');
      expect(ths[2].style.display).toBe('none');

      const rows = container.querySelectorAll('tbody tr');
      rows.forEach((row) => {
        const cells = row.querySelectorAll('td');
        expect(cells[0].style.display).not.toBe('none');
        expect(cells[1].style.display).not.toBe('none');
        expect(cells[2].style.display).toBe('none');
      });
    });

    it('should mark the table with typeColumnHidden dataset', () => {
      const container = createTable(
        ['Hiragana', 'Type'],
        [['はい', 'Word']],
      );

      hideTypeColumns();

      const table = container.querySelector('table')!;
      expect(table.dataset.typeColumnHidden).toBe('true');
    });

    it('should skip tables already processed', () => {
      const container = createTable(
        ['Hiragana', 'Type'],
        [['はい', 'Word']],
      );
      const table = container.querySelector('table')!;
      table.dataset.typeColumnHidden = 'true';

      hideTypeColumns();

      const ths = container.querySelectorAll('th');
      expect(ths[1].style.display).not.toBe('none');
    });

    it('should add hide-on-mobile class to the Kanji column', () => {
      const container = createTable(
        ['Hiragana', 'Kanji', 'English'],
        [
          ['いぬ', '犬', 'Dog'],
          ['ねこ', '猫', 'Cat'],
        ],
      );

      hideTypeColumns();

      const ths = container.querySelectorAll('th');
      expect(ths[0].classList.contains('hide-on-mobile')).toBe(false);
      expect(ths[1].classList.contains('hide-on-mobile')).toBe(true);
      expect(ths[2].classList.contains('hide-on-mobile')).toBe(false);

      const rows = container.querySelectorAll('tbody tr');
      rows.forEach((row) => {
        const cells = row.querySelectorAll('td');
        expect(cells[0].classList.contains('hide-on-mobile')).toBe(false);
        expect(cells[1].classList.contains('hide-on-mobile')).toBe(true);
        expect(cells[2].classList.contains('hide-on-mobile')).toBe(false);
      });
    });

    it('should handle both Type and Kanji columns in the same table', () => {
      const container = createTable(
        ['Hiragana', 'Kanji', 'English', 'Type'],
        [['いぬ', '犬', 'Dog', 'Noun']],
      );

      hideTypeColumns();

      const ths = container.querySelectorAll('th');
      expect(ths[1].classList.contains('hide-on-mobile')).toBe(true);
      expect(ths[3].style.display).toBe('none');

      const cells = container.querySelectorAll<HTMLElement>('tbody td');
      expect(cells[1].classList.contains('hide-on-mobile')).toBe(true);
      expect(cells[3].style.display).toBe('none');
    });

    it('should ignore tables outside .theme-doc-markdown.markdown', () => {
      const table = document.createElement('table');
      const tr = document.createElement('tr');
      const th = document.createElement('th');
      th.textContent = 'Type';
      tr.appendChild(th);
      table.appendChild(tr);
      document.body.appendChild(table);

      hideTypeColumns();

      expect(th.style.display).not.toBe('none');
    });

    it('should handle tables without a Type or Kanji column', () => {
      const container = createTable(
        ['Hiragana', 'English'],
        [['はい', 'Yes']],
      );

      hideTypeColumns();

      const table = container.querySelector('table')!;
      expect(table.dataset.typeColumnHidden).toBeUndefined();
      container.querySelectorAll('th, td').forEach((cell) => {
        expect((cell as HTMLElement).style.display).not.toBe('none');
        expect(cell.classList.contains('hide-on-mobile')).toBe(false);
      });
    });
  });
});
