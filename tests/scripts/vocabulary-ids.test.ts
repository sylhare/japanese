import { describe, expect, it } from 'vitest';
import { type VocabularyItem, loadVocabularyData } from '../test-utils';

function findDuplicateIds(items: VocabularyItem[]): string[] {
  const seen = new Set<string>();
  const duplicates: string[] = [];
  for (const item of items) {
    seen.has(item.id) ? duplicates.push(item.id) : seen.add(item.id);
  }
  return duplicates;
}

function groupByIdPrefix(items: VocabularyItem[]): Map<string, VocabularyItem[]> {
  return items.reduce((map, item) => {
    const prefix = item.id.substring(0, item.id.lastIndexOf('_'));
    map.set(prefix, [...(map.get(prefix) || []), item]);
    return map;
  }, new Map<string, VocabularyItem[]>());
}

describe('Vocabulary IDs', () => {
  const { vocabulary } = loadVocabularyData();

  it('loads vocabulary entries from vocabulary.yaml', () => {
    expect(vocabulary.length).toBeGreaterThan(0);
  });

  it('are unique across all entries', () => {
    expect(findDuplicateIds(vocabulary)).toHaveLength(0);
  });

  it('increment within each lesson prefix', () => {
    for (const items of groupByIdPrefix(vocabulary).values()) {
      const suffixes = items
        .map(item => parseInt(item.id.split('_').pop() ?? '', 10))
        .sort((a, b) => a - b);
      for (let i = 1; i < suffixes.length; i++) {
        expect(suffixes[i]).toBeGreaterThan(suffixes[i - 1]);
      }
    }
  });
});
