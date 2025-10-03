/**
 * Shared test utilities for vocabulary extraction tests
 */

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

export interface TestDataPair {
  existing: VocabularyData;
  extracted: VocabularyData;
}

export function createTestVocabularyItem(overrides: Partial<VocabularyItem> = {}): VocabularyItem {
  return {
    id: 'test_1',
    hiragana: 'あか',
    kanji: '赤',
    romaji: 'aka',
    meaning: 'red',
    type: 'い-adjective',
    category: 'colors',
    tags: ['test'],
    ...overrides
  };
}

export function createTestVocabularyData(
  vocabulary: VocabularyItem[] = [], 
  overrides: Partial<VocabularyData> = {}
): VocabularyData {
  return {
    vocabulary,
    categories: ['all'],
    sortOptions: [
      { value: 'hiragana', label: 'Hiragana (A-Z)' },
      { value: 'romaji', label: 'Romaji (A-Z)' },
      { value: 'meaning', label: 'Meaning (A-Z)' },
      { value: 'category', label: 'Category' }
    ],
    ...overrides
  };
}

export function createDuplicateTestData(): TestDataPair {
  const existing = createTestVocabularyData([
    createTestVocabularyItem({
      id: 'existing_1',
      hiragana: 'あか',
      romaji: 'aka',
      meaning: 'red',
      tags: ['existing']
    })
  ], { categories: ['colors'] });

  const extracted = createTestVocabularyData([
    createTestVocabularyItem({
      id: 'extracted_1',
      hiragana: 'あか',
      romaji: 'aka',
      meaning: 'red',
      category: 'vocabulary',
      tags: ['colors']
    })
  ], { categories: ['vocabulary'] });

  return { existing, extracted };
}

export function createPartialDuplicateTestData(): TestDataPair {
  const existing = createTestVocabularyData([
    createTestVocabularyItem({
      id: 'existing_1',
      hiragana: 'あか',
      romaji: 'aka',
      meaning: 'red',
      tags: ['existing']
    }),
    createTestVocabularyItem({
      id: 'existing_2',
      hiragana: 'あお',
      romaji: 'ao',
      meaning: 'blue',
      tags: ['existing']
    })
  ], { categories: ['colors'] });

  const extracted = createTestVocabularyData([
    createTestVocabularyItem({
      id: 'extracted_1',
      hiragana: 'あか',
      romaji: 'aka',
      meaning: 'red',
      category: 'vocabulary',
      tags: ['colors']
    }),
    createTestVocabularyItem({
      id: 'extracted_2',
      hiragana: 'きいろ',
      romaji: 'kiiro',
      meaning: 'yellow',
      category: 'vocabulary',
      tags: ['colors']
    })
  ], { categories: ['vocabulary'] });

  return { existing, extracted };
}

export function createIdempotentTestData(): VocabularyData {
  const baseVocabulary = createTestVocabularyData([
    createTestVocabularyItem({
      id: 'colors_1',
      hiragana: 'あか',
      romaji: 'aka',
      meaning: 'red',
      category: 'vocabulary',
      tags: ['colors']
    }),
    createTestVocabularyItem({
      id: 'colors_2',
      hiragana: 'あお',
      romaji: 'ao',
      meaning: 'blue',
      category: 'vocabulary',
      tags: ['colors']
    })
  ], { categories: ['vocabulary'] });

  return baseVocabulary;
}

export function createEmptyTestData(): VocabularyData {
  return createTestVocabularyData([], { categories: ['all'] });
}

export function createMissingFieldsTestData(): TestDataPair {
  const existing = createTestVocabularyData([
    createTestVocabularyItem({
      id: 'existing_1',
      hiragana: 'あか',
      romaji: 'aka',
      meaning: 'red',
      tags: ['existing']
    })
  ], { categories: ['colors'] });

  const extracted = createTestVocabularyData([
    createTestVocabularyItem({
      id: 'extracted_1',
      hiragana: '',
      romaji: 'aka',
      meaning: 'red',
      category: 'vocabulary',
      tags: ['colors']
    })
  ], { categories: ['vocabulary'] });

  return { existing, extracted };
}

export function createCaseInsensitiveTestData(): TestDataPair {
  const existing = createTestVocabularyData([
    createTestVocabularyItem({
      id: 'existing_1',
      hiragana: 'あか',
      romaji: 'aka',
      meaning: 'Red',
      tags: ['existing']
    })
  ], { categories: ['colors'] });

  const extracted = createTestVocabularyData([
    createTestVocabularyItem({
      id: 'extracted_1',
      hiragana: 'あか',
      romaji: 'aka',
      meaning: 'red',
      category: 'vocabulary',
      tags: ['colors']
    })
  ], { categories: ['vocabulary'] });

  return { existing, extracted };
}

export function createDifferentMeaningTestData(): TestDataPair {
  const existing = createTestVocabularyData([
    createTestVocabularyItem({
      id: 'existing_1',
      hiragana: 'あか',
      romaji: 'aka',
      meaning: 'red',
      tags: ['existing']
    })
  ], { categories: ['colors'] });

  const extracted = createTestVocabularyData([
    createTestVocabularyItem({
      id: 'extracted_1',
      hiragana: 'あか',
      romaji: 'aka',
      meaning: 'bright',
      category: 'vocabulary',
      tags: ['colors']
    })
  ], { categories: ['vocabulary'] });

  return { existing, extracted };
}

export function createDifferentHiraganaTestData(): TestDataPair {
  const existing = createTestVocabularyData([
    createTestVocabularyItem({
      id: 'existing_1',
      hiragana: 'あか',
      romaji: 'aka',
      meaning: 'red',
      tags: ['existing']
    })
  ], { categories: ['colors'] });

  const extracted = createTestVocabularyData([
    createTestVocabularyItem({
      id: 'extracted_1',
      hiragana: 'あかい',
      romaji: 'akai',
      meaning: 'red',
      category: 'vocabulary',
      tags: ['colors']
    })
  ], { categories: ['vocabulary'] });

  return { existing, extracted };
}

export function createCategoryMergeTestData(): TestDataPair {
  const existing = createTestVocabularyData([], { 
    categories: ['colors', 'food'] 
  });

  const extracted = createTestVocabularyData([], { 
    categories: ['colors', 'tastes'] 
  });

  return { existing, extracted };
}

export function createSortOptionsTestData(): TestDataPair {
  const existing = createTestVocabularyData([], {
    sortOptions: [
      { value: 'custom', label: 'Custom Sort' }
    ]
  });

  const extracted = createTestVocabularyData([], {
    sortOptions: [
      { value: 'hiragana', label: 'Hiragana (A-Z)' }
    ]
  });

  return { existing, extracted };
}

export function createExtractVocabularyDuplicateTestData(): TestDataPair {
  const existing = createTestVocabularyData([
    createTestVocabularyItem({
      id: 'existing_1',
      hiragana: 'あか',
      romaji: 'aka',
      meaning: 'red',
      tags: ['existing']
    })
  ], { categories: ['colors'] });

  const extracted = createTestVocabularyData([
    createTestVocabularyItem({
      id: 'extracted_1',
      hiragana: 'あか',
      romaji: 'aka',
      meaning: 'red',
      category: 'vocabulary',
      tags: ['colors']
    }),
    createTestVocabularyItem({
      id: 'extracted_2',
      hiragana: 'あお',
      romaji: 'ao',
      meaning: 'blue',
      category: 'vocabulary',
      tags: ['colors']
    })
  ], { categories: ['vocabulary'] });

  return { existing, extracted };
}
