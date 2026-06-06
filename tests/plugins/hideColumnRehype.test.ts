import type {Element, Root} from 'hast';
import {describe, expect, it} from 'vitest';
import hideColumnRehype from '../../src/plugins/hideColumnRehype';

function cell(tag: 'th' | 'td', text: string): Element {
  return {
    type: 'element',
    tagName: tag,
    properties: {},
    children: [{type: 'text', value: text}],
  };
}

function row(tag: 'th' | 'td', values: string[]): Element {
  return {
    type: 'element',
    tagName: 'tr',
    properties: {},
    children: values.map((v) => cell(tag, v)),
  };
}

function table(headers: string[], bodyRows: string[][]): Element {
  return {
    type: 'element',
    tagName: 'table',
    properties: {},
    children: [
      {type: 'element', tagName: 'thead', properties: {}, children: [row('th', headers)]},
      {
        type: 'element',
        tagName: 'tbody',
        properties: {},
        children: bodyRows.map((r) => row('td', r)),
      },
    ],
  };
}

function tree(tableNode: Element): Root {
  return {type: 'root', children: [tableNode]};
}

function run(tableNode: Element): Element {
  const root = tree(tableNode);
  hideColumnRehype()(root);
  return root.children[0] as Element;
}

function classesAt(tableNode: Element, rowIndex: number, colIndex: number): string[] {
  const rows: Element[] = [];
  const walk = (node: Element) => {
    if (node.tagName === 'tr') rows.push(node);
    node.children.forEach((c) => c.type === 'element' && walk(c));
  };
  walk(tableNode);
  const cellNode = rows[rowIndex].children.filter(
    (c): c is Element => c.type === 'element',
  )[colIndex];
  const className = cellNode.properties?.className;
  return Array.isArray(className) ? className.map(String) : [];
}

describe('hideColumnRehype', () => {
  it('adds hide-column to the Type column (header and body cells)', () => {
    const result = run(
      table(['Hiragana', 'English', 'Type'], [['こんにちは', 'Hello', 'Greeting']]),
    );

    expect(classesAt(result, 0, 0)).not.toContain('hide-column');
    expect(classesAt(result, 0, 2)).toContain('hide-column');
    expect(classesAt(result, 1, 2)).toContain('hide-column');
  });

  it('adds hide-on-mobile to the Kanji column', () => {
    const result = run(
      table(['Hiragana', 'Kanji', 'English'], [['いぬ', '犬', 'Dog']]),
    );

    expect(classesAt(result, 0, 1)).toContain('hide-on-mobile');
    expect(classesAt(result, 1, 1)).toContain('hide-on-mobile');
    expect(classesAt(result, 0, 0)).not.toContain('hide-on-mobile');
  });

  it('handles both Type and Kanji columns in the same table', () => {
    const result = run(
      table(['Hiragana', 'Kanji', 'English', 'Type'], [['いぬ', '犬', 'Dog', 'Noun']]),
    );

    expect(classesAt(result, 0, 1)).toContain('hide-on-mobile');
    expect(classesAt(result, 0, 3)).toContain('hide-column');
    expect(classesAt(result, 1, 1)).toContain('hide-on-mobile');
    expect(classesAt(result, 1, 3)).toContain('hide-column');
  });

  it('is case-insensitive and ignores surrounding whitespace in headers', () => {
    const result = run(table([' TYPE '], [['noun']]));
    expect(classesAt(result, 0, 0)).toContain('hide-column');
  });

  it('leaves tables without Type or Kanji columns untouched', () => {
    const result = run(table(['Hiragana', 'English'], [['はい', 'Yes']]));

    expect(classesAt(result, 0, 0)).toEqual([]);
    expect(classesAt(result, 0, 1)).toEqual([]);
    expect(classesAt(result, 1, 0)).toEqual([]);
  });
});
