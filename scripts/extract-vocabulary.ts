/**
 * Vocabulary extraction script.
 *
 * Scans all lesson files in docs/lessons/ for vocabulary tables, merges the
 * results into src/data/vocabulary.yaml, and regenerates src/data/n5-vocabulary.json
 * from the N5 reference article. Run via tsx (see the npm scripts).
 *
 * Full documentation: .github/docs/vocabulary-extraction.md
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import yaml from 'js-yaml';
import { VALID_TYPES, normalizeToken } from '../src/data/vocabulary-types';
import type { VocabularyData, VocabularyItem } from '../src/data/vocabulary-types';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const DOCS_DIR = path.join(__dirname, '../docs');
const DEFAULT_LESSONS_DIR = path.join(DOCS_DIR, 'lessons');
const VOCABULARY_FILE = path.join(__dirname, '../src/data/vocabulary.yaml');
const N5_REFERENCE_FILE = path.join(DOCS_DIR, 'reference/n5-vocabulary.md');
const N5_VOCABULARY_FILE = path.join(__dirname, '../src/data/n5-vocabulary.json');
const LESSON_PATHS_FILE = path.join(__dirname, '../src/data/lesson-paths.json');
const VOCAB_TABLE_PATTERN = /## [^#\n]+[\s\S]*?(\|.*?Hiragana.*?\|[\s\S]*?)(?=\n##|\n## Next Steps|\n## Tips|\n## Remember|$)/gi;

/** Extract vocabulary from a single lesson file. */
function extractVocabularyFromFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const vocabulary = [];
  let itemCounter = 0;

  let match;
  while ((match = VOCAB_TABLE_PATTERN.exec(content)) !== null) {
    const tableContent = match[1];

    if (isVocabularyTable(tableContent)) {
      const extracted = extractFromTable(tableContent, filePath, itemCounter);
      vocabulary.push(...extracted);
      itemCounter += extracted.length;
    }
  }

  return vocabulary;
}

/** True if the table has the expected Hiragana / Romaji / English columns. */
function isVocabularyTable(tableContent) {
  const lines = tableContent.trim().split('\n');
  if (lines.length === 0) {
    return false;
  }

  const headerRow = lines[0];
  return /Hiragana/i.test(headerRow) && /Romaji/i.test(headerRow) && /English/i.test(headerRow);
}

/** Parse a table row into an array of trimmed cells. */
function parseRow(row) {
  return row.replace(/^\||\|$/g, '').split('|').map(cell => cell.trim());
}

/** True for particle rows, which are filtered out of the dictionary. */
function isParticle(type) {
  return type && type.toLowerCase().includes('particle');
}

/**
 * Remove emoji from a string, keeping letters, numbers, spaces, and common punctuation.
 * Keycap emoji (e.g. "8️⃣") are removed as whole sequences so their base digit doesn't leak through.
 */
function stripEmojis(text) {
  if (!text) return text;
  text = text.replace(/[0-9#*]️?⃣/g, '');
  text = text.replace(/[^\p{L}\p{N}\s.,'():;/&-]/gu, '');
  text = text.replace(/\(\s+/g, '(').replace(/\s+\)/g, ')');
  text = text.replace(/\s+/g, ' ');
  return text.trim();
}

function addTokensFromCell(cell, tokens) {
  if (!cell) return;
  const cleaned = cell.replace(/（.*?）/g, '').replace(/\(.*?\)/g, '').trim();
  cleaned.split(/[/／]/).forEach(part => {
    const normalized = normalizeToken(part);
    if (normalized) {
      tokens.add(normalized);
    }
  });
}

/** Extract N5 vocabulary tokens from the N5 reference article. */
function extractN5VocabularyTokens(): string[] {
  if (!fs.existsSync(N5_REFERENCE_FILE)) {
    return [];
  }

  const content = fs.readFileSync(N5_REFERENCE_FILE, 'utf8');
  const tokens = new Set<string>();
  const lines = content.split('\n');

  for (let index = 0; index < lines.length; index++) {
    const line = lines[index];
    if (!line.startsWith('|')) {
      continue;
    }

    const headerCells = parseRow(line);
    const hiraganaIdx = findColumnIndex(headerCells, 'Hiragana');
    const kanjiIdx = findColumnIndex(headerCells, 'Kanji');
    const romajiIdx = findColumnIndex(headerCells, 'Romaji');

    if (hiraganaIdx === -1 || romajiIdx === -1) {
      continue;
    }

    index += 1;
    for (; index < lines.length; index++) {
      const row = lines[index];
      if (!row.startsWith('|')) {
        break;
      }
      if (row.match(/^\|\s*[-:]+/)) {
        continue;
      }

      const cells = parseRow(row);
      const hiragana = cells[hiraganaIdx] || '';
      const kanji = kanjiIdx >= 0 ? cells[kanjiIdx] : '';
      const romaji = cells[romajiIdx] || '';

      if (!hiragana || hiragana.match(/^-+$/)) {
        continue;
      }

      addTokensFromCell(hiragana, tokens);
      addTokensFromCell(kanji, tokens);
      addTokensFromCell(romaji, tokens);
    }
  }

  return Array.from(tokens).sort();
}

/** Map of lesson slug → doc path, derived from the lesson files on disk so new lessons link automatically. */
function buildLessonPaths(): Record<string, string> {
  const paths: Record<string, string> = {};
  const walk = (dir) => {
    for (const file of fs.readdirSync(dir).sort()) {
      const full = path.join(dir, file);
      if (fs.statSync(full).isDirectory()) {
        walk(full);
      } else if (/\.mdx?$/.test(file)) {
        const slug = file.replace(/\.mdx?$/, '');
        if (slug === 'index') {
          continue;
        }
        const rel = path.relative(DOCS_DIR, full).replace(/\.mdx?$/, '').split(path.sep).join('/');
        paths[slug.toLowerCase()] = `docs/${rel}`;
      }
    }
  };
  walk(DEFAULT_LESSONS_DIR);
  paths.n5 = 'docs/reference/n5-vocabulary';
  return paths;
}

function updateLessonPaths() {
  const nextContent = `${JSON.stringify(buildLessonPaths(), null, 2)}\n`;
  const existingContent = fs.existsSync(LESSON_PATHS_FILE)
    ? fs.readFileSync(LESSON_PATHS_FILE, 'utf8')
    : '';

  if (existingContent !== nextContent) {
    fs.writeFileSync(LESSON_PATHS_FILE, nextContent);
    console.log('✅ Lesson paths updated successfully!');
  } else {
    console.log('✅ Lesson paths are up to date (no changes needed)');
  }
}

function updateN5VocabularyData() {
  const payload = { tokens: extractN5VocabularyTokens() };
  const nextContent = `${JSON.stringify(payload, null, 2)}\n`;
  const existingContent = fs.existsSync(N5_VOCABULARY_FILE)
    ? fs.readFileSync(N5_VOCABULARY_FILE, 'utf8')
    : '';

  if (existingContent !== nextContent) {
    fs.writeFileSync(N5_VOCABULARY_FILE, nextContent);
    console.log('✅ N5 vocabulary data updated successfully!');
  } else {
    console.log('✅ N5 vocabulary data is up to date (no changes needed)');
  }
}

/** Find a column index by name (case-insensitive, tolerant of emoji prefixes); -1 if absent. */
function findColumnIndex(headerCells, columnName) {
  return headerCells.findIndex(cell => {
    const cleaned = cell.toLowerCase().replace(/^\s*\||\|\s*$/, '').trim();
    return cleaned.includes(columnName.toLowerCase());
  });
}

/** Extract vocabulary items from a table, filtering out particles. */
function extractFromTable(tableContent, filePath, startIndex = 0) {
  const vocabulary = [];
  const rows = tableContent.trim().split('\n');

  if (rows.length < 2) {
    return vocabulary;
  }

  const headerCells = parseRow(rows[0]);
  const hiraganaIdx = findColumnIndex(headerCells, 'Hiragana');
  const kanjiIdx = findColumnIndex(headerCells, 'Kanji');
  const romajiIdx = findColumnIndex(headerCells, 'Romaji');
  const englishIdx = findColumnIndex(headerCells, 'English');
  const typeIdx = findColumnIndex(headerCells, 'Type');

  if (hiraganaIdx === -1 || romajiIdx === -1 || englishIdx === -1) {
    return vocabulary;
  }

  let itemIndex = startIndex;

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];

    if (row.match(/^[\s|:-]+$/)) {
      continue;
    }

    const cells = parseRow(row);
    const cellAt = (idx) => (idx >= 0 && idx < cells.length ? cells[idx].trim() : '');

    const hiragana = cellAt(hiraganaIdx);
    const kanji = cellAt(kanjiIdx);
    const romaji = stripEmojis(cellAt(romajiIdx));
    const english = stripEmojis(cellAt(englishIdx));
    const type = cellAt(typeIdx);

    if (!hiragana || !romaji || !english || hiragana.includes('---') || hiragana.match(/Hiragana|Kanji|Romaji|English/i)) {
      continue;
    }

    if (isParticle(type)) {
      continue;
    }

    if (type && !VALID_TYPES.includes(type)) {
      console.warn(`⚠️  Unknown type "${type}" in ${path.basename(filePath)} (row: ${hiragana})`);
    }

    if (hiragana.match(/^[\p{Emoji}\s]+$/u)) {
      continue;
    }

    const fileId = path.basename(filePath).replace(/\.mdx?$/, '').replace(/[^a-zA-Z0-9]/g, '');

    let category = 'general';
    if (filePath.includes('/vocabulary/')) {
      category = path.basename(path.dirname(filePath));
    } else if (filePath.includes('/grammar/')) {
      category = 'grammar';
    } else if (filePath.includes('/lessons/')) {
      category = 'lessons';
    }

    const item: VocabularyItem = {
      id: `${fileId}_${itemIndex}`,
      hiragana,
      romaji,
      meaning: english,
      category,
      tags: [path.basename(filePath).replace(/\.mdx?$/, '')],
      type: type || 'unknown',
    };

    if (kanji && kanji !== '-') {
      item.kanji = kanji;
    }

    vocabulary.push(item);
    itemIndex++;
  }

  return vocabulary;
}

const DEFAULT_SORT_OPTIONS = [
  { value: 'hiragana', label: 'Hiragana (あ→ん)' },
  { value: 'romaji', label: 'Romaji (A-Z)' },
  { value: 'meaning', label: 'Meaning (A-Z)' },
  { value: 'category', label: 'Category (A-Z)' },
];

/** Scan all lesson files for vocabulary. */
function scanAllLessons(): VocabularyData {
  const vocabulary = [];
  const categories = new Set(['all']);

  function scanDirectory(dir) {
    for (const file of fs.readdirSync(dir).sort()) {
      const filePath = path.join(dir, file);
      if (fs.statSync(filePath).isDirectory()) {
        scanDirectory(filePath);
      } else if (file.endsWith('.md') || file.endsWith('.mdx')) {
        const lessonVocabulary = extractVocabularyFromFile(filePath);
        vocabulary.push(...lessonVocabulary);
        lessonVocabulary.forEach(item => categories.add(item.category));
      }
    }
  }

  scanDirectory(process.env.TEST_LESSONS_DIR || DEFAULT_LESSONS_DIR);

  vocabulary.sort((a, b) => {
    const fileCompare = a.tags[0].localeCompare(b.tags[0]);
    return fileCompare !== 0 ? fileCompare : a.id.localeCompare(b.id);
  });

  return {
    vocabulary,
    categories: Array.from(categories).sort(),
    sortOptions: DEFAULT_SORT_OPTIONS,
  };
}

/** An empty vocabulary dataset (the base for force mode and missing/corrupt files). */
function emptyVocabulary(): VocabularyData {
  return { vocabulary: [], categories: ['all'], sortOptions: [] };
}

/** Load existing vocabulary to preserve manually added items. */
function loadExistingVocabulary(): VocabularyData {
  if (!fs.existsSync(VOCABULARY_FILE)) {
    return emptyVocabulary();
  }

  try {
    return yaml.load(fs.readFileSync(VOCABULARY_FILE, 'utf8')) as VocabularyData;
  } catch (error) {
    console.error('Error loading existing vocabulary:', error);
    return emptyVocabulary();
  }
}

/** Compare two IDs with natural numeric ordering, e.g. "tastes_5" < "tastes_12". */
function compareIds(idA, idB) {
  const partsA = idA.split('_');
  const partsB = idB.split('_');

  const prefixCompare = partsA.slice(0, -1).join('_').localeCompare(partsB.slice(0, -1).join('_'));
  if (prefixCompare !== 0) {
    return prefixCompare;
  }

  const suffixA = partsA[partsA.length - 1];
  const suffixB = partsB[partsB.length - 1];
  const numA = parseInt(suffixA, 10);
  const numB = parseInt(suffixB, 10);

  if (!isNaN(numA) && !isNaN(numB)) {
    return numA - numB;
  }
  return suffixA.localeCompare(suffixB);
}

function contentKeyFor(item) {
  return `${item.hiragana}-${item.romaji}-${stripEmojis(item.meaning)}`.toLowerCase();
}

/**
 * Merge extracted vocabulary with existing vocabulary, filtering out particles.
 * Idempotent: rerunning produces the same result. Duplicates (same hiragana-romaji-meaning) merge their tags.
 */
function mergeVocabulary(existing: VocabularyData, extracted: VocabularyData): VocabularyData {
  const contentToExistingId = new Map();
  for (const item of existing.vocabulary) {
    const key = contentKeyFor(item);
    if (!contentToExistingId.has(key)) {
      contentToExistingId.set(key, item.id);
    }
  }

  const maxSuffixByPrefix = new Map();
  for (const item of existing.vocabulary) {
    const parts = item.id.split('_');
    const num = parseInt(parts[parts.length - 1], 10);
    const prefix = parts.slice(0, -1).join('_');
    if (!isNaN(num)) {
      maxSuffixByPrefix.set(prefix, Math.max(maxSuffixByPrefix.get(prefix) ?? -1, num));
    }
  }

  const contentMap = new Map();

  const mergeItem = (item) => {
    if (isParticle(item.type)) {
      return;
    }
    const contentKey = contentKeyFor(item);

    if (contentMap.has(contentKey)) {
      const existingItem = contentMap.get(contentKey);
      const mergedTags = [...new Set([...existingItem.tags, ...item.tags])].sort();
      contentMap.set(contentKey, { ...existingItem, tags: mergedTags });
    } else {
      let id;
      if (contentToExistingId.has(contentKey)) {
        id = contentToExistingId.get(contentKey);
      } else {
        const parts = item.id.split('_');
        const prefix = parts.slice(0, -1).join('_');
        const next = (maxSuffixByPrefix.get(prefix) ?? -1) + 1;
        maxSuffixByPrefix.set(prefix, next);
        id = `${prefix}_${next}`;
      }
      contentMap.set(contentKey, { ...item, id });
    }
  };

  existing.vocabulary.forEach(mergeItem);
  extracted.vocabulary.forEach(mergeItem);

  const extractedKeys = new Set(extracted.vocabulary.map(contentKeyFor));
  const allCategories = new Set([...existing.categories, ...extracted.categories]);

  const mergedVocabulary = Array.from(contentMap.values())
    .filter(item => item.tags.length === 0 || extractedKeys.has(contentKeyFor(item)))
    .sort((a, b) => compareIds(a.id, b.id));

  return {
    vocabulary: mergedVocabulary,
    categories: Array.from(allCategories).sort(),
    sortOptions: existing.sortOptions.length > 0 ? existing.sortOptions : extracted.sortOptions,
  };
}

/** Parse command line arguments. */
function parseArgs() {
  const args = process.argv.slice(2);
  return {
    force: args.includes('--force') || args.includes('-f'),
    help: args.includes('--help') || args.includes('-h'),
  };
}

function showHelp() {
  console.log(`
Usage: npm run extract-vocabulary [-- options]

Options:
  -f, --force    Force recreate vocabulary from scratch (ignore existing entries)
  -h, --help     Show this help message

Examples:
  npm run extract-vocabulary            # Merge with existing vocabulary
  npm run extract-vocabulary:force      # Recreate vocabulary from scratch
`);
}

/** Extract and merge vocabulary, then refresh the generated data files. */
function main(options: { force?: boolean } = {}) {
  const { force = false } = options;

  if (force) {
    console.log('🔄 Force mode: Recreating vocabulary from scratch...');
  }
  console.log('🔍 Scanning lesson files for vocabulary...');

  const existing = force ? emptyVocabulary() : loadExistingVocabulary();
  const extracted = scanAllLessons();
  const merged = mergeVocabulary(existing, extracted);

  const totalItems = merged.vocabulary.length;

  if (force) {
    console.log(`📚 Extracted ${totalItems} vocabulary items`);
  } else {
    const existingIds = new Set(existing.vocabulary.map(i => i.id));
    const mergedIds = new Set(merged.vocabulary.map(i => i.id));
    const addedCount = merged.vocabulary.filter(i => !existingIds.has(i.id)).length;
    const removedCount = existing.vocabulary.filter(i => !mergedIds.has(i.id)).length;
    if (addedCount) console.log(`📚 Found ${addedCount} new vocabulary items`);
    if (removedCount) console.log(`🗑️  Removed ${removedCount} vocabulary items from deleted lesson files`);
    if (!addedCount && !removedCount) console.log('📚 No vocabulary changes found');
  }
  console.log(`📖 Total vocabulary items: ${totalItems}`);

  const dumpOptions = { indent: 2, lineWidth: -1, noRefs: true, forceQuotes: true, quotingType: "'" as const };
  const existingContent = force ? '' : yaml.dump(existing, dumpOptions);
  const newContent = yaml.dump(merged, dumpOptions);

  if (force || existingContent !== newContent) {
    fs.writeFileSync(VOCABULARY_FILE, newContent);
    console.log(force ? '✅ Vocabulary file recreated successfully!' : '✅ Vocabulary file updated successfully!');
  } else {
    console.log('✅ Vocabulary file is up to date (no changes needed)');
  }

  updateN5VocabularyData();
  updateLessonPaths();
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const args = parseArgs();
  if (args.help) {
    showHelp();
    process.exit(0);
  }
  main({ force: args.force });
}

export {
  DEFAULT_SORT_OPTIONS,
  VALID_TYPES,
  extractVocabularyFromFile,
  extractN5VocabularyTokens,
  buildLessonPaths,
  scanAllLessons,
  mergeVocabulary,
  parseArgs,
  main,
};
