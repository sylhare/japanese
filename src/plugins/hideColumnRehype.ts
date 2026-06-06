import type {Element, ElementContent, Root} from 'hast';
import {visit} from 'unist-util-visit';

/**
 * Rehype plugin that hides table columns in rendered lessons by adding CSS classes
 * at build time: the Type column everywhere (`hide-column`) and the Kanji column on
 * mobile (`hide-on-mobile`). Both columns stay in the markdown source so the
 * vocabulary extractor can still read them. Doing this at build time (rather than via
 * a client-side script) keeps the columns hidden on first paint — no flash of the
 * Type/Kanji column before JavaScript runs.
 */
const COLUMN_CLASS: Record<string, string> = {
  type: 'hide-column',
  kanji: 'hide-on-mobile',
};

function textContent(node: ElementContent): string {
  if (node.type === 'text') return node.value;
  if (node.type === 'element') return node.children.map(textContent).join('');
  return '';
}

function addClass(node: Element, className: string): void {
  node.properties ??= {};
  const existing = node.properties.className;
  const list = Array.isArray(existing) ? existing.map(String) : existing ? [String(existing)] : [];
  if (!list.includes(className)) list.push(className);
  node.properties.className = list;
}

function cellsOf(row: Element): Element[] {
  return row.children.filter(
    (child): child is Element =>
      child.type === 'element' && (child.tagName === 'th' || child.tagName === 'td'),
  );
}

function rowsOf(table: Element): Element[] {
  const rows: Element[] = [];
  visit(table, 'element', (node) => {
    if (node.tagName === 'tr') rows.push(node);
  });
  return rows;
}

export default function hideColumnRehype() {
  return (tree: Root): void => {
    visit(tree, 'element', (table) => {
      if (table.tagName !== 'table') return;

      const rows = rowsOf(table);
      if (rows.length === 0) return;

      const columnClasses = cellsOf(rows[0]).map(
        (cell) => COLUMN_CLASS[textContent(cell).trim().toLowerCase()] ?? null,
      );
      if (!columnClasses.some(Boolean)) return;

      for (const row of rows) {
        cellsOf(row).forEach((cell, index) => {
          const className = columnClasses[index];
          if (className) addClass(cell, className);
        });
      }
    });
  };
}
