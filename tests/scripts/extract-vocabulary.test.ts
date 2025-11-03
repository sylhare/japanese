import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import yaml from 'js-yaml';
import { extractVocabularyFromFile, scanAllLessons, mergeVocabulary } from '../../scripts/extract-vocabulary.js';
import {
  createTestVocabularyItem,
  createTestVocabularyData,
  createExtractVocabularyDuplicateTestData,
  createCategoryMergeTestData,
  createSortOptionsTestData,
  createDuplicateTestData,
  createPartialDuplicateTestData,
  createIdempotentTestData,
  createEmptyTestData,
  createMissingFieldsTestData,
  createCaseInsensitiveTestData,
  createDifferentMeaningTestData,
  createDifferentHiraganaTestData,
  type VocabularyItem,
  type VocabularyData
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
        tags: ['basic-colors']
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
        type: 'い-adjective'
      });
    });

    it('should handle malformed tables gracefully', () => {
      const filePath = path.join(fixturesDir, 'malformed-table.md');
      const vocabulary = extractVocabularyFromFile(filePath);

      expect(vocabulary).toHaveLength(3);
      
      const validItems = vocabulary.filter(item => 
        item.hiragana && item.romaji && item.meaning
      );
      expect(validItems).toHaveLength(3);

      const emptyItems = vocabulary.filter(item => 
        !item.hiragana || !item.romaji || !item.meaning
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
        item.hiragana.match(/^[\p{Emoji}\s]+$/u)
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
        type: 'noun'
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

    it('should correctly extract time vocabulary with emoji columns without column misalignment', () => {
      const filePath = path.join(fixturesDir, 'time-with-emojis.md');
      const vocabulary = extractVocabularyFromFile(filePath);
      
      expect(vocabulary).toHaveLength(4);
      
      const emojiInHiragana = vocabulary.filter(item => 
        item.hiragana && /[📅⬅️➡️]/.test(item.hiragana)
      );
      expect(emojiInHiragana).toHaveLength(0);
      
      const ototoiItem = vocabulary.find(item => item.hiragana === 'おととい');
      expect(ototoiItem).toBeDefined();
      expect(ototoiItem).toMatchObject({
        hiragana: 'おととい',
        kanji: '一昨日',
        romaji: 'ototoi',
        meaning: 'day before yesterday',
        type: 'noun'
      });
      
      const kyouItem = vocabulary.find(item => item.hiragana === 'きょう');
      expect(kyouItem).toBeDefined();
      expect(kyouItem).toMatchObject({
        hiragana: 'きょう',
        kanji: '今日',
        romaji: 'kyou',
        meaning: 'today',
        type: 'noun'
      });
      
      // Verify emojis are stripped from meanings
      expect(kyouItem?.meaning).toBe('today');
      expect(kyouItem?.meaning).not.toContain('📅');
      
      const kinouItem = vocabulary.find(item => item.hiragana === 'きのう');
      expect(kinouItem?.meaning).toBe('yesterday');
      expect(kinouItem?.meaning).not.toContain('⬅️');
      
      vocabulary.forEach(item => {
        expect(item.hiragana).not.toMatch(/[⬅️➡️📅🌙🔥💧🌳⭐🌍☀️]/);
        // Verify meanings don't contain emojis
        expect(item.meaning).not.toMatch(/[\u{1F300}-\u{1F9FF}]|[\u{1F600}-\u{1F64F}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u);
      });
    });
  });

  describe('mergeVocabulary', () => {
    it('should prevent duplicates based on content', () => {
      const { existing, extracted } = createExtractVocabularyDuplicateTestData();
      const merged = mergeVocabulary(existing, extracted);

      expect(merged.vocabulary).toHaveLength(2);
      
      const redItem = merged.vocabulary.find(item => item.hiragana === 'あか');
      expect(redItem?.id).toBe('existing_1');
      expect(redItem?.tags).toContain('existing');

      const blueItem = merged.vocabulary.find(item => item.hiragana === 'あお');
      expect(blueItem).toBeDefined();
      expect(blueItem?.id).toBe('extracted_2');
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
          tags: ['colors']
        }),
        createTestVocabularyItem({
          id: 'existing_2',
          hiragana: 'は',
          romaji: 'wa',
          meaning: 'topic marker',
          type: 'particle',
          category: 'grammar',
          tags: ['grammar']
        }),
        createTestVocabularyItem({
          id: 'existing_3',
          hiragana: 'が',
          romaji: 'ga',
          meaning: 'subject marker',
          type: 'particle',
          category: 'grammar',
          tags: ['grammar']
        })
      ], { categories: ['colors', 'grammar'] });

      const extracted = createTestVocabularyData([
        createTestVocabularyItem({
          id: 'extracted_1',
          hiragana: 'あお',
          romaji: 'ao',
          meaning: 'blue',
          type: 'い-adjective',
          category: 'colors',
          tags: ['colors']
        })
      ], { categories: ['colors'] });

      const merged = mergeVocabulary(existing, extracted);
      
      expect(merged.vocabulary).toHaveLength(2);
      
      const particles = merged.vocabulary.filter(item => 
        item.type && item.type.toLowerCase().includes('particle')
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
        
        expect(merged.vocabulary.find(item => item.id === 'existing_1')).toBeDefined();
        expect(merged.vocabulary.find(item => item.id === 'existing_2')).toBeDefined();
        
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
        path.join(testVocabDir, 'colors.md')
      );
      fs.copyFileSync(
        path.join(fixturesDir, 'tastes.md'),
        path.join(testVocabDir, 'tastes.md')
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
        path.join(testVocabDir, 'colors.md')
      );
      fs.copyFileSync(
        path.join(fixturesDir, 'tastes.md'),
        path.join(testVocabDir, 'tastes.md')
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
          tags: ['existing']
        })
      ], { 
        categories: ['general'],
        sortOptions: [
          { value: 'hiragana', label: 'Hiragana (A-Z)' }
        ]
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
          tags: ['colors']
        })
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
        item.hiragana && arrowEmojiRegex.test(item.hiragana)
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
          tags: ['colors']
        }),
        createTestVocabularyItem({
          id: 'existing_2',
          hiragana: 'あお',
          romaji: 'ao',
          meaning: 'blue',
          type: 'い-adjective',
          category: 'vocabulary',
          tags: ['colors']
        })
      ], { categories: ['vocabulary'] });

      const extracted = createTestVocabularyData([
        createTestVocabularyItem({
          id: 'existing_1',
          hiragana: 'あか',
          romaji: 'aka',
          meaning: 'red',
          type: 'い-adjective',
          category: 'vocabulary',
          tags: ['colors']
        }),
        createTestVocabularyItem({
          id: 'existing_2',
          hiragana: 'あお',
          romaji: 'ao',
          meaning: 'blue',
          type: 'い-adjective',
          category: 'vocabulary',
          tags: ['colors']
        })
      ], { categories: ['vocabulary'] });

      const firstMerge = mergeVocabulary(existing, extracted);
      const secondMerge = mergeVocabulary(firstMerge, extracted);
      const thirdMerge = mergeVocabulary(secondMerge, extracted);

      expect(firstMerge.vocabulary).toEqual(secondMerge.vocabulary);
      expect(secondMerge.vocabulary).toEqual(thirdMerge.vocabulary);
      expect(firstMerge.vocabulary[0].hiragana).toBe('あお');
      expect(firstMerge.vocabulary[1].hiragana).toBe('あか');
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
});

