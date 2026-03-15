# Lesson Templates

Use these templates when adding a new lesson article.

## Templates

| File | Use for |
|------|---------|
| `grammar-template.md` | Grammar patterns (particles, expressions, sentence structures) |
| `vocabulary-template.md` | Themed vocabulary lists |
| `conjugation-template.md` | Verb conjugation forms (te-form, ta-form, etc.) |

---

## Checklist: Adding a New Article

### 1. Create the file

- Copy the relevant template into the appropriate folder:
  - Grammar → `docs/lessons/grammar/`
  - Vocabulary → `docs/lessons/vocabulary/`
  - Conjugation → `docs/lessons/conjugation/`
- Set the frontmatter `sidebar_position` to the next available number in that section.

### 2. Add it to the section index

- Open the `index.mdx` for the section (e.g. `docs/lessons/grammar/index.mdx`).
- Add a new entry to the `<LessonList items={[...]} />` array with `title`, `description`, and `to`.

### 3. Link to and from related articles

- In the new article's `<NextSteps>` (grammar/conjugation) or `:::tip Common Phrases` (vocabulary), link to 1–2 related articles.
- In any related existing articles that mention this topic, add a link back (e.g. a `:::info` callout or a `NextSteps` entry).

### 4. Update the e2e test data

Open `tests/e2e/helpers/lessonData.ts` and add an entry for the new lesson in the appropriate array:

- **Grammar** → add to `GRAMMAR_LESSONS`
- **Vocabulary** → add to `VOCABULARY_LESSONS` (and `VOCABULARY_SECTIONS` if it's a category with sub-pages)
- **Conjugation** → add to `CONJUGATION_LESSONS`

Each entry follows this shape:

```ts
{ name: 'My Lesson', path: 'my-lesson', heading: /my lesson/i }
```

- `name` — display name used in the test description
- `path` — the URL slug (must match the `to` value you added in the index)
- `heading` — regex matching the `<h1>` on the lesson page
- `partial?: true` — add this only for category index pages where the href contains the path rather than ending with it

### 5. Run the e2e tests

```bash
npm run test:e2e
```

Playwright starts the site automatically — no separate `npm start` needed.

---

## Writing Conventions

### Examples format

All lesson examples follow this format (em-dash, period, indented romaji):

```md
- Japanese sentence — English translation.
  - *romaji*
```

### Callout types

Use callouts consistently:

| Callout | Use for |
|---------|---------|
| `:::tip` | Memory tricks, cultural advice, polite-form equivalents |
| `:::caution` | Exceptions to a rule (e.g. ある → ない in ない-form), irregular forms in Group 3 |
| `:::warning` | Irregular verbs within Group 1 (e.g. 行く → いって, not いいて); common confusion between similar words or patterns |
| `:::info` | Links to related articles (second use of a particle, related grammar) |

### Vocabulary tables

Standard columns: **Hiragana | Kanji | Romaji | English | Type**

Add a **Usage** column when register differences apply (e.g. humble/honorific forms for family vocabulary). See `vocabulary/family.md` for a canonical example.

Emoji rules:
- Nouns and adjectives: include an emoji in the English column (e.g. `👨 father`)
- Verbs: **no emoji** in the English column

Keep tables to ≤10 rows. Split into subsections if more words are needed.

Never mix grammatically different types (nouns, adjectives, verbs) in one table.

### Grammar lessons

- Start with a **Key Expressions** table (Hiragana | Romaji | English | Type) — always the first content section.
- End with `<NextSteps items={[...]} />`.
- Exceptions (`:::caution`) and confusion warnings (`:::warning`) go **inline within each Pattern section**, immediately after the relevant formation block — do NOT collect them into a trailing section.
- Grammar lessons use `.md` extension unless they import JSX components — use `.mdx` in that case.

### Conjugation lessons

- Always open with `:::tip Polite Form Equivalent`.
- Group 1 (Godan): table by ending + `:::warning` for irregular verbs (行く, etc.).
- Group 3: always list する and くる explicitly; add `:::caution` for ある if it has an irregular form.
- End "in Context" section with `:::info Common [Form] Patterns`.

### File format

Use `.md` for plain markdown. Use `.mdx` when the file imports JSX components (e.g. `NextSteps`, `LessonList`). See [components/](../components/) for all available components.
