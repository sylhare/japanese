import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import yaml from 'js-yaml';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  extractN5VocabularyTokens,
  extractVocabularyFromFile,
  main,
  mergeVocabulary,
  parseArgs,
  scanAllLessons,
} from '../../scripts/extract-vocabulary.js';
import {
  type VocabularyData,
  type VocabularyItem,
  createCaseInsensitiveTestData,
  createCategoryMergeTestData,
  createDifferentHiraganaTestData,
  createDifferentMeaningTestData,
  createDuplicateTestData,
  createEmptyTestData,
  createExtractVocabularyDuplicateTestData,
  createIdempotentTestData,
  createMissingFieldsTestData,
  createPartialDuplicateTestData,
  createSortOptionsTestData,
  createTestVocabularyData,
  createTestVocabularyItem,
} from '../test-utils.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('Vocabulary Extraction', () => {
  const fixturesDir = path.join(__dirname, '../__fixtures__/extract-vocabulary');
  const testVocabularyFile = path.join(__dirname, 'test-vocabulary.yaml');

  beforeEach(() => {
    delete process.env.TEST_LESSONS_DIR;
  });

  afterEach(() => {
    if (fs.existsSync(testVocabularyFile)) {
      fs.unlinkSync(testVocabularyFile);
    }
    delete process.env.TEST_LESSONS_DIR;
  });

  describe('extractVocabularyFromFile', () => {
    it('should extract vocabulary from basic colors lesson', () => {
      const filePath = path.join(fixturesDir, 'basic-colors.md');
      const vocabulary = extractVocabularyFromFile(filePath);

      expect(vocabulary).toHaveLength(5);

      const hiraganaList = vocabulary.map(item => item.hiragana);
      expect(hiraganaList).toContain('あか');
      expect(hiraganaList).toContain('あお');
      expect(hiraganaList).toContain('きいろ');
      expect(hiraganaList).toContain('みどり');
      expect(hiraganaList).toContain('しろ');

      const akaItem = vocabulary.find(item => item.hiragana === 'あか');
      expect(akaItem).toMatchObject({
        hiragana: 'あか',
        kanji: '赤',
        romaji: 'aka',
        meaning: 'red',
        type: 'い-adjective',
        category: 'general',
        tags: ['basic-colors'],
      });

      vocabulary.forEach(item => {
        expect(item).toHaveProperty('id');
        expect(item).toHaveProperty('hiragana');
        expect(item).toHaveProperty('romaji');
        expect(item).toHaveProperty('meaning');
        expect(item).toHaveProperty('type');
        expect(item).toHaveProperty('category');
        expect(item).toHaveProperty('tags');
      });
    });

    it('should extract vocabulary from tastes lesson', () => {
      const filePath = path.join(fixturesDir, 'tastes.md');
      const vocabulary = extractVocabularyFromFile(filePath);

      expect(vocabulary).toHaveLength(4);

      const hiraganaList = vocabulary.map(item => item.hiragana);
      expect(hiraganaList).toContain('あまい');
      expect(hiraganaList).toContain('からい');
      expect(hiraganaList).toContain('にがい');
      expect(hiraganaList).toContain('すっぱい');

      const amaiItem = vocabulary.find(item => item.hiragana === 'あまい');
      expect(amaiItem).toMatchObject({
        hiragana: 'あまい',
        kanji: '甘い',
        romaji: 'amai',
        meaning: 'sweet',
        type: 'い-adjective',
      });
    });

    it('should handle malformed tables gracefully', () => {
      const filePath = path.join(fixturesDir, 'malformed-table.md');
      const vocabulary = extractVocabularyFromFile(filePath);

      expect(vocabulary).toHaveLength(3);

      const validItems = vocabulary.filter(item =>
        item.hiragana && item.romaji && item.meaning,
      );
      expect(validItems).toHaveLength(3);

      const emptyItems = vocabulary.filter(item =>
        !item.hiragana || !item.romaji || !item.meaning,
      );
      expect(emptyItems).toHaveLength(0);
    });

    it('should filter out particles during extraction', () => {
      const filePath = path.join(fixturesDir, 'particles.md');
      const vocabulary = extractVocabularyFromFile(filePath);

      expect(vocabulary).toHaveLength(2);

      const particles = vocabulary.filter(item => item.type && item.type.toLowerCase().includes('particle'));
      expect(particles).toHaveLength(0);

      const soshite = vocabulary.find(item => item.hiragana === 'そして');
      expect(soshite).toBeDefined();
      expect(soshite?.type).toBe('conjunction');

      const watashi = vocabulary.find(item => item.hiragana === 'わたし');
      expect(watashi).toBeDefined();
      expect(watashi?.type).toBe('pronoun');
    });

    it('should handle files with no vocabulary tables', () => {
      const emptyFile = path.join(fixturesDir, 'empty-lesson.md');

      fs.writeFileSync(emptyFile, '# Empty Lesson\n\nNo vocabulary here.');

      const vocabulary = extractVocabularyFromFile(emptyFile);
      expect(vocabulary).toHaveLength(0);

      fs.unlinkSync(emptyFile);
    });

    it('should ignore emoji columns and extract vocabulary correctly', () => {
      const filePath = path.join(fixturesDir, 'emoji-columns.md');
      const vocabulary = extractVocabularyFromFile(filePath);

      expect(vocabulary.length).toBeGreaterThan(0);

      const emojiOnlyItems = vocabulary.filter(item =>
        item.hiragana.match(/^[\p{Emoji}\s]+$/u),
      );
      expect(emojiOnlyItems).toHaveLength(0);

      const hiraganaList = vocabulary.map(item => item.hiragana);
      expect(hiraganaList).toContain('ちち');
      expect(hiraganaList).toContain('はは');
      expect(hiraganaList).toContain('いえ');
      expect(hiraganaList).toContain('げつようび');
      expect(hiraganaList).toContain('かようび');

      vocabulary.forEach(item => {
        expect(item).toHaveProperty('id');
        expect(item).toHaveProperty('hiragana');
        expect(item).toHaveProperty('romaji');
        expect(item).toHaveProperty('meaning');
        expect(item).toHaveProperty('type');
        expect(item).toHaveProperty('category');
        expect(item).toHaveProperty('tags');

        expect(item.hiragana).not.toMatch(/^[\p{Emoji}\s]+$/u);
      });

      const chichiItem = vocabulary.find(item => item.hiragana === 'ちち');
      expect(chichiItem).toMatchObject({
        hiragana: 'ちち',
        kanji: '父',
        romaji: 'chichi',
        meaning: 'father',
        type: 'noun',
      });
    });

    it('should strip emojis from English translations when extracting vocabulary', () => {
      const filePath = path.join(fixturesDir, 'emoji-columns.md');
      const vocabulary = extractVocabularyFromFile(filePath);

      const chichiItem = vocabulary.find(item => item.hiragana === 'ちち');
      expect(chichiItem).toBeDefined();
      expect(chichiItem?.meaning).toBe('father');
      expect(chichiItem?.meaning).not.toContain('👨');

      const hahaItem = vocabulary.find(item => item.hiragana === 'はは');
      expect(hahaItem).toBeDefined();
      expect(hahaItem?.meaning).toBe('mother');
      expect(hahaItem?.meaning).not.toContain('👩');

      const ieItem = vocabulary.find(item => item.hiragana === 'いえ');
      expect(ieItem).toBeDefined();
      expect(ieItem?.meaning).toBe('house');
      expect(ieItem?.meaning).not.toContain('🏠');

      const getsuyoubiItem = vocabulary.find(item => item.hiragana === 'げつようび');
      expect(getsuyoubiItem).toBeDefined();
      expect(getsuyoubiItem?.meaning).toBe('Monday');
      expect(getsuyoubiItem?.meaning).not.toContain('🌙');

      vocabulary.forEach(item => {
        expect(item.meaning).not.toMatch(/[\u{1F300}-\u{1F9FF}]|[\u{1F600}-\u{1F64F}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u);
      });
    });

    it('should remove leading numbers from meanings (e.g., "8️⃣ August" becomes "August")', () => {
      const testFile = path.join(fixturesDir, 'time-with-emojis.md');
      const vocabulary = extractVocabularyFromFile(testFile);

      const hachigatsuItem = vocabulary.find(item => item.hiragana === 'はちがつ');
      expect(hachigatsuItem).toBeDefined();
      expect(hachigatsuItem?.meaning).toBe('August');
      expect(hachigatsuItem?.meaning).not.toContain('8');
      expect(hachigatsuItem?.meaning).not.toMatch(/^\d/);

      const juuichigatsuItem = vocabulary.find(item => item.hiragana === 'じゅういちがつ');
      expect(juuichigatsuItem).toBeDefined();
      expect(juuichigatsuItem?.meaning).toBe('November');
      expect(juuichigatsuItem?.meaning).not.toContain('11');
      expect(juuichigatsuItem?.meaning).not.toMatch(/^\d/);

      const rokugatsuItem = vocabulary.find(item => item.hiragana === 'ろくがつ');
      expect(rokugatsuItem).toBeDefined();
      expect(rokugatsuItem?.meaning).toBe('June');
      expect(rokugatsuItem?.meaning).not.toContain('6');
      expect(rokugatsuItem?.meaning).not.toMatch(/^\d/);
    });

    it('should correctly extract time vocabulary with emoji columns without column misalignment', () => {
      const filePath = path.join(fixturesDir, 'time-with-emojis.md');
      const vocabulary = extractVocabularyFromFile(filePath);

      expect(vocabulary).toHaveLength(7);

      const emojiInHiragana = vocabulary.filter(item =>
        item.hiragana && /[📅⬅️➡️]/.test(item.hiragana),
      );
      expect(emojiInHiragana).toHaveLength(0);

      const ototoiItem = vocabulary.find(item => item.hiragana === 'おととい');
      expect(ototoiItem).toBeDefined();
      expect(ototoiItem).toMatchObject({
        hiragana: 'おととい',
        kanji: '一昨日',
        romaji: 'ototoi',
        meaning: 'day before yesterday',
        type: 'noun',
      });

      const kyouItem = vocabulary.find(item => item.hiragana === 'きょう');
      expect(kyouItem).toBeDefined();
      expect(kyouItem).toMatchObject({
        hiragana: 'きょう',
        kanji: '今日',
        romaji: 'kyou',
        meaning: 'today',
        type: 'noun',
      });

      expect(kyouItem?.meaning).toBe('today');
      expect(kyouItem?.meaning).not.toContain('📅');

      const kinouItem = vocabulary.find(item => item.hiragana === 'きのう');
      expect(kinouItem?.meaning).toBe('yesterday');
      expect(kinouItem?.meaning).not.toContain('⬅️');

      vocabulary.forEach(item => {
        expect(item.hiragana).not.toMatch(/[⬅️➡️📅🌙🔥💧🌳⭐🌍☀️]/);
        expect(item.meaning).not.toMatch(/[\u{1F300}-\u{1F9FF}]|[\u{1F600}-\u{1F64F}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u);
      });
    });

    it('should extract vocabulary from tables without Kanji column', () => {
      const filePath = path.join(fixturesDir, 'no-kanji-column.md');
      const vocabulary = extractVocabularyFromFile(filePath);

      expect(vocabulary).toHaveLength(6);

      vocabulary.forEach(item => {
        expect(item.kanji).toBeUndefined();
      });

      const houGaIi = vocabulary.find(item => item.hiragana === '[verb た] + ほう が いい です');
      expect(houGaIi).toMatchObject({
        hiragana: '[verb た] + ほう が いい です',
        romaji: 'hou ga ii desu',
        meaning: 'you should (do)',
        type: 'expression',
      });

      const taberu = vocabulary.find(item => item.hiragana === 'たべる');
      expect(taberu).toMatchObject({
        hiragana: 'たべる',
        romaji: 'taberu',
        meaning: 'to eat',
        type: 'verb',
      });
      expect(taberu?.kanji).toBeUndefined();

      vocabulary.forEach(item => {
        expect(item).toHaveProperty('id');
        expect(item).toHaveProperty('hiragana');
        expect(item).toHaveProperty('romaji');
        expect(item).toHaveProperty('meaning');
        expect(item).toHaveProperty('type');
        expect(item).toHaveProperty('category');
        expect(item).toHaveProperty('tags');
      });
    });

    it('should generate unique and incremental IDs across multiple tables in the same file', () => {
      const filePath = path.join(fixturesDir, 'emoji-columns.md');
      const vocabulary = extractVocabularyFromFile(filePath);

      expect(vocabulary).toHaveLength(8);

      const ids = vocabulary.map(item => item.id);
      const uniqueIds = new Set(ids);

      expect(uniqueIds.size).toBe(ids.length);

      const idParts = ids.map(id => {
        const parts = id.split('_');
        const prefix = parts.slice(0, -1).join('_');
        const suffix = parseInt(parts[parts.length - 1], 10);
        return { prefix, suffix };
      });

      const prefixes = new Set(idParts.map(p => p.prefix));
      expect(prefixes.size).toBe(1);

      const suffixes = idParts.map(p => p.suffix).sort((a, b) => a - b);
      expect(suffixes).toEqual([0, 1, 2, 3, 4, 5, 6, 7]);

      const chichiItem1 = vocabulary.find(item => item.hiragana === 'ちち' && item.id === 'emojicolumns_0');
      expect(chichiItem1).toBeDefined();

      const hahaItem1 = vocabulary.find(item => item.hiragana === 'はは' && item.id === 'emojicolumns_1');
      expect(hahaItem1).toBeDefined();

      const getsuyoubiItem = vocabulary.find(item => item.hiragana === 'げつようび');
      expect(getsuyoubiItem?.id).toBe('emojicolumns_3');

      const kayoubiItem = vocabulary.find(item => item.hiragana === 'かようび');
      expect(kayoubiItem?.id).toBe('emojicolumns_4');

      const chichiItem2 = vocabulary.find(item => item.hiragana === 'ちち' && item.id === 'emojicolumns_5');
      expect(chichiItem2).toBeDefined();
    });
  });

  describe('mergeVocabulary', () => {
    it('should prevent duplicates based on content', () => {
      const { existing, extracted } = createExtractVocabularyDuplicateTestData();
      const merged = mergeVocabulary(existing, extracted);

      expect(merged.vocabulary).toHaveLength(2);

      const redItem = merged.vocabulary.find(item => item.hiragana === 'あか');
      expect(redItem?.id).toBe('existing_0');
      expect(redItem?.tags).toContain('existing');

      const blueItem = merged.vocabulary.find(item => item.hiragana === 'あお');
      expect(blueItem).toBeDefined();
      expect(blueItem?.id).toBe('extracted_0');
    });

    it('should merge tags when duplicate vocabulary items are found', () => {
      const existing = createTestVocabularyData([
        createTestVocabularyItem({
          id: 'existing_1',
          hiragana: 'あか',
          romaji: 'aka',
          meaning: 'red',
          tags: ['colors', 'basics'],
        }),
      ], { categories: ['colors'] });

      const extracted = createTestVocabularyData([
        createTestVocabularyItem({
          id: 'extracted_1',
          hiragana: 'あか',
          romaji: 'aka',
          meaning: 'red',
          tags: ['vocabulary', 'adjectives'],
        }),
      ], { categories: ['vocabulary'] });

      const merged = mergeVocabulary(existing, extracted);

      expect(merged.vocabulary).toHaveLength(1);

      const redItem = merged.vocabulary.find(item => item.hiragana === 'あか');
      expect(redItem).toBeDefined();
      expect(redItem?.tags).toContain('colors');
      expect(redItem?.tags).toContain('basics');
      expect(redItem?.tags).toContain('vocabulary');
      expect(redItem?.tags).toContain('adjectives');
      expect(redItem?.tags).toHaveLength(4);
    });

    it('should sort merged tags alphabetically', () => {
      const existing = createTestVocabularyData([
        createTestVocabularyItem({
          id: 'existing_1',
          hiragana: 'あか',
          romaji: 'aka',
          meaning: 'red',
          tags: ['zebra', 'colors'],
        }),
      ], { categories: ['colors'] });

      const extracted = createTestVocabularyData([
        createTestVocabularyItem({
          id: 'extracted_1',
          hiragana: 'あか',
          romaji: 'aka',
          meaning: 'red',
          tags: ['apple', 'basics'],
        }),
      ], { categories: ['vocabulary'] });

      const merged = mergeVocabulary(existing, extracted);

      const redItem = merged.vocabulary.find(item => item.hiragana === 'あか');
      expect(redItem?.tags).toEqual(['apple', 'basics', 'colors', 'zebra']);
    });

    it('should deduplicate tags when merging', () => {
      const existing = createTestVocabularyData([
        createTestVocabularyItem({
          id: 'existing_1',
          hiragana: 'あか',
          romaji: 'aka',
          meaning: 'red',
          tags: ['colors', 'basics'],
        }),
      ], { categories: ['colors'] });

      const extracted = createTestVocabularyData([
        createTestVocabularyItem({
          id: 'extracted_1',
          hiragana: 'あか',
          romaji: 'aka',
          meaning: 'red',
          tags: ['colors', 'adjectives'],
        }),
      ], { categories: ['vocabulary'] });

      const merged = mergeVocabulary(existing, extracted);

      const redItem = merged.vocabulary.find(item => item.hiragana === 'あか');
      expect(redItem?.tags).toHaveLength(3);
      expect(redItem?.tags).toContain('colors');
      expect(redItem?.tags).toContain('basics');
      expect(redItem?.tags).toContain('adjectives');
    });

    it('should preserve the first occurrence data when merging duplicates', () => {
      const existing = createTestVocabularyData([
        createTestVocabularyItem({
          id: 'existing_1',
          hiragana: 'あか',
          kanji: '赤',
          romaji: 'aka',
          meaning: 'red',
          type: 'い-adjective',
          category: 'colors',
          tags: ['existing-tag'],
        }),
      ], { categories: ['colors'] });

      const extracted = createTestVocabularyData([
        createTestVocabularyItem({
          id: 'extracted_1',
          hiragana: 'あか',
          kanji: '紅',
          romaji: 'aka',
          meaning: 'red',
          type: 'noun',
          category: 'vocabulary',
          tags: ['extracted-tag'],
        }),
      ], { categories: ['vocabulary'] });

      const merged = mergeVocabulary(existing, extracted);

      const redItem = merged.vocabulary.find(item => item.hiragana === 'あか');
      expect(redItem?.kanji).toBe('赤');
      expect(redItem?.type).toBe('い-adjective');
      expect(redItem?.category).toBe('colors');
      expect(redItem?.tags).toContain('existing-tag');
      expect(redItem?.tags).toContain('extracted-tag');
    });

    it('should merge categories correctly', () => {
      const { existing, extracted } = createCategoryMergeTestData();
      const merged = mergeVocabulary(existing, extracted);

      expect(merged.categories).toContain('colors');
      expect(merged.categories).toContain('food');
      expect(merged.categories).toContain('tastes');
      expect(merged.categories).toHaveLength(3);
    });

    it('should preserve existing sort options', () => {
      const { existing, extracted } = createSortOptionsTestData();
      const merged = mergeVocabulary(existing, extracted);

      expect(merged.sortOptions).toEqual(existing.sortOptions);
    });

    it('should filter out particles during merge', () => {
      const existing = createTestVocabularyData([
        createTestVocabularyItem({
          id: 'existing_1',
          hiragana: 'あか',
          romaji: 'aka',
          meaning: 'red',
          type: 'い-adjective',
          category: 'colors',
          tags: ['colors'],
        }),
        createTestVocabularyItem({
          id: 'existing_2',
          hiragana: 'は',
          romaji: 'wa',
          meaning: 'topic marker',
          type: 'particle',
          category: 'grammar',
          tags: ['grammar'],
        }),
        createTestVocabularyItem({
          id: 'existing_3',
          hiragana: 'が',
          romaji: 'ga',
          meaning: 'subject marker',
          type: 'particle',
          category: 'grammar',
          tags: ['grammar'],
        }),
      ], { categories: ['colors', 'grammar'] });

      const extracted = createTestVocabularyData([
        createTestVocabularyItem({
          id: 'extracted_1',
          hiragana: 'あお',
          romaji: 'ao',
          meaning: 'blue',
          type: 'い-adjective',
          category: 'colors',
          tags: ['colors'],
        }),
      ], { categories: ['colors'] });

      const merged = mergeVocabulary(existing, extracted);

      expect(merged.vocabulary).toHaveLength(2);

      const particles = merged.vocabulary.filter(item =>
        item.type && item.type.toLowerCase().includes('particle'),
      );
      expect(particles).toHaveLength(0);

      expect(merged.vocabulary.find(item => item.hiragana === 'あか')).toBeDefined();
      expect(merged.vocabulary.find(item => item.hiragana === 'あお')).toBeDefined();
    });
  });

  describe('Duplicate Prevention', () => {
    describe('Content-based deduplication', () => {
      it('should prevent duplicates with identical hiragana, romaji, and meaning', () => {
        const { existing, extracted } = createDuplicateTestData();
        const merged = mergeVocabulary(existing, extracted);

        expect(merged.vocabulary).toHaveLength(1);
        expect(merged.vocabulary[0].id).toBe('existing_0');
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

        const firstMerge = mergeVocabulary(baseVocabulary, baseVocabulary);
        expect(firstMerge.vocabulary).toHaveLength(2);

        const secondMerge = mergeVocabulary(firstMerge, baseVocabulary);
        expect(secondMerge.vocabulary).toHaveLength(2);
        expect(secondMerge.vocabulary).toEqual(firstMerge.vocabulary);
      });

      it('should handle partial duplicates correctly', () => {
        const { existing, extracted } = createPartialDuplicateTestData();
        const merged = mergeVocabulary(existing, extracted);

        expect(merged.vocabulary).toHaveLength(3);

        expect(merged.vocabulary.find(item => item.id === 'existing_0')).toBeDefined();
        expect(merged.vocabulary.find(item => item.id === 'existing_1')).toBeDefined();

        expect(merged.vocabulary.find(item => item.id === 'extracted_0')).toBeDefined();
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

        expect(merged.vocabulary).toHaveLength(2);
      });
    });
  });

  describe('scanAllLessons', () => {
    it('should scan all lesson files in a directory', () => {
      const testLessonsDir = path.join(__dirname, 'test-lessons');
      const testVocabDir = path.join(testLessonsDir, 'vocabulary');

      fs.mkdirSync(testVocabDir, { recursive: true });

      fs.copyFileSync(
        path.join(fixturesDir, 'basic-colors.md'),
        path.join(testVocabDir, 'colors.md'),
      );
      fs.copyFileSync(
        path.join(fixturesDir, 'tastes.md'),
        path.join(testVocabDir, 'tastes.md'),
      );

      process.env.TEST_LESSONS_DIR = testLessonsDir;

      const result = scanAllLessons();

      expect(result.vocabulary).toHaveLength(9);
      expect(result.categories).toContain('vocabulary');
      expect(result.sortOptions).toHaveLength(4);
    });

    it('should return consistently ordered results across multiple calls', () => {
      const testLessonsDir = path.join(__dirname, 'test-lessons');
      const testVocabDir = path.join(testLessonsDir, 'vocabulary');

      fs.mkdirSync(testVocabDir, { recursive: true });

      fs.copyFileSync(
        path.join(fixturesDir, 'basic-colors.md'),
        path.join(testVocabDir, 'colors.md'),
      );
      fs.copyFileSync(
        path.join(fixturesDir, 'tastes.md'),
        path.join(testVocabDir, 'tastes.md'),
      );

      process.env.TEST_LESSONS_DIR = testLessonsDir;

      const result1 = scanAllLessons();
      const result2 = scanAllLessons();
      const result3 = scanAllLessons();

      expect(result1.vocabulary).toEqual(result2.vocabulary);
      expect(result2.vocabulary).toEqual(result3.vocabulary);
      expect(result1.vocabulary).toEqual(result3.vocabulary);

      expect(result1.categories).toEqual(result2.categories);
      expect(result2.categories).toEqual(result3.categories);
      expect(result1.categories).toEqual(result3.categories);

      const sortedCategories = [...result1.categories].sort();
      expect(result1.categories).toEqual(sortedCategories);

      expect(result1.sortOptions).toEqual(result2.sortOptions);
      expect(result2.sortOptions).toEqual(result3.sortOptions);
      expect(result1.sortOptions).toEqual(result3.sortOptions);

      for (let i = 1; i < result1.vocabulary.length; i++) {
        const prev = result1.vocabulary[i - 1];
        const curr = result1.vocabulary[i];

        const fileCompare = prev.tags[0].localeCompare(curr.tags[0]);
        if (fileCompare === 0) {
          expect(prev.id.localeCompare(curr.id)).toBeLessThanOrEqual(0);
        } else {
          expect(fileCompare).toBeLessThanOrEqual(0);
        }
      }
    });
  });

  describe('Integration Tests', () => {
    it('should handle the full extraction workflow', () => {
      const testData = createTestVocabularyData([
        createTestVocabularyItem({
          id: 'existing_1',
          hiragana: 'テスト',
          romaji: 'tesuto',
          meaning: 'test',
          type: 'noun',
          category: 'general',
          tags: ['existing'],
        }),
      ], {
        categories: ['general'],
        sortOptions: [
          { value: 'hiragana', label: 'Hiragana (A-Z)' },
        ],
      });

      fs.writeFileSync(testVocabularyFile, yaml.dump(testData));

      const extracted = createTestVocabularyData([
        createTestVocabularyItem({
          id: 'colors_1',
          hiragana: 'あか',
          romaji: 'aka',
          meaning: 'red',
          type: 'い-adjective',
          category: 'vocabulary',
          tags: ['colors'],
        }),
      ], { categories: ['vocabulary'] });

      const merged = mergeVocabulary(testData, extracted);

      expect(merged.vocabulary).toHaveLength(2);
      expect(merged.categories).toContain('general');
      expect(merged.categories).toContain('vocabulary');
    });

    it('should validate vocabulary file structure', () => {
      const vocabularyFile = path.join(__dirname, '../../src/data/vocabulary.yaml');

      expect(fs.existsSync(vocabularyFile)).toBe(true);

      const content = fs.readFileSync(vocabularyFile, 'utf8');
      const data = yaml.load(content) as VocabularyData;

      expect(data).toHaveProperty('vocabulary');
      expect(data).toHaveProperty('categories');
      expect(data).toHaveProperty('sortOptions');
      expect(Array.isArray(data.vocabulary)).toBe(true);
      expect(Array.isArray(data.categories)).toBe(true);
      expect(Array.isArray(data.sortOptions)).toBe(true);
    });

    it('should have no duplicate vocabulary entries', () => {
      const vocabularyFile = path.join(__dirname, '../../src/data/vocabulary.yaml');

      expect(fs.existsSync(vocabularyFile)).toBe(true);

      const content = fs.readFileSync(vocabularyFile, 'utf8');
      const data = yaml.load(content) as VocabularyData;

      const contentKeys = new Set<string>();
      const duplicates: Array<{ index: number; item: VocabularyItem; key: string }> = [];

      data.vocabulary.forEach((item, index) => {
        const key = `${item.hiragana}-${item.romaji}-${item.meaning}`.toLowerCase();
        if (contentKeys.has(key)) {
          duplicates.push({ index, item, key });
        } else {
          contentKeys.add(key);
        }
      });

      expect(duplicates).toHaveLength(0);
    });

    it('should not have emoji characters in hiragana fields of vocabulary.yaml', () => {
      const vocabularyFile = path.join(__dirname, '../../src/data/vocabulary.yaml');

      expect(fs.existsSync(vocabularyFile)).toBe(true);

      const content = fs.readFileSync(vocabularyFile, 'utf8');
      const data = yaml.load(content) as VocabularyData;

      const emojiRegex = /[📅⬅️➡️🎉🔁🌙🔥💧🌳⭐🌍☀️🌅🌞🌇🌑👨👩👴👵👰🤵💑💔💕🏠]/;
      const itemsWithEmojiInHiragana: VocabularyItem[] = [];

      data.vocabulary.forEach(item => {
        if (item.hiragana && emojiRegex.test(item.hiragana)) {
          itemsWithEmojiInHiragana.push(item);
        }
      });

      expect(itemsWithEmojiInHiragana).toHaveLength(0);

      const arrowEmojiRegex = /[⬅️➡️]/;
      const itemsWithArrowEmojiInHiragana = data.vocabulary.filter(item =>
        item.hiragana && arrowEmojiRegex.test(item.hiragana),
      );

      expect(itemsWithArrowEmojiInHiragana).toHaveLength(0);
    });

    it('should extract vocabulary from real lesson files', () => {
      const result = scanAllLessons();

      expect(result.vocabulary.length).toBeGreaterThan(0);
      expect(result.categories.length).toBeGreaterThan(0);
      expect(result.sortOptions.length).toBeGreaterThan(0);

      result.vocabulary.forEach(item => {
        expect(item).toHaveProperty('id');
        expect(item).toHaveProperty('hiragana');
        expect(item).toHaveProperty('romaji');
        expect(item).toHaveProperty('meaning');
        expect(item).toHaveProperty('type');
        expect(item).toHaveProperty('category');
        expect(item).toHaveProperty('tags');
      });
    });

    it('should produce deterministic ordering when merging vocabulary', () => {
      const existing = createTestVocabularyData([
        createTestVocabularyItem({
          id: 'existing_1',
          hiragana: 'あか',
          romaji: 'aka',
          meaning: 'red',
          type: 'い-adjective',
          category: 'vocabulary',
          tags: ['colors'],
        }),
        createTestVocabularyItem({
          id: 'existing_2',
          hiragana: 'あお',
          romaji: 'ao',
          meaning: 'blue',
          type: 'い-adjective',
          category: 'vocabulary',
          tags: ['colors'],
        }),
      ], { categories: ['vocabulary'] });

      const extracted = createTestVocabularyData([
        createTestVocabularyItem({
          id: 'existing_1',
          hiragana: 'あか',
          romaji: 'aka',
          meaning: 'red',
          type: 'い-adjective',
          category: 'vocabulary',
          tags: ['colors'],
        }),
        createTestVocabularyItem({
          id: 'existing_2',
          hiragana: 'あお',
          romaji: 'ao',
          meaning: 'blue',
          type: 'い-adjective',
          category: 'vocabulary',
          tags: ['colors'],
        }),
      ], { categories: ['vocabulary'] });

      const firstMerge = mergeVocabulary(existing, extracted);
      const secondMerge = mergeVocabulary(firstMerge, extracted);
      const thirdMerge = mergeVocabulary(secondMerge, extracted);

      expect(firstMerge.vocabulary).toEqual(secondMerge.vocabulary);
      expect(secondMerge.vocabulary).toEqual(thirdMerge.vocabulary);
      expect(firstMerge.vocabulary[0].id).toBe('existing_0');
      expect(firstMerge.vocabulary[0].hiragana).toBe('あか');
      expect(firstMerge.vocabulary[1].id).toBe('existing_1');
      expect(firstMerge.vocabulary[1].hiragana).toBe('あお');
    });

    it('should work with any section heading', () => {
      const testFile = path.join(fixturesDir, 'custom-section.md');
      const testContent = `---
title: Custom Section Test
---

# Custom Section Test

## My Custom Vocabulary Section

| Hiragana | Kanji | Romaji | English | Type |
|----------|-------|--------|---------|------|
| テスト | - | tesuto | test | noun |
| サンプル | - | sanpuru | sample | noun |
`;

      fs.writeFileSync(testFile, testContent);

      const vocabulary = extractVocabularyFromFile(testFile);

      expect(vocabulary).toHaveLength(2);
      expect(vocabulary[0].hiragana).toBe('テスト');
      expect(vocabulary[1].hiragana).toBe('サンプル');
    });
  });

  describe('parseArgs', () => {
    let originalArgv: string[];

    beforeEach(() => {
      originalArgv = process.argv;
    });

    afterEach(() => {
      process.argv = originalArgv;
    });

    it('should return force: false and help: false by default', () => {
      process.argv = ['node', 'extract-vocabulary.js'];
      const args = parseArgs();

      expect(args.force).toBe(false);
      expect(args.help).toBe(false);
    });

    it('should parse --force flag', () => {
      process.argv = ['node', 'extract-vocabulary.js', '--force'];
      const args = parseArgs();

      expect(args.force).toBe(true);
      expect(args.help).toBe(false);
    });

    it('should parse -f flag as force', () => {
      process.argv = ['node', 'extract-vocabulary.js', '-f'];
      const args = parseArgs();

      expect(args.force).toBe(true);
      expect(args.help).toBe(false);
    });

    it('should parse --help flag', () => {
      process.argv = ['node', 'extract-vocabulary.js', '--help'];
      const args = parseArgs();

      expect(args.force).toBe(false);
      expect(args.help).toBe(true);
    });

    it('should parse -h flag as help', () => {
      process.argv = ['node', 'extract-vocabulary.js', '-h'];
      const args = parseArgs();

      expect(args.force).toBe(false);
      expect(args.help).toBe(true);
    });

    it('should parse both --force and --help flags', () => {
      process.argv = ['node', 'extract-vocabulary.js', '--force', '--help'];
      const args = parseArgs();

      expect(args.force).toBe(true);
      expect(args.help).toBe(true);
    });

    it('should ignore unknown flags', () => {
      process.argv = ['node', 'extract-vocabulary.js', '--unknown', '-x'];
      const args = parseArgs();

      expect(args.force).toBe(false);
      expect(args.help).toBe(false);
    });
  });

  describe('extractN5VocabularyTokens', () => {
    it('should include miru tokens from the N5 reference article', () => {
      const tokens = extractN5VocabularyTokens();

      expect(tokens).toContain('みる');
      expect(tokens).toContain('見る');
      expect(tokens).toContain('miru');
    });
  });

  describe('main function', () => {
    const testVocabularyFile = path.join(__dirname, '../../src/data/vocabulary.yaml');
    let originalVocabularyContent: string;

    beforeEach(() => {
      if (fs.existsSync(testVocabularyFile)) {
        originalVocabularyContent = fs.readFileSync(testVocabularyFile, 'utf8');
      }
    });

    afterEach(() => {
      if (originalVocabularyContent) {
        fs.writeFileSync(testVocabularyFile, originalVocabularyContent);
      }
    });

    it('should run without force option and preserve existing vocabulary', () => {
      const existingData = yaml.load(fs.readFileSync(testVocabularyFile, 'utf8')) as VocabularyData;
      const existingCount = existingData.vocabulary.length;

      main({ force: false });

      const newData = yaml.load(fs.readFileSync(testVocabularyFile, 'utf8')) as VocabularyData;
      expect(newData.vocabulary.length).toBeGreaterThanOrEqual(existingCount);
    });

    it('should recreate vocabulary from scratch with force option', () => {
      main({ force: true });

      const data = yaml.load(fs.readFileSync(testVocabularyFile, 'utf8')) as VocabularyData;
      expect(data.vocabulary.length).toBeGreaterThan(0);
      expect(data.categories).toContain('all');
      expect(data.sortOptions.length).toBeGreaterThan(0);
    });

    it('should produce consistent results when run multiple times with force', () => {
      main({ force: true });
      const firstRun = yaml.load(fs.readFileSync(testVocabularyFile, 'utf8')) as VocabularyData;

      main({ force: true });
      const secondRun = yaml.load(fs.readFileSync(testVocabularyFile, 'utf8')) as VocabularyData;

      expect(firstRun.vocabulary.length).toBe(secondRun.vocabulary.length);
      expect(firstRun.categories).toEqual(secondRun.categories);
      expect(firstRun.sortOptions).toEqual(secondRun.sortOptions);

      firstRun.vocabulary.forEach((item, index) => {
        expect(item.id).toBe(secondRun.vocabulary[index].id);
        expect(item.hiragana).toBe(secondRun.vocabulary[index].hiragana);
        expect(item.romaji).toBe(secondRun.vocabulary[index].romaji);
        expect(item.meaning).toBe(secondRun.vocabulary[index].meaning);
      });
    });
  });
});

