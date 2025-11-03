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
  
  let match;
  while ((match = VOCAB_TABLE_PATTERN.exec(content)) !== null) {
    const tableContent = match[1];
    
    if (isVocabularyTable(tableContent)) {
      const extracted = extractFromTable(tableContent, filePath);
      vocabulary.push(...extracted);
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
  const hasType = /Type/i.test(headerRow);
  const hasKanji = /Kanji/i.test(headerRow);
  
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
 * @param {string} text - The text to strip emojis from
 * @returns {string} The text with emojis removed
 */
function stripEmojis(text) {
  if (!text) return text;
  // Match emoji Unicode ranges including:
  // - Emoticons (😀-🙏) U+1F600-U+1F64F
  // - Symbols & Pictographs (🀀-🿿) U+1F300-U+1F5FF, U+1F900-U+1F9FF
  // - Miscellaneous Symbols (☀-⛿) U+2600-U+26FF
  // - Dingbats (✀-➿) U+2700-U+27BF
  // - Supplemental Symbols U+1F900-U+1F9FF, U+1FA00-U+1FAFF
  // - Zero Width Joiner (ZWJ) U+200D
  // - Variation Selector-16 U+FE0F
  // - Skin tone modifiers U+1F3FB-U+1F3FF
  // - Regional indicators U+1F1E6-U+1F1FF
  // - Keycaps U+0023-U+0039 U+FE0F U+20E3
  // - Number emoji U+0030-U+0039 U+FE0F U+20E3
  // - Arrows: ⬅️➡️ U+2B05-U+2B07
  return text.replace(/[\u{1F300}-\u{1F9FF}]|[\u{1F600}-\u{1F64F}]|[\u{1F680}-\u{1F6FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F900}-\u{1F9FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{200D}]|[\u{FE0F}]|[\u{1F3FB}-\u{1F3FF}]|[\u{1FA00}-\u{1FAFF}]|[\u{2B05}-\u{2B07}]|[\u{203C}]|[\u{2049}]|[\u{2122}]|[\u{2139}]|[\u{2194}-\u{2199}]|[\u{21A9}-\u{21AA}]|[\u{231A}-\u{231B}]|[\u{2328}]|[\u{23CF}]|[\u{23E9}-\u{23F3}]|[\u{23F8}-\u{23FA}]|[\u{24C2}]|[\u{25AA}-\u{25AB}]|[\u{25B6}]|[\u{25C0}]|[\u{25FB}-\u{25FE}]|[\u{2660}]|[\u{2663}]|[\u{2665}-\u{2666}]|[\u{2668}]|[\u{267B}]|[\u{267F}]|[\u{2692}-\u{2697}]|[\u{2699}]|[\u{269B}-\u{269C}]|[\u{26A0}-\u{26A1}]|[\u{26AA}-\u{26AB}]|[\u{26B0}-\u{26B1}]|[\u{26BD}-\u{26BE}]|[\u{26C4}-\u{26C5}]|[\u{26C8}]|[\u{26CE}-\u{26CF}]|[\u{26D1}]|[\u{26D3}-\u{26D4}]|[\u{26E9}-\u{26EA}]|[\u{26F0}-\u{26F5}]|[\u{26F7}-\u{26FA}]|[\u{26FD}]|[\u{2702}]|[\u{2705}]|[\u{2708}-\u{270D}]|[\u{270F}]|[\u{2712}]|[\u{2714}]|[\u{2716}]|[\u{271D}]|[\u{2721}]|[\u{2728}]|[\u{2733}-\u{2734}]|[\u{2744}]|[\u{2747}]|[\u{274C}]|[\u{274E}]|[\u{2753}-\u{2755}]|[\u{2757}]|[\u{2763}-\u{2764}]|[\u{2795}-\u{2797}]|[\u{27A1}]|[\u{27B0}]|[\u{27BF}]|[\u{2934}-\u{2935}]|[\u{2B1B}-\u{2B1C}]|[\u{2B50}]|[\u{2B55}]|[\u{3030}]|[\u{303D}]|[\u{3297}]|[\u{3299}]/gu, '').trim();
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
 * @returns {Array<Object>} Array of vocabulary items
 */
function extractFromTable(tableContent, filePath) {
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
  
  let rowIndex = 0;
  
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
      rowIndex++;
      continue;
    }
    
    if (isParticle(type)) {
      rowIndex++;
      continue;
    }
    
    if (hiragana.match(/^[\p{Emoji}\s]+$/u)) {
      rowIndex++;
      continue;
    }
    
    const fileId = path.basename(filePath, '.md').replace(/[^a-zA-Z0-9]/g, '');
    const id = `${fileId}_${rowIndex}`;
    
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
      type: type || 'unknown'
    });
    
    rowIndex++;
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
    { value: 'category', label: 'Category' }
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
    sortOptions
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
    if (a.category !== b.category) {
      return a.category.localeCompare(b.category);
    }
    if (a.hiragana !== b.hiragana) {
      return a.hiragana.localeCompare(b.hiragana);
    }
    if (a.romaji !== b.romaji) {
      return a.romaji.localeCompare(b.romaji);
    }
    return a.meaning.localeCompare(b.meaning);
  });

  return {
    vocabulary: mergedVocabulary,
    categories: Array.from(allCategories).sort(),
    sortOptions: existing.sortOptions.length > 0 ? existing.sortOptions : extracted.sortOptions
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
