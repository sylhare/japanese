# Japanese Lessons - Docusaurus Site

A comprehensive Japanese learning platform built with Docusaurus, featuring structured lessons, interactive vocabulary, and quick reference materials.

## Getting Started

### Prerequisites
- Node.js (version 20 or higher)
- npm or yarn

### Installation

1. Clone the repository:

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
# or
npm run dev
```

4. Open your browser and navigate to `http://localhost:3000`

## Adding New Content

### Adding Lessons

1. Create a new markdown file in the appropriate directory:
    - [`docs/lessons/`](docs/lessons/) for main lessons
    - [`docs/lessons/grammar/`](docs/lessons/grammar/) for grammar lessons
    - [`docs/lessons/vocabulary/`](docs/lessons/vocabulary/) for vocabulary lessons

2. Add frontmatter with metadata:

```markdown
---
sidebar_position: 1
title: Your Lesson Title
description: Brief description
tags: [tag1, tag2, tag3]
---
```

3. Update the sidebar configuration in [`sidebars.ts`](sidebars.ts) if needed

### Adding Vocabulary

1. **Add vocabulary tables to lesson files** using the standard format:
```markdown
## Any Section Name

| Hiragana | Kanji | Romaji | English | Type |
|----------|-------|--------|---------|------|
| あまい | 甘い | amai | sweet | い-adjective |
```

2. **Run vocabulary extraction**: `npm run extract-vocabulary`
3. **Check results**: Visit `/vocabulary` page

The vocabulary is automatically extracted from lesson files and stored in [`src/data/vocabulary.yaml`](src/data/vocabulary.yaml).

### Adding Reference Materials

1. Create markdown files in [`docs/reference/`](docs/reference/)
2. Include comprehensive tables and examples
3. Use consistent formatting and structure
4. Update the reference sidebar in [`sidebars.ts`](sidebars.ts)

## Content Guidelines

For detailed guidelines on creating lesson content, see the [Content Guide](.github/docs/content-guide.md).

### Building for Production

```bash
npm run build
npm run serve
```

## Development Documentation

For detailed development information, see the documentation in [`.github/docs/`](.github/docs/):
- [Deployment Guide](.github/docs/deployment-guide.md)
- [Vocabulary System](.github/docs/vocabulary-extraction.md)

---

**Happy Learning! 頑張ってください！(Ganbatte kudasai!)**