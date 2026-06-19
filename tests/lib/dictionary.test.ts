import { describe, expect, it } from 'vitest';
import type { JlptEntry } from '../../src/lib/dictionary';
import { matchesJlptEntry, withTags } from '../../src/lib/dictionary';
import { createTestVocabularyItem } from '../test-utils';

describe('matchesJlptEntry', () => {
  it('matches when the hiragana reading and kanji agree', () => {
    const item = createTestVocabularyItem({ hiragana: 'あか', kanji: '赤', romaji: 'aka' });
    const entry: JlptEntry = { kanji: '赤', hiragana: 'あか', romaji: 'aka' };
    expect(matchesJlptEntry(item, entry)).toBe(true);
  });

  it('does not match same-reading homonyms with different kanji', () => {
    const hana = createTestVocabularyItem({ hiragana: 'はな', kanji: '花', romaji: 'hana' });
    const hanaNose: JlptEntry = { kanji: '鼻', hiragana: 'はな', romaji: 'hana' };
    expect(matchesJlptEntry(hana, hanaNose)).toBe(false);
  });

  it('matches on katakana readings stored as the entry reading', () => {
    const item = createTestVocabularyItem({
      hiragana: '',
      katakana: 'コーヒー',
      kanji: undefined,
      romaji: 'koohii',
    });
    const entry: JlptEntry = { hiragana: 'コーヒー', romaji: 'koohii' };
    expect(matchesJlptEntry(item, entry)).toBe(true);
  });

  it('matches on romaji when the kana differs', () => {
    const item = createTestVocabularyItem({ hiragana: 'ちがう', kanji: undefined, romaji: 'aka' });
    const entry: JlptEntry = { hiragana: 'あか', romaji: 'aka' };
    expect(matchesJlptEntry(item, entry)).toBe(true);
  });

  it('matches a kanji item against a kana-only entry by reading alone', () => {
    const item = createTestVocabularyItem({ hiragana: 'あか', kanji: '赤', romaji: 'aka' });
    const entry: JlptEntry = { hiragana: 'あか', romaji: 'aka' };
    expect(matchesJlptEntry(item, entry)).toBe(true);
  });

  it('does not match when neither reading nor romaji line up', () => {
    const item = createTestVocabularyItem({ hiragana: 'みどり', kanji: '緑', romaji: 'midori' });
    const entry: JlptEntry = { kanji: '赤', hiragana: 'あか', romaji: 'aka' };
    expect(matchesJlptEntry(item, entry)).toBe(false);
  });

  it('normalizes parentheses and tildes before comparing', () => {
    const item = createTestVocabularyItem({ hiragana: '(あか)', kanji: undefined, romaji: 'a~ka' });
    const entry: JlptEntry = { hiragana: 'あか', romaji: 'aka' };
    expect(matchesJlptEntry(item, entry)).toBe(true);
  });
});

describe('withTags', () => {
  it('appends tags that are not already present', () => {
    expect(withTags(['colors'], ['N5'])).toEqual(['colors', 'N5']);
  });

  it('skips tags already present, case-insensitively', () => {
    expect(withTags(['N5'], ['n5'])).toEqual(['N5']);
  });

  it('returns the original array reference when there is nothing to add', () => {
    const tags = ['colors'];
    expect(withTags(tags, ['colors'])).toBe(tags);
  });

  it('adds only the missing tags from a mixed list', () => {
    expect(withTags(['N5'], ['N5', 'N4'])).toEqual(['N5', 'N4']);
  });
});
