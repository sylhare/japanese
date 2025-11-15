#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const DEFAULT_LESSONS_DIR = path.join(__dirname, '../docs/lessons');
const VOCABULARY_FILE = path.join(__dirname, '../src/data/vocabulary.yaml');
const VOCAB_TABLE_PATTERN = /## [^#\n]+[\s\S]*?(\|.*?Hiragana.*?\|[\s\S]*?)(?=\n##|\n## Next Steps|\n## Tips|\n## Remember|$)/gi;

/**
 * Extract vocabulary from a single lesson file.
 * @param {string} filePath - Path to the lesson file
 * @returns {Array<Object>} Array of vocabulary items
 */
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

/**
 * Check if a table content has the expected vocabulary structure.
 * Must have Hiragana, Romaji, English, and Type columns.
 * Columns can have emoji prefixes or be in any position.
 * @param {string} tableContent - The table content to check
 * @returns {boolean} True if it's a vocabulary table
 */
function isVocabularyTable(tableContent) {
  const lines = tableContent.trim().split('\n');
  if (lines.length === 0) {
    return false;
  }

  const headerRow = lines[0];
  const hasHiragana = /Hiragana/i.test(headerRow);
  const hasRomaji = /Romaji/i.test(headerRow);
  const hasEnglish = /English/i.test(headerRow);

  return hasHiragana && hasRomaji && hasEnglish;
}

/**
 * Parse a table row into an array of cells.
 * @param {string} row - The row string
 * @returns {Array<string>} Array of cell contents
 */
function parseRow(row) {
  const cells = row.replace(/^\||\|$/g, '').split('|').map(cell => cell.trim());
  return cells;
}

/**
 * Check if a vocabulary item is a particle and should be filtered out.
 * @param {string} type - The type field of the vocabulary item
 * @returns {boolean} True if it's a particle that should be filtered out
 */
function isParticle(type) {
  return type && type.toLowerCase().includes('particle');
}

/**
 * Strip emoji characters from a string.
 * Uses a whitelist approach: keep only letters (including accented), numbers, spaces, and common punctuation.
 * Also removes leading numbers with optional spaces (e.g., "8 August" becomes "August").
 * @param {string} text - The text to strip emojis from
 * @returns {string} The text with emojis removed
 */
function stripEmojis(text) {
  if (!text) return text;
  // Whitelist approach: keep only:
  // - Letters (including Unicode letters for accents: à, é, ñ, etc.) - \p{L}
  // - Numbers (0-9) - \p{N}
  // - Spaces - \s
  // - Common punctuation: . , - ' ( ) : ; / &
  // Note: This removes emoji styling characters but keeps base characters (e.g., "8️⃣" -> "8")
  // because the base digit "8" (U+0038) matches \p{N} and is kept as a valid number
  text = text.replace(/[^\p{L}\p{N}\s.,'():;/&-]/gu, '').trim();

  // Remove leading numbers followed by optional spaces (e.g., "8 August" -> "August")
  // This is needed because keycap emojis like "8️⃣" have a digit base character that survives
  // the whitelist filter (the emoji styling is removed, but the digit remains)
  text = text.replace(/^\p{N}+(\s+)?/u, '');
  return text.trim();
}

/**
 * Find the index of a column by name (case-insensitive, allows for emoji prefixes).
 * @param {Array<string>} headerCells - The header row cells
 * @param {string} columnName - The column name to find
 * @returns {number} The column index, or -1 if not found
 */
function findColumnIndex(headerCells, columnName) {
  return headerCells.findIndex(cell => {
    const normalized = cell.toLowerCase();
    const cleaned = normalized.replace(/^\s*\||\|\s*$/, '').trim();
    return cleaned.includes(columnName.toLowerCase());
  });
}

/**
 * Extract vocabulary from table content, filtering out particles.
 * @param {string} tableContent - The table content to extract from
 * @param {string} filePath - The file path for generating unique IDs
 * @param {number} startIndex - The starting index for ID generation (to ensure uniqueness across tables)
 * @returns {Array<Object>} Array of vocabulary items
 */
function extractFromTable(tableContent, filePath, startIndex = 0) {
  const vocabulary = [];
  const rows = tableContent.trim().split('\n');

  if (rows.length < 2) {
    return vocabulary;
  }

  const headerRow = rows[0];
  const headerCells = parseRow(headerRow);

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

    const hiragana = hiraganaIdx >= 0 && hiraganaIdx < cells.length ? cells[hiraganaIdx].trim() : '';
    const kanji = kanjiIdx >= 0 && kanjiIdx < cells.length ? cells[kanjiIdx].trim() : '';
    const romaji = romajiIdx >= 0 && romajiIdx < cells.length ? cells[romajiIdx].trim() : '';
    const englishRaw = englishIdx >= 0 && englishIdx < cells.length ? cells[englishIdx].trim() : '';
    const english = stripEmojis(englishRaw);
    const type = typeIdx >= 0 && typeIdx < cells.length ? cells[typeIdx].trim() : '';

    if (!hiragana || !romaji || !english || hiragana.includes('---') || hiragana.match(/Hiragana|Kanji|Romaji|English/i)) {
      continue;
    }

    if (isParticle(type)) {
      continue;
    }

    if (hiragana.match(/^[\p{Emoji}\s]+$/u)) {
      continue;
    }

    const fileId = path.basename(filePath, '.md').replace(/[^a-zA-Z0-9]/g, '');
    const id = `${fileId}_${itemIndex}`;

    let category = 'general';
    if (filePath.includes('/vocabulary/')) {
      const folderName = path.basename(path.dirname(filePath));
      category = folderName;
    } else if (filePath.includes('/grammar/')) {
      category = 'grammar';
    } else if (filePath.includes('/lessons/')) {
      category = 'lessons';
    }

    const tags = [];
    const lessonName = path.basename(filePath, '.md');
    tags.push(lessonName);

    vocabulary.push({
      id,
      hiragana: hiragana || '',
      kanji: kanji && kanji !== '-' ? kanji : undefined,
      romaji: romaji || '',
      meaning: english || '',
      category,
      tags,
      type: type || 'unknown',
    });

    itemIndex++;
  }

  return vocabulary;
}

/**
 * Scan all lesson files for vocabulary.
 * @returns {Object} Vocabulary data with categories and sort options
 */
function scanAllLessons() {
  const vocabulary = [];
  const categories = new Set(['all']);
  const sortOptions = [
    { value: 'hiragana', label: 'Hiragana (A-Z)' },
    { value: 'romaji', label: 'Romaji (A-Z)' },
    { value: 'meaning', label: 'Meaning (A-Z)' },
    { value: 'category', label: 'Category' },
  ];

  function scanDirectory(dir) {
    const files = fs.readdirSync(dir).sort();

    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);

      if (stat.isDirectory()) {
        scanDirectory(filePath);
      } else if (file.endsWith('.md')) {
        const lessonVocabulary = extractVocabularyFromFile(filePath);
        vocabulary.push(...lessonVocabulary);

        lessonVocabulary.forEach(item => {
          categories.add(item.category);
        });
      }
    }
  }

  scanDirectory(process.env.TEST_LESSONS_DIR || DEFAULT_LESSONS_DIR);

  vocabulary.sort((a, b) => {
    const fileCompare = a.tags[0].localeCompare(b.tags[0]);
    if (fileCompare !== 0) {
      return fileCompare;
    }
    return a.id.localeCompare(b.id);
  });

  return {
    vocabulary,
    categories: Array.from(categories).sort(),
    sortOptions,
  };
}

/**
 * Load existing vocabulary to preserve manually added items.
 * @returns {Object} Vocabulary data
 */
function loadExistingVocabulary() {
  if (!fs.existsSync(VOCABULARY_FILE)) {
    return { vocabulary: [], categories: ['all'], sortOptions: [] };
  }

  try {
    const content = fs.readFileSync(VOCABULARY_FILE, 'utf8');
    return yaml.load(content);
  } catch (error) {
    console.error('Error loading existing vocabulary:', error);
    return { vocabulary: [], categories: ['all'], sortOptions: [] };
  }
}

/**
 * Compare two IDs with natural sorting (handles numeric suffixes correctly).
 * Example: "tastes_5" < "tastes_12" (not "tastes_12" < "tastes_5").
 * @param {string} idA - First ID to compare
 * @param {string} idB - Second ID to compare
 * @returns {number} Negative if idA < idB, positive if idA > idB, 0 if equal
 */
function compareIds(idA, idB) {
  const partsA = idA.split('_');
  const partsB = idB.split('_');

  const prefixA = partsA.slice(0, -1).join('_');
  const prefixB = partsB.slice(0, -1).join('_');
  const prefixCompare = prefixA.localeCompare(prefixB);
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

/**
 * Regenerate IDs to ensure they are unique and incremental per file prefix.
 * @param {Array<Object>} vocabulary - Array of vocabulary items
 * @returns {Array<Object>} Vocabulary items with regenerated IDs (new objects)
 */
function regenerateIds(vocabulary) {
  const byPrefix = new Map();

  vocabulary.forEach(item => {
    const parts = item.id.split('_');
    const prefix = parts.slice(0, -1).join('_');

    if (!byPrefix.has(prefix)) {
      byPrefix.set(prefix, []);
    }
    byPrefix.get(prefix).push(item);
  });

  const result = [];

  byPrefix.forEach((items, prefix) => {
    items.sort((a, b) => compareIds(a.id, b.id));

    items.forEach((item, index) => {
      result.push({
        ...item,
        id: `${prefix}_${index}`,
      });
    });
  });

  return result;
}

/**
 * Merge extracted vocabulary with existing vocabulary, filtering out particles.
 * This function is idempotent - running it multiple times produces the same result.
 * @param {Object} existing - Existing vocabulary data
 * @param {Object} extracted - Newly extracted vocabulary data
 * @returns {Object} Merged vocabulary data
 */
function mergeVocabulary(existing, extracted) {
  const existingMap = new Map();
  const extractedMap = new Map();

  existing.vocabulary.forEach(item => {
    existingMap.set(item.id, item);
  });

  extracted.vocabulary.forEach(item => {
    extractedMap.set(item.id, item);
  });

  const contentMap = new Map();

  existing.vocabulary.forEach(item => {
    if (isParticle(item.type)) {
      return;
    }
    const contentKey = `${item.hiragana}-${item.romaji}-${item.meaning}`.toLowerCase();
    contentMap.set(contentKey, item);
  });

  extracted.vocabulary.forEach(item => {
    if (isParticle(item.type)) {
      return;
    }
    const contentKey = `${item.hiragana}-${item.romaji}-${item.meaning}`.toLowerCase();
    if (!contentMap.has(contentKey)) {
      contentMap.set(contentKey, item);
    }
  });

  const allCategories = new Set([...existing.categories, ...extracted.categories]);

  const mergedVocabulary = Array.from(contentMap.values()).sort((a, b) => {
    return compareIds(a.id, b.id);
  });

  const vocabularyWithRegeneratedIds = regenerateIds(mergedVocabulary);

  return {
    vocabulary: vocabularyWithRegeneratedIds,
    categories: Array.from(allCategories).sort(),
    sortOptions: existing.sortOptions.length > 0 ? existing.sortOptions : extracted.sortOptions,
  };
}

/**
 * Main execution function to extract and merge vocabulary.
 */
function main() {
  console.log('🔍 Scanning lesson files for vocabulary...');

  const existing = loadExistingVocabulary();
  const extracted = scanAllLessons();
  const merged = mergeVocabulary(existing, extracted);

  const newItems = merged.vocabulary.length - existing.vocabulary.length;
  const totalItems = merged.vocabulary.length;

  if (newItems > 0) {
    console.log(`📚 Found ${newItems} new vocabulary items`);
  } else {
    console.log('📚 No new vocabulary items found (idempotent)');
  }
  console.log(`📖 Total vocabulary items: ${totalItems}`);

  const existingContent = yaml.dump(existing, { indent: 2, lineWidth: -1, noRefs: true });
  const newContent = yaml.dump(merged, { indent: 2, lineWidth: -1, noRefs: true });

  if (existingContent !== newContent) {
    fs.writeFileSync(VOCABULARY_FILE, newContent);
    console.log('✅ Vocabulary file updated successfully!');
  } else {
    console.log('✅ Vocabulary file is up to date (no changes needed)');
  }
}

if (require.main === module) {
  main();
}

module.exports = { extractVocabularyFromFile, scanAllLessons, mergeVocabulary };
