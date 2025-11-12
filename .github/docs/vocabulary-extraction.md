# Vocabulary System Guide

Complete guide for the vocabulary extraction and management system.

## Quick Start

### For Content Creators

1. **Add vocabulary to lesson files** using this format:

```markdown
## Any Section Name

| Hiragana | Kanji | Romaji | English | Type |
|----------|-------|--------|---------|------|
| あまい | 甘い | amai | sweet | い-adjective |
```

2. **Run extraction**: `npm run extract-vocabulary`
3. **Check results**: Visit `/vocabulary` page

### For Developers

```bash
# Manual extraction
npm run extract-vocabulary

# Build with automatic extraction
npm run build

# Start dev server with automatic extraction
npm start
```

## Table Format

### Required Structure

**Any section heading works!** The script finds tables with the correct column structure:

| Column   | Required    | Example     | Notes                 |
|----------|-------------|-------------|-----------------------|
| Hiragana | ✅ Yes       | あまい         | Cannot be empty       |
| Kanji    | ⚠️ Optional | 甘い          | Use `-` if no kanji   |
| Romaji   | ✅ Yes       | amai        | Cannot be empty       |
| English  | ✅ Yes       | sweet       | Cannot be empty       |
| Type     | ✅ Yes       | い-adjective | See valid types below |

### Valid Type Values

- `い-adjective` - い-adjectives
- `の-adjective` - の-adjectives
- `noun` - Regular nouns
- `verb` - Verbs
- `adverb` - Adverbs
- `particle` - Particles
- `conjunction` - Conjunctions
- `interjection` - Interjections
- `pronoun` - Pronouns
- `counter` - Counters

## How It Works

The system automatically:

- **Scans** all lesson files in `docs/lessons/`
- **Extracts** vocabulary from tables with correct structure
- **Updates** `src/data/vocabulary.yaml`
- **Prevents** duplicates by content (hiragana + romaji + meaning)
- **Assigns** categories based on file path
- **Generates** lesson-based tags for navigation

## YAML File Structure

The vocabulary is stored in `src/data/vocabulary.yaml` with this structure:

```yaml
vocabulary:
  - id: colors_2
    hiragana: あか
    kanji: 赤
    romaji: aka
    meaning: red
    category: vocabulary
    tags:
      - colors
    type: い-adjective
  - id: grammarparticles_2
    hiragana: は
    romaji: wa
    meaning: topic marker
    category: vocabulary
    tags:
      - grammar-particles
    type: particle
categories:
  - all
  - vocabulary
sortOptions:
  - value: hiragana
    label: Hiragana (A-Z)
  - value: romaji
    label: Romaji (A-Z)
  - value: meaning
    label: Meaning (A-Z)
  - value: category
    label: Category
```

### Vocabulary Item Fields

| Field      | Required    | Description             | Example       |
|------------|-------------|-------------------------|---------------|
| `id`       | ✅ Yes       | Unique identifier       | `colors_2`    |
| `hiragana` | ✅ Yes       | Hiragana reading        | `あか`          |
| `kanji`    | ⚠️ Optional | Kanji characters        | `赤`           |
| `romaji`   | ✅ Yes       | Romanized pronunciation | `aka`         |
| `meaning`  | ✅ Yes       | English meaning         | `red`         |
| `category` | ✅ Yes       | Content category        | `vocabulary`  |
| `tags`     | ✅ Yes       | Lesson-based tags       | `['colors']`  |
| `type`     | ✅ Yes       | Word type               | `い-adjective` |

### Automatic ID Generation

IDs are generated as `{lesson}_{row_number}`:

- `colors_2` - From colors lesson, row 2
- `tastes_5` - From tastes lesson, row 5
- `grammarparticles_3` - From grammar-particles lesson, row 3

## Manual YAML Editing

### When to Edit YAML Directly

You can manually edit `src/data/vocabulary.yaml` for:

- **Quick fixes** to existing vocabulary
- **Bulk changes** to multiple items
- **Adding vocabulary** not from lesson files
- **Correcting** extraction errors

### Important Notes

⚠️ **Manual edits will be overwritten** when you run `npm run extract-vocabulary`!

**Best practices:**

1. **Edit lesson files** instead of YAML when possible
2. **Run extraction** after manual YAML changes
3. **Test changes** on the vocabulary page
4. **Backup** the YAML file before major edits

### Example Manual Addition

```yaml
vocabulary:
  - id: manual_1
    hiragana: テスト
    romaji: tesuto
    meaning: test
    category: vocabulary
    tags:
      - manual
    type: noun
```

## Troubleshooting

**Vocabulary not extracted?**

- Check table has exactly 5 columns
- Verify file is in `docs/lessons/` directory
- Run `npm run extract-vocabulary` manually

**Duplicate entries?**

- System prevents duplicates by content
- Check for identical hiragana + romaji + meaning

**Wrong category?**

- Categories based on file path
- `vocabulary/colors.md` → `colors` category

## Integration

### Vocabulary Page

Extracted vocabulary automatically appears on `/vocabulary` with:

- **Search functionality** - Search across all fields
- **Category filtering** - Filter by content categories
- **Sorting options** - Sort by hiragana, romaji, meaning, or category
- **Lesson references** - Clickable tags that link to lesson pages
- **Type badges** - Green badges showing word type (い-adjective, noun, etc.)

### Data Flow

```
Lesson Files → Extraction Script → vocabulary.yaml → Vocabulary Page
     ↓              ↓                    ↓              ↓
  Markdown      Node.js Script      YAML Database    React Page
  Tables        Parses Tables       Stores Data      Displays Data
```

### Real-time Updates

The vocabulary page automatically reflects changes when:

1. **Lesson files** are updated with new vocabulary tables
2. **Extraction script** is run (`npm run extract-vocabulary`)
3. **YAML file** is updated with new vocabulary data
4. **Development server** is restarted (`npm start`)
