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
