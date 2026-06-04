import {beforeEach, describe, expect, it} from 'vitest';
import hideColumnPlugin from '../../src/plugins/hideColumnPlugin';

function getScriptContent(): string {
  const plugin = hideColumnPlugin();
  const htmlTags = plugin.injectHtmlTags?.({} as any);
  return htmlTags?.postBodyTags?.[0]?.innerHTML ?? '';
}

function extractHideColumns(): () => void {
  const script = getScriptContent();
  const match = script.match(/function hideColumns\(\) \{[\s\S]*?\n {2}\}/);
  if (!match) throw new Error('Could not extract hideColumns function');
  return new Function(`${match[0]}; hideColumns();`) as () => void;
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

describe('hideColumnPlugin', () => {
  it('should return a valid Docusaurus plugin', () => {
    const plugin = hideColumnPlugin();

    expect(plugin.name).toBe('hide-column-plugin');
    expect(typeof plugin.injectHtmlTags).toBe('function');
  });

  it('should inject a single script tag in postBodyTags', () => {
    const plugin = hideColumnPlugin();
    const htmlTags = plugin.injectHtmlTags?.({} as any);

    expect(htmlTags?.postBodyTags).toHaveLength(1);
    expect(htmlTags?.postBodyTags?.[0]).toMatchObject({tagName: 'script'});
  });

  describe('hideColumns behavior', () => {
    let hideColumns: () => void;

    beforeEach(() => {
      document.body.innerHTML = '';
      hideColumns = extractHideColumns();
    });

    it('should hide the Type column in tables', () => {
      const container = createTable(
        ['Hiragana', 'English', 'Type'],
        [
          ['こんにちは', 'Hello', 'Greeting'],
          ['さようなら', 'Goodbye', 'Greeting'],
        ],
      );

      hideColumns();

      const ths = container.querySelectorAll('th');
      expect(ths[0].classList.contains('hide-column')).toBe(false);
      expect(ths[1].classList.contains('hide-column')).toBe(false);
      expect(ths[2].classList.contains('hide-column')).toBe(true);

      const rows = container.querySelectorAll('tbody tr');
      rows.forEach((row) => {
        const cells = row.querySelectorAll('td');
        expect(cells[0].classList.contains('hide-column')).toBe(false);
        expect(cells[1].classList.contains('hide-column')).toBe(false);
        expect(cells[2].classList.contains('hide-column')).toBe(true);
      });
    });

    it('should mark the table with columnsHidden dataset', () => {
      const container = createTable(
        ['Hiragana', 'Type'],
        [['はい', 'Word']],
      );

      hideColumns();

      const table = container.querySelector('table')!;
      expect(table.dataset.columnsHidden).toBe('true');
    });

    it('should skip tables already processed', () => {
      const container = createTable(
        ['Hiragana', 'Type'],
        [['はい', 'Word']],
      );
      const table = container.querySelector('table')!;
      table.dataset.columnsHidden = 'true';

      hideColumns();

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

      hideColumns();

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

      hideColumns();

      const ths = container.querySelectorAll('th');
      expect(ths[1].classList.contains('hide-on-mobile')).toBe(true);
      expect(ths[3].classList.contains('hide-column')).toBe(true);

      const cells = container.querySelectorAll<HTMLElement>('tbody td');
      expect(cells[1].classList.contains('hide-on-mobile')).toBe(true);
      expect(cells[3].classList.contains('hide-column')).toBe(true);
    });

    it('should ignore tables outside .theme-doc-markdown.markdown', () => {
      const table = document.createElement('table');
      const tr = document.createElement('tr');
      const th = document.createElement('th');
      th.textContent = 'Type';
      tr.appendChild(th);
      table.appendChild(tr);
      document.body.appendChild(table);

      hideColumns();

      expect(th.style.display).not.toBe('none');
    });

    it('should handle tables without a Type or Kanji column', () => {
      const container = createTable(
        ['Hiragana', 'English'],
        [['はい', 'Yes']],
      );

      hideColumns();

      const table = container.querySelector('table')!;
      expect(table.dataset.columnsHidden).toBe('true');
      container.querySelectorAll('th, td').forEach((cell) => {
        expect(cell.classList.contains('hide-column')).toBe(false);
        expect(cell.classList.contains('hide-on-mobile')).toBe(false);
      });
    });
  });
});
