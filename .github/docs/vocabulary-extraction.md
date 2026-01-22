# Vocabulary System Guide

Complete guide for the vocabulary extraction, tag system, and dictionary page.

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
3. **Check results**: Visit `/dictionary` page

### For Developers

```bash
# Manual extraction (merges with existing)
npm run extract-vocabulary

# Force recreate from scratch (ignores existing entries)
npm run extract-vocabulary:force
# or
npm run extract-vocabulary -- --force

# Show help
npm run extract-vocabulary -- --help

# Build with automatic extraction
npm run build

# Start dev server with automatic extraction
npm start
```

### Command Line Options

| Option | Short | Description |
|--------|-------|-------------|
| `--force` | `-f` | Recreate vocabulary from scratch, ignoring existing entries |
| `--help` | `-h` | Show help message |

**When to use `--force`:**
- After major restructuring of lesson files
- To clean up orphaned or outdated entries
- When tag mappings have changed significantly
- To reset the vocabulary file to a clean state

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
- `particle` - Particles (note: particles are filtered out from dictionary)
- `conjunction` - Conjunctions
- `interjection` - Interjections
- `pronoun` - Pronouns
- `counter` - Counters
- `expression` - Grammar expressions

## How It Works

The system automatically:

- **Scans** all lesson files in `docs/lessons/`
- **Extracts** vocabulary from tables with correct structure
- **Updates** `src/data/vocabulary.yaml`
- **Merges tags** when the same word appears in multiple lessons
- **Prevents** duplicates by content (hiragana + romaji + meaning)
- **Assigns** categories based on file path
- **Generates** lesson-based tags for navigation

## Tag System

Tags are automatically generated from the lesson file name and enable navigation from the dictionary back to the source lessons.

### How Tags Work

1. **Automatic Generation**: When vocabulary is extracted, the lesson filename becomes a tag
   - `docs/lessons/vocabulary/colors.md` → tag: `colors`
   - `docs/lessons/grammar/advice.md` → tag: `advice`
   - `docs/lessons/conjugation/future.md` → tag: `future`

2. **Tag Merging**: When the same word appears in multiple lessons, all tags are merged
   - Example: "tomorrow" (あした) appears in both `days-and-weeks.md` and `future.md`
   - Result: tags: `['days-and-weeks', 'future', 'time']`

3. **Clickable Navigation**: Each tag in the dictionary links to its source lesson

### Tag Path Resolution

The dictionary page (`src/pages/dictionary.tsx`) maps tags to their correct lesson paths:

| Tag Type | Example Tags | Path Pattern |
|----------|-------------|--------------|
| Grammar | `advice`, `comparison`, `desire` | `/docs/lessons/grammar/{tag}` |
| Conjugation | `future`, `ta-form`, `te-nai-form` | `/docs/lessons/conjugation/{tag}` |
| Vocabulary | `colors`, `family`, `tastes` | `/docs/lessons/vocabulary/{tag}` |
| Special | `time`, `numbers`, `days-and-weeks` | Custom mappings (see below) |

### Special Tag Mappings

Some tags have custom path mappings defined in `getTagPath()`:

```typescript
const tagMappings: Record<string, string> = {
  'numbers': 'vocabulary/numbers',
  'counting': 'vocabulary/numbers',
  'counters': 'vocabulary/numbers',
  'dates': 'vocabulary/time',
  'calendar': 'vocabulary/time',
  'time': 'vocabulary/time',
  'days-and-weeks': 'vocabulary/time/days-and-weeks',
};
```

### Adding New Tag Mappings

When creating new lesson categories, update `src/pages/dictionary.tsx`:

1. **Grammar lessons**: Add tag to `grammarTags` array
2. **Conjugation lessons**: Add tag to `conjugationTags` array
3. **Special paths**: Add to `tagMappings` object

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
  - id: daysandweeks_5
    hiragana: あした
    kanji: 明日
    romaji: ashita
    meaning: tomorrow
    category: vocabulary
    tags:
      - days-and-weeks
      - future
      - time
    type: noun
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
| `tags`     | ✅ Yes       | Lesson-based tags (array) | `['colors', 'basic']` |
| `type`     | ✅ Yes       | Word type               | `い-adjective` |

### Automatic ID Generation

IDs are generated as `{lesson}_{row_number}`:

- `colors_2` - From colors lesson, row 2
- `tastes_5` - From tastes lesson, row 5
- `grammarparticles_3` - From grammar-particles lesson, row 3

## Dictionary Page Features

The dictionary page (`/dictionary`) provides:

### Search
- Search by hiragana, katakana, kanji, romaji, or English meaning
- Search by tag name
- Real-time filtering as you type

### Filters
- **Category filter**: Filter by content category (all, vocabulary, grammar, etc.)
- **Sort options**: Sort by hiragana, romaji, meaning, or category
- **Hiragana only**: Show only items with hiragana
- **Katakana only**: Show only items with katakana

### Vocabulary Cards
Each card displays:
- **Japanese**: Kanji (if available), hiragana, and romaji
- **Meaning**: English translation
- **Type badge**: Word type (noun, verb, adjective, etc.)
- **Tags**: Clickable links to source lessons

### Tag Navigation
- Click any tag to navigate to the source lesson
- Words appearing in multiple lessons show all related tags
- Tags are color-coded and sorted alphabetically

## Manual YAML Editing

### When to Edit YAML Directly

You can manually edit `src/data/vocabulary.yaml` for:

- **Quick fixes** to existing vocabulary
- **Bulk changes** to multiple items
- **Adding vocabulary** not from lesson files
- **Correcting** extraction errors

### Important Notes

⚠️ **Manual edits will be preserved** - The extraction script merges new vocabulary with existing entries.

**Best practices:**

1. **Edit lesson files** instead of YAML when possible
2. **Run extraction** after adding new lesson content
3. **Test changes** on the dictionary page
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

- Check table has exactly 5 columns (Hiragana, Kanji, Romaji, English, Type)
- Verify file is in `docs/lessons/` directory
- Run `npm run extract-vocabulary` manually
- Check console output for errors

**Tags not merging?**

- Ensure the word has identical: hiragana + romaji + meaning
- Run extraction again: `npm run extract-vocabulary`
- Check the YAML file for the merged tags

**Tag links to wrong page?**

- Check `getTagPath()` in `src/pages/dictionary.tsx`
- Add tag to appropriate array (grammarTags, conjugationTags)
- Or add custom mapping to `tagMappings` object

**Duplicate entries?**

- System prevents duplicates by content (hiragana + romaji + meaning)
- If duplicates exist, they will be merged on next extraction

**Wrong category?**

- Categories are based on file path:
  - `vocabulary/*.md` → category: `vocabulary`
  - `grammar/*.md` → category: `grammar`
  - `conjugation/*.md` → category: `lessons`

## Data Flow

```
Lesson Files → Extraction Script → vocabulary.yaml → Dictionary Page
     ↓              ↓                    ↓              ↓
  Markdown      Node.js Script      YAML Database    React Page
  Tables        Parses Tables       Stores Data      Displays Data
                Merges Tags         Merged Tags      Clickable Tags
```

## Testing

E2E tests verify the vocabulary system works correctly:

```bash
# Run dictionary tests
npx playwright test dictionary.spec.ts

# Run all e2e tests
npm run test:e2e
```

## Real-time Updates

The dictionary page automatically reflects changes when:

1. **Lesson files** are updated with new vocabulary tables
2. **Extraction script** is run (`npm run extract-vocabulary`)
3. **YAML file** is updated with new vocabulary data
4. **Development server** is restarted (`npm start`)
