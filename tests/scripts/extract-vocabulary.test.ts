import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import yaml from 'js-yaml';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
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
  createBlueItem,
  createTestVocabularyData,
  createTestVocabularyItem,
  createYellowItem,
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

    it('should extract vocabulary from files with emoji columns, stripping emojis from meanings', () => {
      const vocabulary = extractVocabularyFromFile(path.join(fixturesDir, 'emoji-columns.md'));

      expect(vocabulary).toHaveLength(8);
      expect(vocabulary.find(item => item.hiragana === 'ちち')).toMatchObject({
        kanji: '父', romaji: 'chichi', meaning: 'father', type: 'noun',
      });
      expect(vocabulary.find(item => item.hiragana === 'はは')?.meaning).toBe('mother');
      expect(vocabulary.find(item => item.hiragana === 'いえ')?.meaning).toBe('house');
      expect(vocabulary.find(item => item.hiragana === 'げつようび')?.meaning).toBe('Monday');

      vocabulary.forEach(item => {
        expect(item.hiragana).not.toMatch(/^[\p{Emoji}\s]+$/u);
        expect(item.meaning).not.toMatch(/[\u{1F300}-\u{1F9FF}]|[\u{1F600}-\u{1F64F}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u);
      });
    });

    it('should normalize spaces inside parentheses after stripping emojis', () => {
      // Wear-verb tables use "wear (👕 upper body)" format.
      // Stripping the emoji leaves a leading space: "wear ( upper body)".
      // The normalization step removes it to produce "wear (upper body)".
      const vocabulary = extractVocabularyFromFile(path.join(fixturesDir, 'wear-verbs-emoji.md'));

      expect(vocabulary).toHaveLength(3);
      expect(vocabulary.find(item => item.hiragana === 'きる')?.meaning).toBe('wear (upper body)');
      expect(vocabulary.find(item => item.hiragana === 'はく')?.meaning).toBe('wear (lower body / shoes)');
      expect(vocabulary.find(item => item.hiragana === 'かぶる')?.meaning).toBe('wear (head)');
      vocabulary.forEach(item => {
        expect(item.meaning).not.toMatch(/\(\s|\s{2,}/);
      });
    });

    it('should extract vocabulary from .mdx files with correct IDs and tags', () => {
      const vocabulary = extractVocabularyFromFile(path.join(fixturesDir, 'food-basics.mdx'));

      expect(vocabulary).toHaveLength(3);
      expect(vocabulary.map(i => i.hiragana)).toEqual(['あじ', 'たべもの', 'のみもの']);
      vocabulary.forEach((item, i) => {
        expect(item.id).toBe(`foodbasics_${i}`);
        expect(item.tags).toContain('food-basics');
      });
    });

    it('should extract time vocabulary, stripping emojis and leading numbers from meanings', () => {
      const vocabulary = extractVocabularyFromFile(path.join(fixturesDir, 'time-with-emojis.md'));

      expect(vocabulary).toHaveLength(7);
      expect(vocabulary.find(item => item.hiragana === 'おととい')).toMatchObject({
        kanji: '一昨日', romaji: 'ototoi', meaning: 'day before yesterday', type: 'noun',
      });
      expect(vocabulary.find(item => item.hiragana === 'きょう')).toMatchObject({
        kanji: '今日', romaji: 'kyou', meaning: 'today', type: 'noun',
      });

      expect(vocabulary.find(item => item.hiragana === 'はちがつ')?.meaning).toBe('August');
      expect(vocabulary.find(item => item.hiragana === 'じゅういちがつ')?.meaning).toBe('November');
      expect(vocabulary.find(item => item.hiragana === 'ろくがつ')?.meaning).toBe('June');
      expect(vocabulary.find(item => item.hiragana === 'きのう')?.meaning).toBe('yesterday');

      vocabulary.forEach(item => {
        expect(item.hiragana).not.toMatch(/[⬅️➡️📅🌙🔥💧🌳⭐🌍☀️]/);
        expect(item.meaning).not.toMatch(/[\u{1F300}-\u{1F9FF}]|[\u{1F600}-\u{1F64F}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u);
        expect(item.meaning).not.toMatch(/^\d/);
      });
    });

    it('should keep meaningful plain-digit numbers on counters while removing keycap-emoji prefixes', () => {
      const vocabulary = extractVocabularyFromFile(path.join(fixturesDir, 'counters-with-numbers.md'));

      expect(vocabulary).toHaveLength(6);

      expect(vocabulary.find(item => item.hiragana === 'いっぷん')?.meaning).toBe('1 minute');
      expect(vocabulary.find(item => item.hiragana === 'にふん')?.meaning).toBe('2 minutes');
      expect(vocabulary.find(item => item.hiragana === 'じゅっぷん')?.meaning).toBe('10 minutes');
      expect(vocabulary.find(item => item.hiragana === 'いちにち')?.meaning).toBe('1 day');
      expect(vocabulary.find(item => item.hiragana === 'ふつか')?.meaning).toBe('2 days');
      expect(vocabulary.find(item => item.hiragana === 'はちがつ')?.meaning).toBe('August');
    });

    it('should extract vocabulary from tables without Kanji column', () => {
      const filePath = path.join(fixturesDir, 'no-kanji-column.md');
      const vocabulary = extractVocabularyFromFile(filePath);

      expect(vocabulary).toHaveLength(6);

      vocabulary.forEach(item => {
        expect(item.kanji).toBeUndefined();
        expect(Object.prototype.hasOwnProperty.call(item, 'kanji')).toBe(false);
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

    it('should not produce YAML undefined tags when kanji is missing', () => {
      const filePath = path.join(fixturesDir, 'no-kanji-column.md');
      const vocabulary = extractVocabularyFromFile(filePath);

      const data = { vocabulary };
      const yamlOutput = yaml.dump(data, { indent: 2, lineWidth: -1, noRefs: true });

      expect(yamlOutput).not.toContain('!<tag:yaml.org,2002:js/undefined>');
      expect(yamlOutput).not.toContain('kanji:');
    });

    it('should generate unique and incremental IDs across multiple tables in the same file', () => {
      const vocabulary = extractVocabularyFromFile(path.join(fixturesDir, 'emoji-columns.md'));

      expect(vocabulary).toHaveLength(8);

      vocabulary.forEach((item, i) => expect(item.id).toBe(`emojicolumns_${i}`));
    });
  });

  describe('mergeVocabulary', () => {
    it('should prevent duplicates based on content', () => {
      const existing = createTestVocabularyData([
        createTestVocabularyItem({ id: 'existing_0', tags: ['existing'] }),
      ], { categories: ['colors'] });
      const extracted = createTestVocabularyData([
        createTestVocabularyItem({ id: 'extracted_0', category: 'vocabulary', tags: ['colors'] }),
        createBlueItem({ id: 'extracted_1', category: 'vocabulary', tags: ['colors'] }),
      ], { categories: ['vocabulary'] });
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
        createTestVocabularyItem({ id: 'existing_0', tags: ['colors', 'basics'] }),
      ], { categories: ['colors'] });

      const extracted = createTestVocabularyData([
        createTestVocabularyItem({ id: 'extracted_0', tags: ['vocabulary', 'adjectives'] }),
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
        createTestVocabularyItem({ id: 'existing_0', tags: ['zebra', 'colors'] }),
      ], { categories: ['colors'] });

      const extracted = createTestVocabularyData([
        createTestVocabularyItem({ id: 'extracted_0', tags: ['apple', 'basics'] }),
      ], { categories: ['vocabulary'] });

      const merged = mergeVocabulary(existing, extracted);

      const redItem = merged.vocabulary.find(item => item.hiragana === 'あか');
      expect(redItem?.tags).toEqual(['apple', 'basics', 'colors', 'zebra']);
    });

    it('should deduplicate tags when merging', () => {
      const existing = createTestVocabularyData([
        createTestVocabularyItem({ id: 'existing_0', tags: ['colors', 'basics'] }),
      ], { categories: ['colors'] });

      const extracted = createTestVocabularyData([
        createTestVocabularyItem({ id: 'extracted_0', tags: ['colors', 'adjectives'] }),
      ], { categories: ['vocabulary'] });

      const merged = mergeVocabulary(existing, extracted);

      const redItem = merged.vocabulary.find(item => item.hiragana === 'あか');
      expect(redItem?.tags).toHaveLength(3);
      expect(redItem?.tags).toContain('colors');
      expect(redItem?.tags).toContain('basics');
      expect(redItem?.tags).toContain('adjectives');
    });

    it('should preserve the first occurrence data (except type) when merging duplicates', () => {
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
      expect(redItem?.id).toBe('existing_1');
      expect(redItem?.kanji).toBe('赤');
      expect(redItem?.type).toBe('noun');
      expect(redItem?.category).toBe('colors');
      expect(redItem?.tags).toContain('existing-tag');
      expect(redItem?.tags).toContain('extracted-tag');
    });

    it('should override the existing type with the extracted type and warn', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const existing = createTestVocabularyData([
        createTestVocabularyItem({ id: 'existing_0', type: 'い-adjective', tags: ['existing-tag'] }),
      ], { categories: ['colors'] });
      const extracted = createTestVocabularyData([
        createTestVocabularyItem({ id: 'extracted_0', type: 'noun', tags: ['extracted-tag'] }),
      ], { categories: ['vocabulary'] });

      const merged = mergeVocabulary(existing, extracted);

      expect(merged.vocabulary.find(item => item.hiragana === 'あか')?.type).toBe('noun');
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Type changed for "あか"'),
      );
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('"い-adjective" → "noun"'),
      );

      warnSpy.mockRestore();
    });

    it('should adopt the extracted type without warning when no existing type is set', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const existing = createTestVocabularyData([
        createTestVocabularyItem({ id: 'existing_0', type: undefined, tags: ['existing-tag'] }),
      ], { categories: ['colors'] });
      const extracted = createTestVocabularyData([
        createTestVocabularyItem({ id: 'extracted_0', type: 'noun', tags: ['extracted-tag'] }),
      ], { categories: ['vocabulary'] });

      const merged = mergeVocabulary(existing, extracted);

      expect(merged.vocabulary.find(item => item.hiragana === 'あか')?.type).toBe('noun');
      expect(warnSpy).not.toHaveBeenCalled();

      warnSpy.mockRestore();
    });

    it('should not warn when the same word is merged with the same type', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const existing = createTestVocabularyData([
        createTestVocabularyItem({ id: 'existing_0', type: 'noun', tags: ['existing-tag'] }),
      ], { categories: ['colors'] });
      const extracted = createTestVocabularyData([
        createTestVocabularyItem({ id: 'extracted_0', type: 'noun', tags: ['extracted-tag'] }),
      ], { categories: ['vocabulary'] });

      mergeVocabulary(existing, extracted);

      expect(warnSpy).not.toHaveBeenCalled();

      warnSpy.mockRestore();
    });

    it('should merge categories correctly', () => {
      const existing = createTestVocabularyData([], { categories: ['colors', 'food'] });
      const extracted = createTestVocabularyData([], { categories: ['colors', 'tastes'] });
      const merged = mergeVocabulary(existing, extracted);

      expect(merged.categories).toContain('colors');
      expect(merged.categories).toContain('food');
      expect(merged.categories).toContain('tastes');
      expect(merged.categories).toHaveLength(3);
    });

    it('should preserve existing sort options', () => {
      const existing = createTestVocabularyData([], { sortOptions: [{ value: 'custom', label: 'Custom Sort' }] });
      const extracted = createTestVocabularyData([], { sortOptions: [{ value: 'hiragana', label: 'Hiragana (あ→ん)' }] });
      const merged = mergeVocabulary(existing, extracted);

      expect(merged.sortOptions).toEqual(existing.sortOptions);
    });

    it('should filter out particles during merge', () => {
      const existing = createTestVocabularyData([
        createTestVocabularyItem({ id: 'existing_0', tags: ['colors'] }),
        createTestVocabularyItem({ id: 'existing_1', hiragana: 'は', romaji: 'wa', meaning: 'topic marker', type: 'particle', category: 'grammar', tags: ['grammar'] }),
        createTestVocabularyItem({ id: 'existing_2', hiragana: 'が', romaji: 'ga', meaning: 'subject marker', type: 'particle', category: 'grammar', tags: ['grammar'] }),
      ], { categories: ['colors', 'grammar'] });

      const extracted = createTestVocabularyData([
        createTestVocabularyItem({ id: 'extracted_0', tags: ['colors'] }),
        createBlueItem({ id: 'extracted_1', tags: ['colors'] }),
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

    it('should preserve existing IDs when items are reordered', () => {
      const existing = createTestVocabularyData([
        createTestVocabularyItem({ id: 'colors_0', tags: ['colors'] }),
        createBlueItem({ id: 'colors_1', tags: ['colors'] }),
        createYellowItem({ id: 'colors_2', tags: ['colors'] }),
      ], { categories: ['vocabulary'] });

      const extracted = createTestVocabularyData([
        createYellowItem({ id: 'colors_0', tags: ['colors'] }),
        createTestVocabularyItem({ id: 'colors_1', tags: ['colors'] }),
        createBlueItem({ id: 'colors_2', tags: ['colors'] }),
      ], { categories: ['vocabulary'] });

      const merged = mergeVocabulary(existing, extracted);

      expect(merged.vocabulary.find(item => item.hiragana === 'あか')?.id).toBe('colors_0');
      expect(merged.vocabulary.find(item => item.hiragana === 'あお')?.id).toBe('colors_1');
      expect(merged.vocabulary.find(item => item.hiragana === 'きいろ')?.id).toBe('colors_2');
    });

    it('should assign new IDs continuing from the max existing ID', () => {
      const existing = createTestVocabularyData([
        createTestVocabularyItem({ id: 'colors_0', tags: ['colors'] }),
        createBlueItem({ id: 'colors_1', tags: ['colors'] }),
      ], { categories: ['vocabulary'] });

      const extracted = createTestVocabularyData([
        createTestVocabularyItem({ id: 'colors_0', tags: ['colors'] }),
        createBlueItem({ id: 'colors_0', tags: ['colors'] }),
        createTestVocabularyItem({ id: 'colors_1', hiragana: 'みどり', romaji: 'midori', meaning: 'green', tags: ['colors'] }),
      ], { categories: ['vocabulary'] });

      const merged = mergeVocabulary(existing, extracted);

      expect(merged.vocabulary.find(item => item.hiragana === 'あか')?.id).toBe('colors_0');
      expect(merged.vocabulary.find(item => item.hiragana === 'あお')?.id).toBe('colors_1');
      expect(merged.vocabulary.find(item => item.hiragana === 'みどり')?.id).toBe('colors_2');
    });
  });

  describe('Duplicate Prevention', () => {
    describe('Content-based deduplication', () => {
      it('should prevent duplicates with identical hiragana, romaji, and meaning', () => {
        const existing = createTestVocabularyData([createTestVocabularyItem({ id: 'existing_0', tags: ['existing'] })], { categories: ['colors'] });
        const extracted = createTestVocabularyData([createTestVocabularyItem({ id: 'extracted_0', category: 'vocabulary', tags: ['colors'] })], { categories: ['vocabulary'] });
        const merged = mergeVocabulary(existing, extracted);

        expect(merged.vocabulary).toHaveLength(1);
        expect(merged.vocabulary[0].id).toBe('existing_0');
      });

      it('should prevent duplicates with case-insensitive matching', () => {
        const existing = createTestVocabularyData([createTestVocabularyItem({ id: 'existing_0', meaning: 'Red', tags: ['existing'] })], { categories: ['colors'] });
        const extracted = createTestVocabularyData([createTestVocabularyItem({ id: 'extracted_0', category: 'vocabulary', tags: ['colors'] })], { categories: ['vocabulary'] });
        const merged = mergeVocabulary(existing, extracted);

        expect(merged.vocabulary).toHaveLength(1);
      });

      it('should allow different words with same hiragana but different meaning', () => {
        const existing = createTestVocabularyData([createTestVocabularyItem({ id: 'existing_0', tags: ['colors'] })], { categories: ['colors'] });
        const extracted = createTestVocabularyData([
          createTestVocabularyItem({ id: 'extracted_0', tags: ['colors'] }),
          createTestVocabularyItem({ id: 'extracted_1', meaning: 'bright', category: 'vocabulary', tags: ['colors'] }),
        ], { categories: ['vocabulary'] });
        const merged = mergeVocabulary(existing, extracted);

        expect(merged.vocabulary).toHaveLength(2);
      });

      it('should allow same meaning with different hiragana', () => {
        const existing = createTestVocabularyData([createTestVocabularyItem({ id: 'existing_0', tags: ['colors'] })], { categories: ['colors'] });
        const extracted = createTestVocabularyData([
          createTestVocabularyItem({ id: 'extracted_0', tags: ['colors'] }),
          createTestVocabularyItem({ id: 'extracted_1', hiragana: 'あかい', romaji: 'akai', category: 'vocabulary', tags: ['colors'] }),
        ], { categories: ['vocabulary'] });
        const merged = mergeVocabulary(existing, extracted);

        expect(merged.vocabulary).toHaveLength(2);
      });

      // Helper for the emoji-space deduplication tests below.
      // All fields are fixed; only id and meaning vary between scenarios.
      const wearVerb = (id: string, meaning: string) =>
        createTestVocabularyItem({ id, hiragana: 'きる', romaji: 'kiru', type: 'verb', tags: ['clothes'], meaning });

      it('should treat meanings that differ only by spaces left from emoji stripping as duplicates', () => {
        // "wear (👕 upper body)" → before normalization: "wear ( upper body)"
        // Both resolve to the same content key, so no duplicate entry is created.
        const existing = createTestVocabularyData([wearVerb('clothes_0', 'wear (upper body)')]);
        const extracted = createTestVocabularyData([wearVerb('clothes_0', 'wear ( upper body)')]);

        const merged = mergeVocabulary(existing, extracted);

        expect(merged.vocabulary).toHaveLength(1);
        expect(merged.vocabulary[0]).toMatchObject({ id: 'clothes_0', meaning: 'wear (upper body)' });
      });

      it('should consolidate pre-existing duplicate entries with emoji-space variants, keeping lowest ID', () => {
        // vocabulary.yaml can accumulate duplicate pairs across extraction runs:
        //   clothes_0: "wear (upper body)"   ← original, no emoji in lesson
        //   clothes_1: "wear ( upper body)"  ← created after emoji added, space remained
        // Both normalize to the same content key; merge should collapse them to clothes_0.
        const existing = createTestVocabularyData([
          wearVerb('clothes_0', 'wear (upper body)'),
          wearVerb('clothes_1', 'wear ( upper body)'),
        ]);
        const extracted = createTestVocabularyData([wearVerb('clothes_0', 'wear (upper body)')]);

        const merged = mergeVocabulary(existing, extracted);

        expect(merged.vocabulary).toHaveLength(1);
        expect(merged.vocabulary[0]).toMatchObject({ id: 'clothes_0', meaning: 'wear (upper body)' });
      });
    });

    describe('Orphan removal (deleted lesson files)', () => {
      it('should remove vocabulary items whose lesson file no longer exists', () => {
        // When a lesson file is deleted (e.g. counters.mdx → frequency.md, date-counters.md),
        // its vocabulary items are orphaned: they have tags that no active lesson produces.
        // The merge should drop those items so vocabulary.yaml stays clean.
        const existing = createTestVocabularyData([
          createTestVocabularyItem({ id: 'counters_0', hiragana: 'いっぽん', romaji: 'ippon', meaning: 'one (long thing)', type: 'counter', tags: ['counters'] }),
          createTestVocabularyItem({ id: 'counters_1', hiragana: 'にほん', romaji: 'nihon', meaning: 'two (long things)', type: 'counter', tags: ['counters'] }),
        ]);
        // Extracted has no items with tag 'counters' because the lesson file was deleted
        const extracted = createTestVocabularyData([
          createTestVocabularyItem({ id: 'datecounters_0', hiragana: 'いちにち', romaji: 'ichinichi', meaning: 'one day', type: 'counter', tags: ['date-counters'] }),
        ]);

        const merged = mergeVocabulary(existing, extracted);

        expect(merged.vocabulary).toHaveLength(1);
        expect(merged.vocabulary[0].hiragana).toBe('いちにち');
        expect(merged.vocabulary.find(i => i.tags.includes('counters'))).toBeUndefined();
      });

      it('should keep vocabulary items that appear in at least one still-active lesson', () => {
        // A word that appears in both an active and a deleted lesson should be kept.
        const existing = createTestVocabularyData([
          createTestVocabularyItem({ id: 'word_0', hiragana: 'たくさん', romaji: 'takusan', meaning: 'many', type: 'adverb', tags: ['adjectives', 'cooking'] }),
        ]);
        // 'adjectives' is still active, 'cooking' was deleted — item must survive
        const extracted = createTestVocabularyData([
          createTestVocabularyItem({ id: 'word_0', hiragana: 'たくさん', romaji: 'takusan', meaning: 'many', type: 'adverb', tags: ['adjectives'] }),
        ]);

        const merged = mergeVocabulary(existing, extracted);

        expect(merged.vocabulary).toHaveLength(1);
        expect(merged.vocabulary[0].hiragana).toBe('たくさん');
      });
    });

    describe('Multiple extraction runs', () => {
      it('should be idempotent - running extraction multiple times produces same result', () => {
        const baseVocabulary = createTestVocabularyData([
          createTestVocabularyItem({ id: 'colors_0', category: 'vocabulary', tags: ['colors'] }),
          createBlueItem({ id: 'colors_1', category: 'vocabulary', tags: ['colors'] }),
        ], { categories: ['vocabulary'] });

        const firstMerge = mergeVocabulary(baseVocabulary, baseVocabulary);
        expect(firstMerge.vocabulary).toHaveLength(2);

        const secondMerge = mergeVocabulary(firstMerge, baseVocabulary);
        expect(secondMerge.vocabulary).toHaveLength(2);
        expect(secondMerge.vocabulary).toEqual(firstMerge.vocabulary);
      });

      it('should handle partial duplicates correctly', () => {
        const existing = createTestVocabularyData([
          createTestVocabularyItem({ id: 'existing_0', tags: ['colors'] }),
          createBlueItem({ id: 'existing_1', tags: ['colors'] }),
        ], { categories: ['colors'] });
        const extracted = createTestVocabularyData([
          createTestVocabularyItem({ id: 'extracted_0', category: 'vocabulary', tags: ['colors'] }),
          createBlueItem({ id: 'extracted_2', category: 'vocabulary', tags: ['colors'] }),
          createYellowItem({ id: 'extracted_1', category: 'vocabulary', tags: ['colors'] }),
        ], { categories: ['vocabulary'] });
        const merged = mergeVocabulary(existing, extracted);

        expect(merged.vocabulary).toHaveLength(3);

        expect(merged.vocabulary.find(item => item.hiragana === 'あか')?.id).toBe('existing_0');
        expect(merged.vocabulary.find(item => item.hiragana === 'あお')?.id).toBe('existing_1');
        expect(merged.vocabulary.find(item => item.hiragana === 'きいろ')?.id).toBe('extracted_0');
      });
    });

    describe('Edge cases', () => {
      it('should handle empty vocabulary lists', () => {
        const empty = createTestVocabularyData([], { categories: ['all'] });
        const merged = mergeVocabulary(empty, empty);

        expect(merged.vocabulary).toHaveLength(0);
        expect(merged.categories).toContain('all');
      });

      it('should handle vocabulary with missing fields gracefully', () => {
        const existing = createTestVocabularyData([createTestVocabularyItem({ id: 'existing_0', tags: ['colors'] })], { categories: ['colors'] });
        const extracted = createTestVocabularyData([
          createTestVocabularyItem({ id: 'extracted_0', tags: ['colors'] }),
          createTestVocabularyItem({ id: 'extracted_1', hiragana: '', category: 'vocabulary', tags: ['colors'] }),
        ], { categories: ['vocabulary'] });
        const merged = mergeVocabulary(existing, extracted);

        expect(merged.vocabulary).toHaveLength(2);
      });
    });
  });

  describe('scanAllLessons', () => {
    const testLessonsDir = path.join(__dirname, 'test-lessons');
    const testVocabDir = path.join(testLessonsDir, 'vocabulary');

    beforeEach(() => {
      fs.mkdirSync(testVocabDir, { recursive: true });
      fs.copyFileSync(path.join(fixturesDir, 'basic-colors.md'), path.join(testVocabDir, 'colors.md'));
      fs.copyFileSync(path.join(fixturesDir, 'tastes.md'), path.join(testVocabDir, 'tastes.md'));
      process.env.TEST_LESSONS_DIR = testLessonsDir;
    });

    afterEach(() => {
      fs.rmSync(testLessonsDir, { recursive: true, force: true });
    });

    it('should scan all lesson files in a directory', () => {
      const result = scanAllLessons();

      expect(result.vocabulary).toHaveLength(9);
      expect(result.categories).toContain('vocabulary');
      expect(result.sortOptions).toHaveLength(4);
    });

    it('should scan .mdx files alongside .md files', () => {
      const mdxVocabDir = path.join(testLessonsDir, 'vocabulary', 'food');
      fs.mkdirSync(mdxVocabDir, { recursive: true });
      fs.copyFileSync(path.join(fixturesDir, 'food-basics.mdx'), path.join(mdxVocabDir, 'food-basics.mdx'));

      const result = scanAllLessons();

      expect(result.vocabulary).toHaveLength(12);

      const hiraganaList = result.vocabulary.map(i => i.hiragana);
      expect(hiraganaList).toContain('あか');  // .md file still scanned
      expect(hiraganaList).toContain('あじ');  // .mdx file scanned alongside

      const ajiItem = result.vocabulary.find(i => i.hiragana === 'あじ');
      expect(ajiItem?.tags).toContain('food-basics');
      expect(ajiItem?.id).toMatch(/^foodbasics_\d+$/);
    });

    it('should return consistently ordered results across multiple calls', () => {
      const result1 = scanAllLessons();
      const result2 = scanAllLessons();

      expect(result1.vocabulary).toEqual(result2.vocabulary);
      expect(result1.categories).toEqual(result2.categories);
      expect(result1.sortOptions).toEqual(result2.sortOptions);
      expect(result1.categories).toEqual([...result1.categories].sort());

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
          tags: ['colors'],
        }),
      ], {
        categories: ['general'],
        sortOptions: [
          { value: 'hiragana', label: 'Hiragana (あ→ん)' },
        ],
      });

      fs.writeFileSync(testVocabularyFile, yaml.dump(testData));

      const extracted = createTestVocabularyData([
        createTestVocabularyItem({
          id: 'colors_0',
          hiragana: 'あか',
          romaji: 'aka',
          meaning: 'red',
          type: 'い-adjective',
          category: 'vocabulary',
          tags: ['colors'],
        }),
        createTestVocabularyItem({
          id: 'colors_1',
          hiragana: 'テスト',
          romaji: 'tesuto',
          meaning: 'test',
          type: 'noun',
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
        createTestVocabularyItem({ id: 'existing_0', category: 'vocabulary', tags: ['colors'] }),
        createBlueItem({ id: 'existing_1', category: 'vocabulary', tags: ['colors'] }),
      ], { categories: ['vocabulary'] });

      const extracted = createTestVocabularyData([
        createTestVocabularyItem({ id: 'existing_0', category: 'vocabulary', tags: ['colors'] }),
        createBlueItem({ id: 'existing_1', category: 'vocabulary', tags: ['colors'] }),
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

