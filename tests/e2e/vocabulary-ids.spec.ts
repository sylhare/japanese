import { expect, test } from '@playwright/test';
import { findDuplicateIds, groupByIdPrefix, loadVocabularyData } from './helpers/vocabularyHelper';

test.describe('Vocabulary IDs Validation', () => {
  test('should have unique and incremental IDs for all vocabulary items', () => {
    const data = loadVocabularyData();
    const duplicateIds = findDuplicateIds(data.vocabulary);
    expect(duplicateIds).toHaveLength(0);
    const byPrefix = groupByIdPrefix(data.vocabulary);

    for (const items of byPrefix.values()) {
      const suffixes = items
        .map(item => {
          const parts = item.id.split('_');
          return parseInt(parts[parts.length - 1], 10);
        })
        .sort((a, b) => a - b);

      for (let i = 0; i < suffixes.length; i++) {
        expect(suffixes[i]).toBe(i);
      }
    }
  });
});

