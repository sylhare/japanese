import '@testing-library/jest-dom';
import { scanAllLessons, mergeVocabulary } from '../scripts/extract-vocabulary.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import yaml from 'js-yaml';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** Ensure vocabulary.yaml exists before running integration tests */
const vocabularyFile = path.join(__dirname, '../src/data/vocabulary.yaml');
if (!fs.existsSync(vocabularyFile)) {
  const existing = { vocabulary: [], categories: ['all'], sortOptions: [] };
  const extracted = scanAllLessons();
  const merged = mergeVocabulary(existing, extracted);
  
  const dir = path.dirname(vocabularyFile);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  fs.writeFileSync(vocabularyFile, yaml.dump(merged));
}
