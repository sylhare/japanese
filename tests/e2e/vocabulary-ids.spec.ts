import { test, expect } from '@playwright/test';
import { loadVocabularyData, findDuplicateIds, groupByIdPrefix } from './helpers/vocabularyHelper';

test.describe('Vocabulary IDs Validation', () => {
  test('should have unique and incremental IDs for all vocabulary items', () => {
    const data = loadVocabularyData();
    const duplicateIds = findDuplicateIds(data.vocabulary);
    expect(duplicateIds).toHaveLength(0);
    const byPrefix = groupByIdPrefix(data.vocabulary);
    
    for (const items of byPrefix.values()) {
      const suffixes = items
        .map(item => parseInt(item.id.split('_').pop()!, 10))
        .sort((a, b) => a - b);
      
      for (let i = 0; i < suffixes.length; i++) {
        expect(suffixes[i]).toBe(i);
      }
    }
  });
});

