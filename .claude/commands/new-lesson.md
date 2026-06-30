# Create a New Japanese Lesson

Ask the user these two questions before doing anything else:
1. What **type** of lesson? (grammar / vocabulary / conjugation)
2. What is the **topic**?

Then execute the following steps in order without pausing for confirmation.

## Step 1 — Read the template

Read the appropriate template from `.github/docs/templates/`:
- grammar → `grammar-template.md`
- vocabulary → `vocabulary-template.md`
- conjugation → `conjugation-template.md`

## Step 2 — Determine placement

- List existing files in `docs/lessons/{type}/` to find the highest `sidebar_position` number, then use the next one
- Derive the filename slug: lowercase, hyphens, `.md` extension (e.g. `body-parts.md`)

## Step 3 — Create the lesson file

Create `docs/lessons/{type}/{slug}.md` using the template structure.
- Fill in all frontmatter fields (`sidebar_position`, `title`, `description`, `tags`)
- Fill in content you can infer from the topic (table rows, examples, section titles)
- Leave remaining content as clearly-marked `<!-- TODO: ... -->` placeholders

## Step 4 — Update the section index

Read `docs/lessons/{type}/index.mdx` and add an entry to the `<LessonList items={[...]} />`:
```js
{
  title: 'Lesson Title',
  description: 'One-line description matching the frontmatter description',
  to: './{slug}',
},
```

## Step 5 — Update e2e test data

Read `tests/e2e/helpers/lessonData.ts` and add an entry to the correct array:
- grammar → `GRAMMAR_LESSONS`
- vocabulary → `VOCABULARY_LESSONS`
- conjugation → `CONJUGATION_LESSONS`

Entry shape:
```ts
{ name: 'Topic Name', path: '{slug}', heading: /topic name/i }
```

## Step 6 — Sync vocabulary (vocabulary lessons only)

If the lesson type is **vocabulary**, run:
```bash
npm run extract-vocabulary
```

## Step 7 — Verify

Run:
```bash
npm run typecheck
```

Fix any TypeScript errors before reporting done.

## Done

Tell the user:
- What files were created or modified
- Which `<!-- TODO -->` placeholders still need to be filled in
- Whether vocabulary was synced and the item count
