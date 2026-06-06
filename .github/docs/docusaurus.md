# Docusaurus Configuration

This document covers how the Japanese Lessons site is configured.

## Frontmatter

Every lesson file starts with a YAML frontmatter block that Docusaurus reads to build the sidebar, page metadata, and
SEO tags.

```md
---
sidebar_position: 10
title: Expressing Reason - ので / から
description: Learn how to express reasons and causes using ので and から
tags: [grammar, reason, cause, ので, から]
---
```

| Field              | Required    | Purpose                                                                                                                      |
|--------------------|-------------|------------------------------------------------------------------------------------------------------------------------------|
| `sidebar_position` | yes         | Controls the order of the lesson within its section. Lower numbers appear first. Section index files use `0`.                |
| `title`            | yes         | Page title shown in the browser tab, sidebar, and as the `<h1>` if no explicit heading is present.                           |
| `description`      | yes         | Used in meta tags for SEO and in the `LessonList` card when the section index is generated.                                  |
| `tags`             | recommended | Enables tag-based filtering on the tags page. Use the lesson type as the first tag (`grammar`, `vocabulary`, `conjugation`). |

Section index files (`index.mdx`) always use `sidebar_position: 0` so they sort to the top of their category. Individual
lessons start at `sidebar_position: 1` (or higher) and increment per lesson added.

## Menus and Navigation

Configured in `docusaurus.config.ts`.

### Navbar

| Item       | Type                          | Label      | Target                        |
|------------|-------------------------------|------------|-------------------------------|
| Lessons    | `docSidebar` (lessonsSidebar) | Lessons    | left                          |
| Dictionary | link                          | Dictionary | `/dictionary` — left          |
| Kana       | `doc`                         | Kana       | `docs/reference/index` — left |
| GitHub     | href                          | GitHub     | right                         |

### Footer

Three link columns: **Lessons** (Lessons, Grammar, Vocabulary), **Resources** (Dictionary, Hiragana/Katakana charts), *
*Development** (GitHub repo, dev docs).

## Pages and Layout

### Custom pages (`src/pages/`)

Each `.tsx` file in `src/pages/` becomes a standalone route outside the docs system:

| File             | Route         | Notes                            |
|------------------|---------------|----------------------------------|
| `index.tsx`      | `/`           | Homepage with feature cards      |
| `dictionary.tsx` | `/dictionary` | Searchable vocabulary dictionary |
| `vocabulary.tsx` | `/vocabulary` | Full vocabulary table            |

These pages use their own layout — they are not wrapped by the docs sidebar. They import React components and YAML data
directly.

### Docs pages (`docs/`)

Files under `docs/` are rendered by Docusaurus's docs plugin and receive the full docs layout: sidebar on the left,
breadcrumbs, prev/next navigation at the bottom.

Two types of docs pages are used:

**Section index (`index.mdx`)** — the landing page for each category (Grammar, Conjugation, Vocabulary, Reference). It
renders a `<LessonList>` grid of all lessons in that section. Must use `.mdx` because it imports a JSX component. The
sidebar category label is configured to link to this file (see Sidebars section). This file does NOT appear as a sidebar
entry — it is filtered out by the custom `sidebarItemsGenerator`.

**Lesson page (`.md` or `.mdx`)** — a single lesson. Grammar and conjugation lessons import `<NextSteps>` at the top (
require `.md` with MDX processing, which Docusaurus enables by default). Vocabulary lessons are plain `.md`. The
`sidebar_position` frontmatter field controls their order in the sidebar.

### File placement

```
docs/
├── intro.mdx                       # "Getting Started" entry at the top of the sidebar
├── lessons/
│   ├── grammar/
│   │   ├── index.mdx               # Grammar section landing page (sidebar_position: 0)
│   │   ├── explaining-and-reasoning/
│   │   │   └── reason.md           # Individual lesson (sidebar_position: 10)
│   │   └── ...
│   ├── conjugation/
│   │   ├── index.mdx
│   │   └── ...
│   └── vocabulary/
│       ├── index.mdx
│       └── ...
└── reference/
    ├── index.mdx
    └── ...
```

## Sidebars

Configured in `sidebars.ts`. Both `lessonsSidebar` and `referenceSidebar` share the same items (defined in
`sharedSidebarItems`), covering Grammar, Conjugation, Vocabulary, and Reference sections.

### Category configuration

This project does **not** use `_category_.json` files. Categories are defined explicitly in `sidebars.ts`:

```ts
{
  type: 'category',
  label: 'Grammar',
  link: { type: 'doc', id: 'lessons/grammar/index' },
  items: [{ type: 'autogenerated', dirName: 'lessons/grammar' }],
}
```

- `label` — the text shown in the sidebar for the collapsed/expanded group.
- `link` — makes the category label itself a clickable link to the section index (`index.mdx`). Without this, the label
  would only toggle the collapse.
- `items: [{ type: 'autogenerated' }]` — Docusaurus auto-generates sidebar items from all docs in that directory,
  ordered by `sidebar_position` frontmatter.

Using explicit sidebar config (rather than `_category_.json`) keeps all navigation structure in one file and makes the
`link` configuration straightforward.

### Custom `sidebarItemsGenerator`

Defined inline in `docusaurus.config.ts` (in the `docs` preset options). It calls the default generator then recursively
filters out any items whose `id` ends with `/index`. This prevents section index files (e.g.
`lessons/grammar/index.mdx`) from appearing as sidebar entries — they are accessible only via the category label link,
not as a separate item in the list.

## Callouts / Admonitions

Docusaurus supports four callout types using `:::` syntax. Use them consistently:

| Callout      | When to use                                                           |
|--------------|-----------------------------------------------------------------------|
| `:::tip`     | Memory tricks, cultural notes, polite-form equivalents                |
| `:::caution` | Exceptions and irregular forms within a rule                          |
| `:::warning` | Common confusion between similar words or patterns                    |
| `:::info`    | Links to related articles (second use of a particle, related grammar) |

Example:

```md
:::tip Memory Trick
Think of ので as "it's because" — slightly softer than から.
:::
```

The `:::type Title` form (title on the same line as the opener) depends on `markdown.mdx1Compat.admonitions`
being enabled in `docusaurus.config.ts`. The `future.v4` flag turns that compat off by default, which — under
Docusaurus Faster (Rspack) — makes every admonition render as literal `:::tip` text. The config re-enables it
explicitly; don't remove that setting.

## Custom Plugins

### `hideColumnRehype`

Source: `src/plugins/hideColumnRehype.ts`

A rehype plugin that adds CSS classes to lesson table columns **at build time**: `hide-column` to the **Type**
column (hidden on all screens) and `hide-on-mobile` to the **Kanji** column (hidden on mobile). Both columns stay
in the markdown source so the vocabulary extractor can still read them — they're just hidden in the page. The
classes live in the static HTML, so the columns are hidden on first paint with no flash before hydration (a
client-side script would only hide them after render).

### `yaml-loader`

An inline webpack plugin (also in `docusaurus.config.ts`) that adds `yaml-loader` for `.yaml`/`.yml` files. Used by the
vocabulary extraction system to import YAML vocabulary data directly in React pages.

## MDX vs `.md`

Use `.md` for plain markdown files. Use `.mdx` when the file imports JSX components:

```mdx
import NextSteps from '@site/src/components/NextSteps';
import LessonList from '@site/src/components/LessonList';
```

All section index files (`index.mdx`) use `.mdx` because they render `<LessonList>`. Individual lesson files use `.md`
unless they include `<NextSteps>` (grammar and conjugation lessons).
