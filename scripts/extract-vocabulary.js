#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

// Configuration
const LESSONS_DIR = path.join(__dirname, '../docs/lessons');
const VOCABULARY_FILE = path.join(__dirname, '../src/data/vocabulary.yaml');

// Generic regex patterns for finding vocabulary tables
const ROW_REGEX = /^\|(.+?)\|(.+?)\|(.+?)\|(.+?)\|(.+?)\|$/gm;

// Generic pattern to find any table with vocabulary structure
// Looks for tables with Hiragana, Kanji, Romaji, English, Type columns
const VOCAB_TABLE_PATTERN = /## [^#\n]+[\s\S]*?(\|.*?Hiragana.*?\|[\s\S]*?)(?=\n##|\n## Next Steps|\n## Tips|\n## Remember|$)/gi;

// Extract vocabulary from a single lesson file
function extractVocabularyFromFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const vocabulary = [];
  
  // Find all tables that look like vocabulary tables
  let match;
  while ((match = VOCAB_TABLE_PATTERN.exec(content)) !== null) {
    const tableContent = match[1];
    
    // Check if this table has the expected vocabulary structure
    if (isVocabularyTable(tableContent)) {
      const extracted = extractFromTable(tableContent, filePath);
      vocabulary.push(...extracted);
    }
  }
  
  return vocabulary;
}

// Check if a table content looks like a vocabulary table
function isVocabularyTable(tableContent) {
  // Look for the expected header structure with flexible column names
  // Must have Hiragana, Romaji, English, and Type columns (Kanji is optional)
  const hasHiragana = /Hiragana/i.test(tableContent);
  const hasRomaji = /Romaji/i.test(tableContent);
  const hasEnglish = /English/i.test(tableContent);
  const hasType = /Type/i.test(tableContent);
  
  return hasHiragana && hasRomaji && hasEnglish && hasType;
}

// Extract vocabulary from a table content
function extractFromTable(tableContent, filePath) {
  const vocabulary = [];
  let rowMatch;
  let rowIndex = 0;
  
  while ((rowMatch = ROW_REGEX.exec(tableContent)) !== null) {
    // Skip header row
    if (rowIndex === 0) {
      rowIndex++;
      continue;
    }
    
    const [, hiragana, kanji, romaji, english, type] = rowMatch.map(cell => cell.trim());
    
    // Skip empty rows or rows that don't look like vocabulary
    if (!hiragana || !romaji || !english || hiragana.includes('---') || hiragana.includes('Hiragana')) {
      rowIndex++;
      continue;
    }
    
    // Generate unique ID based on file and row
    const fileId = path.basename(filePath, '.md').replace(/[^a-zA-Z0-9]/g, '');
    const id = `${fileId}_${rowIndex}`;
    
    // Determine category based on file path
    let category = 'general';
    if (filePath.includes('/vocabulary/')) {
      const folderName = path.basename(path.dirname(filePath));
      category = folderName;
    } else if (filePath.includes('/grammar/')) {
      category = 'grammar';
    } else if (filePath.includes('/lessons/')) {
      category = 'lessons';
    }
    
    // Determine tags based on lesson name and content
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

// Scan all lesson files for vocabulary
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
  
  scanDirectory(LESSONS_DIR);
  
  return {
    vocabulary,
    categories: Array.from(categories).sort(),
    sortOptions
  };
}

// Load existing vocabulary to preserve manually added items
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

// Merge extracted vocabulary with existing vocabulary (idempotent)
function mergeVocabulary(existing, extracted) {
  const existingMap = new Map();
  const extractedMap = new Map();
  
  // Create maps for both existing and extracted vocabulary
  existing.vocabulary.forEach(item => {
    existingMap.set(item.id, item);
  });
  
  extracted.vocabulary.forEach(item => {
    extractedMap.set(item.id, item);
  });
  
  // Create a map to track vocabulary by content (not just ID) to prevent duplicates
  const contentMap = new Map();
  
  // Add existing vocabulary first (preserve manually added items)
  existing.vocabulary.forEach(item => {
    const contentKey = `${item.hiragana}-${item.romaji}-${item.meaning}`.toLowerCase();
    contentMap.set(contentKey, item);
  });
  
  // Add extracted vocabulary only if it doesn't already exist by content
  extracted.vocabulary.forEach(item => {
    const contentKey = `${item.hiragana}-${item.romaji}-${item.meaning}`.toLowerCase();
    if (!contentMap.has(contentKey)) {
      contentMap.set(contentKey, item);
    }
  });
  
  // Merge categories
  const allCategories = new Set([...existing.categories, ...extracted.categories]);
  
  return {
    vocabulary: Array.from(contentMap.values()),
    categories: Array.from(allCategories).sort(),
    sortOptions: existing.sortOptions.length > 0 ? existing.sortOptions : extracted.sortOptions
  };
}

// Main execution
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
  
  // Only write if there are changes
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
