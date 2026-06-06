# Content Contribution Documentation

This folder contains documentation for contributors working on the Japanese Lessons Docusaurus site.
For developer contribution information look into the [contributing guide](../CONTRIBUTING.md).

## Lesson style and formatting

### Docusaurus Markdown

Follow the [docusaurus](docusaurus.md) documentation for MDX formatting, frontmatter, and custom components. 
Use the provided [templates](./templates) when creating new lessons.

We also have custom [MDX components](../../src/components) for consistent styling across lessons (NextSteps, LessonList, ReferenceCard),
their documentation is co-located with each component

### Vocabulary

The vocabulary in table is extracted to be used in the dictionary pages. 
Follow the [vocabulary extraction guide](vocabulary-extraction.md) for how to format vocabulary tables and know more
about the extraction process.

### Romanization (Hepburn)

Use [**modified Hepburn**](https://en.wikipedia.org/wiki/Hepburn_romanization), applied consistently across every file.

| Japanese               | Romaji               | Not     | Note                                                                                                                                                                  |
|------------------------|----------------------|---------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| を (particle)           | **o** in sentences   |         | を is pronounced like お, so example sentences use `o` (`hon o yomimasu`). Write `wo` only when *naming* the particle itself (e.g. the particle guide's table/heading). |
| は (topic particle)     | **wa**               | ~~ha~~  | Only as a particle; the kana elsewhere stays `ha`.                                                                                                                    |
| へ (direction particle) | **e**                | ~~he~~  | Only as a particle.                                                                                                                                                   |
| ん before b/p/m         | **n**                | ~~m~~   | e.g. しんぶん → `shinbun`, さんぽ → `sanpo`.                                                                                                                                 |
| Long お/う               | **ou / uu**          | ~~ō/ū~~ | Spell the kana out (`toukyou`, `arigatou`); do not use macrons.                                                                                                       |
| Long え                 | **ei**               |         | e.g. せんせい → `sensei`.                                                                                                                                                 |
| づ / ず                  | **zu**               |         | Both render `zu`.                                                                                                                                                     |
| っ (small tsu)          | double the consonant |         | e.g. がっこう → `gakkou`.                                                                                                                                                 |

Romaji in example sentences is **lowercase**, spaced by word, and *italicized* (see below). Particles are written
separately: `hon o yomimasu`, not `hon'o`.

### Example sentence format

```
- にほんごを はなします。 — I speak Japanese.
  - *nihongo o hanashimasu.*
```

- Japanese line, em-dash (` — `), English, ending period.
- Romaji on the next line, indented two spaces, *italic*, lowercase, ending period.

## Contents

| File                                                   | Purpose                                                                                            |
|--------------------------------------------------------|----------------------------------------------------------------------------------------------------|
| [`docusaurus.md`](docusaurus.md)                       | Site configuration, menus, sidebars, callouts, plugins                                             |
| [`vocabulary-extraction.md`](vocabulary-extraction.md) | Vocabulary extraction script, table format, YAML structure, tag system, and dictionary features    |
|        | Custom MDX components (NextSteps, LessonList, ReferenceCard) — docs co-located with each component |
| [`templates/`](templates)                              | Lesson templates and the contributor checklist                                                     |
