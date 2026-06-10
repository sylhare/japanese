import type { VocabularyItem } from '../../../src/data/vocabulary-types';

export const studyMockItems: VocabularyItem[] = [
  { id: 'n0', hiragana: 'あか', kanji: '赤', romaji: 'aka', meaning: 'red', category: 'vocabulary', tags: ['colors'], type: 'noun' },
  { id: 'n1', hiragana: 'あお', kanji: '青', romaji: 'ao', meaning: 'blue', category: 'vocabulary', tags: ['colors'], type: 'noun' },
  { id: 'n2', hiragana: 'みどり', kanji: '緑', romaji: 'midori', meaning: 'green', category: 'vocabulary', tags: ['colors'], type: 'noun' },
  { id: 'n3', hiragana: 'きいろ', kanji: '黄色', romaji: 'kiiro', meaning: 'yellow', category: 'vocabulary', tags: ['colors'], type: 'noun' },
  { id: 'n4', hiragana: 'くろ', kanji: '黒', romaji: 'kuro', meaning: 'black', category: 'vocabulary', tags: ['colors'], type: 'noun' },
  { id: 'v0', hiragana: 'たべる', kanji: '食べる', romaji: 'taberu', meaning: 'to eat', category: 'grammar', tags: ['tastes'], type: 'verb' },
];

export const studyMockVocabularyData = {
  vocabulary: studyMockItems,
  categories: ['all'],
  sortOptions: [],
};
