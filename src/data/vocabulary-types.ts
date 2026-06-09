// Shared vocabulary helpers: valid types, the token normalizer, and the item shape.
// See .github/docs/vocabulary-extraction.md for full documentation.

export const VALID_TYPES: string[] = [
  'noun',
  'pronoun',
  'verb',
  'い-adjective',
  'な-adjective',
  'adverb',
  'onomatopoeia',
  'counter',
  'conjunction',
  'expression',
];

export interface VocabularyItem {
  id: string;
  hiragana: string;
  katakana?: string;
  kanji?: string;
  romaji: string;
  meaning: string;
  category: string;
  tags: string[];
  type?: string;
}

export interface VocabularyData {
  vocabulary: VocabularyItem[];
  categories: string[];
  sortOptions: Array<{ value: string; label: string }>;
}

/** Normalize a token for matching across the extractor and the dictionary UI. */
export function normalizeToken(value?: string): string {
  if (!value) {
    return '';
  }
  return value
    .replace(/[()（）]/g, '')
    .replace(/[~～]/g, '')
    .replace(/\s+/g, '')
    .toLowerCase();
}
