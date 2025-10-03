import { describe, it, expect } from 'vitest';
import { mergeVocabulary } from '../scripts/extract-vocabulary.js';
import {
  createDuplicateTestData,
  createPartialDuplicateTestData,
  createIdempotentTestData,
  createEmptyTestData,
  createMissingFieldsTestData,
  createCaseInsensitiveTestData,
  createDifferentMeaningTestData,
  createDifferentHiraganaTestData
} from './test-utils.js';

describe('Duplicate Prevention', () => {
  describe('Content-based deduplication', () => {
    it('should prevent duplicates with identical hiragana, romaji, and meaning', () => {
      const { existing, extracted } = createDuplicateTestData();
      const merged = mergeVocabulary(existing, extracted);

      expect(merged.vocabulary).toHaveLength(1);
      expect(merged.vocabulary[0].id).toBe('existing_1');
    });

    it('should prevent duplicates with case-insensitive matching', () => {
      const { existing, extracted } = createCaseInsensitiveTestData();
      const merged = mergeVocabulary(existing, extracted);

      expect(merged.vocabulary).toHaveLength(1);
    });

    it('should allow different words with same hiragana but different meaning', () => {
      const { existing, extracted } = createDifferentMeaningTestData();
      const merged = mergeVocabulary(existing, extracted);

      expect(merged.vocabulary).toHaveLength(2);
    });

    it('should allow same meaning with different hiragana', () => {
      const { existing, extracted } = createDifferentHiraganaTestData();
      const merged = mergeVocabulary(existing, extracted);

      expect(merged.vocabulary).toHaveLength(2);
    });
  });

  describe('Multiple extraction runs', () => {
    it('should be idempotent - running extraction multiple times produces same result', () => {
      const baseVocabulary = createIdempotentTestData();

      // First merge
      const firstMerge = mergeVocabulary(baseVocabulary, baseVocabulary);
      expect(firstMerge.vocabulary).toHaveLength(2);

      // Second merge (should be identical)
      const secondMerge = mergeVocabulary(firstMerge, baseVocabulary);
      expect(secondMerge.vocabulary).toHaveLength(2);
      expect(secondMerge.vocabulary).toEqual(firstMerge.vocabulary);
    });

    it('should handle partial duplicates correctly', () => {
      const { existing, extracted } = createPartialDuplicateTestData();
      const merged = mergeVocabulary(existing, extracted);

      // Should have 3 items: 2 existing + 1 new (duplicate removed)
      expect(merged.vocabulary).toHaveLength(3);
      
      // Should preserve existing items
      expect(merged.vocabulary.find(item => item.id === 'existing_1')).toBeDefined();
      expect(merged.vocabulary.find(item => item.id === 'existing_2')).toBeDefined();
      
      // Should add new item
      expect(merged.vocabulary.find(item => item.id === 'extracted_2')).toBeDefined();
    });
  });

  describe('Edge cases', () => {
    it('should handle empty vocabulary lists', () => {
      const empty = createEmptyTestData();
      const merged = mergeVocabulary(empty, empty);
      
      expect(merged.vocabulary).toHaveLength(0);
      expect(merged.categories).toContain('all');
    });

    it('should handle vocabulary with missing fields gracefully', () => {
      const { existing, extracted } = createMissingFieldsTestData();
      const merged = mergeVocabulary(existing, extracted);

      // Should not consider empty hiragana as duplicate
      expect(merged.vocabulary).toHaveLength(2);
    });
  });
});
