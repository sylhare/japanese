import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import { extractVocabularyFromFile, scanAllLessons, mergeVocabulary } from '../scripts/extract-vocabulary.js';
import {
  createTestVocabularyItem,
  createTestVocabularyData,
  createExtractVocabularyDuplicateTestData,
  createCategoryMergeTestData,
  createSortOptionsTestData,
  type VocabularyItem,
  type VocabularyData
} from './test-utils.js';

describe('Vocabulary Extraction', () => {
  const fixturesDir = path.join(__dirname, '__fixtures__');
  const testVocabularyFile = path.join(__dirname, 'test-vocabulary.yaml');

  beforeEach(() => {
    // Clean up any existing test files
    if (fs.existsSync(testVocabularyFile)) {
      fs.unlinkSync(testVocabularyFile);
    }
  });

  afterEach(() => {
    // Clean up test files
    if (fs.existsSync(testVocabularyFile)) {
      fs.unlinkSync(testVocabularyFile);
    }
  });

  describe('extractVocabularyFromFile', () => {
    it('should extract vocabulary from basic colors lesson', () => {
      const filePath = path.join(fixturesDir, 'basic-colors.md');
      const vocabulary = extractVocabularyFromFile(filePath);

      expect(vocabulary).toHaveLength(5); // 3 from Basic Colors + 2 from Vocabulary from This Lesson

      // Check that we have the expected vocabulary items
      const hiraganaList = vocabulary.map(item => item.hiragana);
      expect(hiraganaList).toContain('あか');
      expect(hiraganaList).toContain('あお');
      expect(hiraganaList).toContain('きいろ');
      expect(hiraganaList).toContain('みどり');
      expect(hiraganaList).toContain('しろ');

      // Check specific item
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

      // Check that all items have required fields
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

      expect(vocabulary).toHaveLength(4); // 2 from Basic Tastes + 2 from Vocabulary from This Lesson

      // Check that we have the expected vocabulary items
      const hiraganaList = vocabulary.map(item => item.hiragana);
      expect(hiraganaList).toContain('あまい');
      expect(hiraganaList).toContain('からい');
      expect(hiraganaList).toContain('にがい');
      expect(hiraganaList).toContain('すっぱい');

      // Check for taste vocabulary
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

      // Should extract valid rows and skip empty/separator rows
      expect(vocabulary).toHaveLength(3);
      
      const validItems = vocabulary.filter(item => 
        item.hiragana && item.romaji && item.meaning
      );
      expect(validItems).toHaveLength(3);

      // Should not include empty rows
      const emptyItems = vocabulary.filter(item => 
        !item.hiragana || !item.romaji || !item.meaning
      );
      expect(emptyItems).toHaveLength(0);
    });

    it('should handle files with no vocabulary tables', () => {
      const emptyFile = path.join(fixturesDir, 'empty-lesson.md');
      
      // Create an empty lesson file
      fs.writeFileSync(emptyFile, '# Empty Lesson\n\nNo vocabulary here.');
      
      const vocabulary = extractVocabularyFromFile(emptyFile);
      expect(vocabulary).toHaveLength(0);

      // Clean up
      fs.unlinkSync(emptyFile);
    });
  });

  describe('mergeVocabulary', () => {
    it('should prevent duplicates based on content', () => {
      const { existing, extracted } = createExtractVocabularyDuplicateTestData();
      const merged = mergeVocabulary(existing, extracted);

      // Should have 2 items total (1 existing + 1 new, duplicate removed)
      expect(merged.vocabulary).toHaveLength(2);
      
      // Should preserve the existing item
      const redItem = merged.vocabulary.find(item => item.hiragana === 'あか');
      expect(redItem?.id).toBe('existing_1');
      expect(redItem?.tags).toContain('existing');

      // Should add the new item
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
  });

  describe('scanAllLessons', () => {
    it('should scan all lesson files in a directory', () => {
      // Create a temporary lessons directory for testing
      const testLessonsDir = path.join(__dirname, 'test-lessons');
      const testVocabDir = path.join(testLessonsDir, 'vocabulary');
      
      fs.mkdirSync(testVocabDir, { recursive: true });
      
      // Copy fixture files to test directory
      fs.copyFileSync(
        path.join(fixturesDir, 'basic-colors.md'),
        path.join(testVocabDir, 'basic-colors.md')
      );
      fs.copyFileSync(
        path.join(fixturesDir, 'tastes.md'),
        path.join(testVocabDir, 'tastes.md')
      );

      // Create a modified version of scanAllLessons that uses our test directory
      const { scanAllLessons: originalScanAllLessons } = require('../scripts/extract-vocabulary.js');
      
      // Mock the LESSONS_DIR by creating a custom scan function
      function scanTestLessons(): VocabularyData {
        const vocabulary: VocabularyItem[] = [];
        const categories = new Set(['all']);
        const sortOptions = [
          { value: 'hiragana', label: 'Hiragana (A-Z)' },
          { value: 'romaji', label: 'Romaji (A-Z)' },
          { value: 'meaning', label: 'Meaning (A-Z)' },
          { value: 'category', label: 'Category' }
        ];
        
        function scanDirectory(dir: string): void {
          const files = fs.readdirSync(dir);
          
          for (const file of files) {
            const filePath = path.join(dir, file);
            const stat = fs.statSync(filePath);
            
            if (stat.isDirectory()) {
              scanDirectory(filePath);
            } else if (file.endsWith('.md')) {
              const lessonVocabulary = extractVocabularyFromFile(filePath);
              vocabulary.push(...lessonVocabulary);
              
              // Collect categories
              lessonVocabulary.forEach(item => {
                categories.add(item.category);
              });
            }
          }
        }
        
        scanDirectory(testLessonsDir);
        
        return {
          vocabulary,
          categories: Array.from(categories).sort(),
          sortOptions
        };
      }

      try {
        const result = scanTestLessons();
        
        expect(result.vocabulary).toHaveLength(9); // 5 from basic-colors + 4 from tastes
        expect(result.categories).toContain('vocabulary');
        expect(result.sortOptions).toHaveLength(4);
      } finally {
        // Clean up test directory
        fs.rmSync(testLessonsDir, { recursive: true, force: true });
      }
    });
  });

  describe('Integration Tests', () => {
    it('should handle the full extraction workflow', () => {
      // Create a test vocabulary file
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

      // Test the merge process
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
      
      // Check if vocabulary file exists
      if (!fs.existsSync(vocabularyFile)) {
        // Run extraction to create the file
        const { scanAllLessons, mergeVocabulary } = require('../scripts/extract-vocabulary.js');
        const extracted = scanAllLessons();
        const existing = { vocabulary: [], categories: ['all'], sortOptions: [] };
        const merged = mergeVocabulary(existing, extracted);
        
        // Create the vocabulary file
        const yaml = require('js-yaml');
        const vocabularyDir = path.dirname(vocabularyFile);
        if (!fs.existsSync(vocabularyDir)) {
          fs.mkdirSync(vocabularyDir, { recursive: true });
        }
        fs.writeFileSync(vocabularyFile, yaml.dump(merged));
      }
      
      expect(fs.existsSync(vocabularyFile)).toBe(true);
      
      // Check if it's valid YAML
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
      
      // Ensure file exists
      if (!fs.existsSync(vocabularyFile)) {
        // Run extraction to create the file
        const { scanAllLessons, mergeVocabulary } = require('../scripts/extract-vocabulary.js');
        const extracted = scanAllLessons();
        const existing = { vocabulary: [], categories: ['all'], sortOptions: [] };
        const merged = mergeVocabulary(existing, extracted);
        
        // Create the vocabulary file
        const yaml = require('js-yaml');
        const vocabularyDir = path.dirname(vocabularyFile);
        if (!fs.existsSync(vocabularyDir)) {
          fs.mkdirSync(vocabularyDir, { recursive: true });
        }
        fs.writeFileSync(vocabularyFile, yaml.dump(merged));
      }
      
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

    it('should extract vocabulary from real lesson files', () => {
      const result = scanAllLessons();
      
      expect(result.vocabulary.length).toBeGreaterThan(0);
      expect(result.categories.length).toBeGreaterThan(0);
      expect(result.sortOptions.length).toBeGreaterThan(0);
      
      // Check that all vocabulary items have required fields
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

    it('should work with any section heading', () => {
      // Create a test file with a custom section heading
      const testFile = path.join(__dirname, '__fixtures__/custom-section.md');
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

      try {
        const vocabulary = extractVocabularyFromFile(testFile);
        
        expect(vocabulary).toHaveLength(2);
        expect(vocabulary[0].hiragana).toBe('テスト');
        expect(vocabulary[1].hiragana).toBe('サンプル');
      } finally {
        // Clean up test file
        if (fs.existsSync(testFile)) {
          fs.unlinkSync(testFile);
        }
      }
    });
  });
});
