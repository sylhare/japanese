import jlptVocabularyData from '../data/jlpt-vocabulary.json';
import { getTagPath, normalizeToken } from '../data/vocabulary-types';
import type { VocabularyItem } from '../data/vocabulary-types';

export { getTagPath };

export interface JlptEntry {
  kanji?: string;
  hiragana: string;
  romaji: string;
}

const jlptLevelEntries: Array<[string, JlptEntry[]]> = Object.entries(
  jlptVocabularyData as Record<string, JlptEntry[]>,
);

/**
 * An item matches a JLPT entry when the reading matches (hiragana/katakana or
 * romaji) and, when both have a kanji, the kanji matches too — so same-reading
 * homonyms (花 vs 鼻) are not badged from each other.
 */
export function matchesJlptEntry(item: VocabularyItem, entry: JlptEntry): boolean {
  const readingMatch =
    (item.hiragana && normalizeToken(item.hiragana) === entry.hiragana) ||
    (item.katakana && normalizeToken(item.katakana) === entry.hiragana) ||
    (item.romaji && normalizeToken(item.romaji) === entry.romaji);
  if (!readingMatch) {
    return false;
  }
  const itemKanji = normalizeToken(item.kanji);
  if (itemKanji && entry.kanji) {
    return itemKanji === entry.kanji;
  }
  return true;
}

/** The JLPT levels an item appears in, e.g. ['N5']. */
export function jlptLevelsForItem(item: VocabularyItem): string[] {
  return jlptLevelEntries
    .filter(([, entries]) => entries.some(entry => matchesJlptEntry(item, entry)))
    .map(([level]) => level);
}

/** Append `extra` tags that aren't already present (case-insensitively). */
export function withTags(tags: string[], extra: string[]): string[] {
  const present = new Set(tags.map(tag => tag.toLowerCase()));
  const additions = extra.filter(tag => !present.has(tag.toLowerCase()));
  return additions.length > 0 ? [...tags, ...additions] : tags;
}

/** Badge each item with its JLPT level tags, leaving items without levels untouched. */
export function withJlptTags(items: VocabularyItem[]): VocabularyItem[] {
  return items.map(item => {
    const levels = jlptLevelsForItem(item);
    return levels.length > 0 ? { ...item, tags: withTags(item.tags, levels) } : item;
  });
}
