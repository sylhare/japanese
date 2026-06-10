# Vocabulary System Guide

Complete guide for the vocabulary extraction, tag system, and dictionary page.

## Quick Start

### For Content Creators

1. **Add vocabulary to lesson files** using this format:
    ```markdown
    ## Any Section Name
    
    | Hiragana | Kanji | Romaji | English | Type         |
    |----------|-------|--------|---------|--------------|
    | あまい    | 甘い   | amai   | sweet   | い-adjective |
    ```
2. **Run extraction**: `npm run extract-vocabulary`
3. **Check results**: Visit `/dictionary` page

### Local development commands

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

| Option    | Short | Description                                                 |
|-----------|-------|-------------------------------------------------------------|
| `--force` | `-f`  | Recreate vocabulary from scratch, ignoring existing entries |
| `--help`  | `-h`  | Show help message                                           |

**When to use `--force`:**

- After major restructuring of lesson files
- To clean up orphaned or outdated entries
- When tag mappings have changed significantly
- To reset the vocabulary file to a clean state

## Table Format

### Required Structure

**Any section heading works!** The script finds tables with the correct column structure:

| Column   | Required    | Example     | Notes                                     |
|----------|-------------|-------------|-------------------------------------------|
| Hiragana | ✅ Yes       | あまい         | Cannot be empty                           |
| Kanji    | ⚠️ Optional | 甘い          | Use `-` if no kanji                       |
| Romaji   | ✅ Yes       | amai        | Cannot be empty                           |
| English  | ✅ Yes       | sweet       | Cannot be empty                           |
| Type     | ✅ Yes       | い-adjective | (Hidden on runtime) See valid types below |
            
Emoji rules:

- Nouns and adjectives: you may include an emoji in the English column (e.g. `👨 father`), they will be filtered off on extraction.
- Verbs: avoid emoji in the English column

Try to keep tables to ≤10 rows. Split into subsections if more words are needed.

### Valid Type Values

The valid values live in [`src/data/vocabulary-types.js`](../../src/data/vocabulary-types.ts) 
(the single source of truth, used by both the extraction and the dictionary):

- `noun` - Regular nouns
- `pronoun` - Pronouns (personal and demonstrative)
- `verb` - Verbs
- `い-adjective` - い-adjectives
- `な-adjective` - な-adjectives
- `adverb` - Adverbs
- `onomatopoeia` - Mimetic / sound words (e.g. さくさく)
- `counter` - Counters
- `conjunction` - Conjunctions
- `expression` - Grammar expressions

> Rows with a valid type of `particle` are silently skipped during extraction (not added to the dictionary).

## How It Works

The system automatically:

- **Scans** all lesson files in `docs/lessons/`, plus the JLPT reference articles configured in
  [`src/data/jlpt-levels.ts`](../../src/data/jlpt-levels.ts) (e.g. `docs/reference/n5-vocabulary.md`)
- **Extracts** vocabulary from tables with correct structure (the `English` column may also be named `Meaning`)
- **Updates** `src/data/vocabulary.yaml`
- **Merges tags** when the same word appears in multiple lessons
- **Prevents** duplicates by content (hiragana + romaji + meaning)
- **Assigns** categories based on file path
- **Generates** lesson-based tags for navigation

## Tag System

Tags are automatically generated from the lesson file name and enable navigation from the dictionary back to the source
lessons.

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

Each tag links from the dictionary back to its source lesson, and those links are derived automatically from the lesson
files on disk — there is no hand-maintained list to keep in sync. Extraction records where every lesson lives in [
`src/data/lesson-paths.json`](../../src/data/lesson-paths.json), and
the [dictionary page](../../src/pages/dictionary.tsx) resolves each tag through it (for example, the `listing-actions`
tag points at `docs/lessons/grammar/actions-and-events/listing-actions`). Anything unmatched falls back to the
vocabulary folder.

Each JLPT level from [`src/data/jlpt-levels.ts`](../../src/data/jlpt-levels.ts) maps its tag to its reference article
(e.g. the `n5` tag → [`docs/reference/n5-vocabulary.md`](../../docs/reference/n5-vocabulary.md)); adding an `N4` level
links its `n4` tag automatically. If two lesson files share a basename they collide on the same tag, so basenames must
stay unique across folders.

The [e2e helpers](../../tests/e2e/helpers/lessonData.ts) resolve lesson URLs through the same manifest, and
a [consistency test](../../tests/scripts/lesson-paths.test.ts) keeps the two from drifting apart.

### Adding a New Lesson

Nothing extra to wire up — add a lesson file under `docs/lessons/` and run `npm run extract-vocabulary`. The manifest
regenerates, so the new tag links automatically.

Run `npm test` afterward: the suite verifies that every tag in [`vocabulary.yaml`](../../src/data/vocabulary.yaml)
resolves to a real lesson page.

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
    label: Hiragana (あ→ん)
  - value: romaji
    label: Romaji (A-Z)
  - value: meaning
    label: Meaning (A-Z)
  - value: category
    label: Category (A-Z)
```

### Vocabulary Item Fields

| Field      | Description               | Example               |
|------------|---------------------------|-----------------------|
| `id`       | Unique identifier         | `colors_2`            |
| `hiragana` | Hiragana reading          | `あか`                  |
| `kanji`    | Kanji characters          | `赤`                   |
| `romaji`   | Romanized pronunciation   | `aka`                 |
| `meaning`  | English meaning           | `red`                 |
| `category` | Content category          | `vocabulary`          |
| `tags`     | Lesson-based tags (array) | `['colors', 'basic']` |
| `type`     | Word type                 | `い-adjective`         |

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

- Check table has at least the mandatory columns (Hiragana, Romaji, English). Kanji, Type, and extra columns like Usage
  are optional.
- Verify file is in `docs/lessons/` directory
- Run `npm run extract-vocabulary` manually
- Check console output for errors

**Tags not merging?**

- Ensure the word has identical: hiragana + romaji + meaning
- Run extraction again: `npm run extract-vocabulary`
- Check the YAML file for the merged tags

**Tag links to wrong page?**

- Lesson links come from [`src/data/lesson-paths.json`](../../src/data/lesson-paths.json), regenerated on every run —
  re-run `npm run extract-vocabulary` after adding or moving a lesson.
- Make sure the lesson's filename is unique across folders; lessons that share a basename collide on the same tag.

**Duplicate entries?**

- System prevents duplicates by content (hiragana + romaji + meaning)
- If duplicates exist, they will be merged on next extraction

**Wrong category?**

- Categories are based on the immediate parent directory name:
    - `vocabulary/colors.md` → category: `vocabulary`
    - `vocabulary/food/tastes.md` → category: `food`
    - `vocabulary/time/clock.md` → category: `time`
    - `grammar/*.md` → category: `grammar`
    - `conjugation/*.md` → category: `lessons`

**Wrong subcategory for vocabulary?**

- Vocabulary items use the immediate parent folder as category, not always `vocabulary`
- Move the file to a different subdirectory if the category is wrong
- Or restructure the folder hierarchy to match the desired categories

## Data Flow

The script (`scripts/extract-vocabulary.js`) produces two output files each run:

```
Lesson Files → Extraction Script → vocabulary.yaml → Dictionary Page
     ↓              ↓                    ↓              ↓
  Markdown      Node.js Script      YAML Database    React Page
  Tables        Parses Tables       Stores Data      Displays Data
                Merges Tags         Merged Tags      Clickable Tags
```

**`src/data/vocabulary.yaml`** — main vocabulary database consumed by the Dictionary page (`/dictionary`) and the
Vocabulary page (`/vocabulary`). Contains all extracted entries with merged tags, categories, and sort options.

**`src/data/jlpt-vocabulary.json`** — normalized tokens (hiragana, kanji, romaji) per JLPT level, keyed by level tag
(e.g. `{ "N5": [...] }`), extracted from the reference articles in [`jlpt-levels.ts`](../../src/data/jlpt-levels.ts).
The dictionary loads this file and badges each entry with every level whose token set it matches, so adding an `N4`
level needs no dictionary change. Updated in the same run as `vocabulary.yaml`.

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
