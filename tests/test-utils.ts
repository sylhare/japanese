/**
 * Shared test utilities for vocabulary extraction tests
 */
import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import { DEFAULT_SORT_OPTIONS } from '../scripts/extract-vocabulary';
import type { VocabularyData, VocabularyItem } from '../src/data/vocabulary-types';

export type { VocabularyData, VocabularyItem };

/** Load and parse the real vocabulary.yaml from disk. */
export function loadVocabularyData(): VocabularyData {
  const file = path.join(__dirname, '../src/data/vocabulary.yaml');
  return yaml.load(fs.readFileSync(file, 'utf8')) as VocabularyData;
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

