/**
 * Shared test utilities for vocabulary extraction tests
 */
import { DEFAULT_SORT_OPTIONS } from '../scripts/extract-vocabulary';

export interface VocabularyItem {
  id: string;
  hiragana: string;
  kanji?: string;
  romaji: string;
  meaning: string;
  type: string;
  category: string;
  tags: string[];
}

export interface VocabularyData {
  vocabulary: VocabularyItem[];
  categories: string[];
  sortOptions: Array<{ value: string; label: string }>;
}

export function createTestVocabularyItem(overrides: Partial<VocabularyItem> = {}): VocabularyItem {
  return {
    id: 'test_0',
    hiragana: 'あか',
    kanji: '赤',
    romaji: 'aka',
    meaning: 'red',
    type: 'い-adjective',
    category: 'colors',
    tags: ['test'],
    ...overrides,
  };
}

export function createBlueItem(overrides: Partial<VocabularyItem> = {}): VocabularyItem {
  return createTestVocabularyItem({
    hiragana: 'あお',
    kanji: '青',
    romaji: 'ao',
    meaning: 'blue',
    ...overrides,
  });
}

export function createYellowItem(overrides: Partial<VocabularyItem> = {}): VocabularyItem {
  return createTestVocabularyItem({
    hiragana: 'きいろ',
    kanji: '黄色',
    romaji: 'kiiro',
    meaning: 'yellow',
    ...overrides,
  });
}

export function createTestVocabularyData(
  vocabulary: VocabularyItem[] = [],
  overrides: Partial<VocabularyData> = {},
): VocabularyData {
  return {
    vocabulary,
    categories: ['all'],
    sortOptions: DEFAULT_SORT_OPTIONS,
    ...overrides,
  };
}

