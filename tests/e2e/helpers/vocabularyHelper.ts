import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';

/**
 * Represents a single vocabulary item in the vocabulary data
 */
export type VocabularyItem = {
  id: string;
  hiragana?: string;
  kanji?: string;
  romaji?: string;
  meaning?: string;
  category?: string;
  tags?: string[];
  type?: string;
};

/**
 * Represents the structure of the vocabulary.yaml data file
 */
export type VocabularyData = {
  vocabulary: VocabularyItem[];
  categories?: string[];
  sortOptions?: Array<{ value: string; label: string }>;
};

/**
 * Loads vocabulary data from the YAML file
 */
export function loadVocabularyData(): VocabularyData {
  const vocabularyFile = path.join(__dirname, '../../../src/data/vocabulary.yaml');
  const content = fs.readFileSync(vocabularyFile, 'utf8');
  return yaml.load(content) as VocabularyData;
}

/**
 * Finds duplicate IDs in vocabulary items
 */
export function findDuplicateIds(items: VocabularyItem[]): string[] {
  const idSet = new Set<string>();
  const duplicates: string[] = [];

  items.forEach(item => {
    idSet.has(item.id) ? duplicates.push(item.id) : idSet.add(item.id);
  });

  return duplicates;
}

/**
 * Groups vocabulary items by ID prefix (everything before the last underscore)
 */
export function groupByIdPrefix(items: VocabularyItem[]): Map<string, VocabularyItem[]> {
  return items.reduce((map, item) => {
    const prefix = item.id.substring(0, item.id.lastIndexOf('_'));
    const existing = map.get(prefix) || [];
    map.set(prefix, [...existing, item]);
    return map;
  }, new Map<string, VocabularyItem[]>());
}

