import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';

type VocabularyItem = {
  id: string;
  hiragana?: string;
  kanji?: string;
  romaji?: string;
  meaning?: string;
  category?: string;
  tags?: string[];
  type?: string;
};

type VocabularyData = {
  vocabulary: VocabularyItem[];
  categories?: string[];
  sortOptions?: Array<{ value: string; label: string }>;
};

test.describe('Vocabulary IDs Validation', () => {
  test('should have unique and incremental IDs for all vocabulary items', () => {
    const vocabularyFile = path.join(__dirname, '../../src/data/vocabulary.yaml');
    
    expect(fs.existsSync(vocabularyFile)).toBe(true);
    
    const content = fs.readFileSync(vocabularyFile, 'utf8');
    const data = yaml.load(content) as VocabularyData;
    
    const idSet = new Set<string>();
    const duplicateIds: string[] = [];
    
    data.vocabulary.forEach(item => {
      if (idSet.has(item.id)) {
        duplicateIds.push(item.id);
      } else {
        idSet.add(item.id);
      }
    });
    
    expect(duplicateIds).toHaveLength(0);
    
    const byPrefix = new Map<string, VocabularyItem[]>();
    
    data.vocabulary.forEach(item => {
      const parts = item.id.split('_');
      const prefix = parts.slice(0, -1).join('_');
      
      if (!byPrefix.has(prefix)) {
        byPrefix.set(prefix, []);
      }
      byPrefix.get(prefix)!.push(item);
    });
    
    byPrefix.forEach((items, prefix) => {
      const suffixes = items
        .map(item => {
          const parts = item.id.split('_');
          return parseInt(parts[parts.length - 1], 10);
        })
        .sort((a, b) => a - b);
      
      for (let i = 0; i < suffixes.length; i++) {
        expect(suffixes[i]).toBe(i);
      }
    });
  });
});

