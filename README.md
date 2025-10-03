# Japanese Lessons - Docusaurus Site

A comprehensive Japanese learning platform built with Docusaurus, featuring structured lessons, interactive vocabulary, and quick reference materials.

## Features

### 📚 Structured Lessons
- **Getting Started**: Introduction to Japanese and hiragana basics
- **Grammar**: Verb conjugation, particles, and sentence structure
- **Vocabulary**: Themed lessons with practical examples
- **Categories and Tags**: Easy navigation and content discovery

### 🔍 Interactive Vocabulary System
- **Search Functionality**: Search by hiragana, katakana, kanji, romaji, or meaning
- **Filtering**: Filter by category, tags, or writing system
- **Sorting**: Sort by hiragana, romaji, meaning, or category
- **Comprehensive Database**: Includes example vocabulary with context

### 📖 Quick Reference Materials
- **Kana Charts**: Complete hiragana and katakana reference tables
- **Grammar Guides**: Verb conjugation patterns and particle usage
- **Conjugation Tables**: Quick lookup for all verb forms
- **Particle Guide**: Comprehensive particle reference

### 🎯 Learning Features
- **Tagged Content**: Find related lessons and vocabulary easily
- **Categorized Organization**: Logical grouping of learning materials
- **Search Integration**: Built-in search for lessons and vocabulary
- **Responsive Design**: Works on desktop, tablet, and mobile

## Getting Started

### Prerequisites
- Node.js (version 20 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd japanese
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

4. Open your browser and navigate to `http://localhost:3000`

### Building for Production

```bash
npm run build
npm run serve
```

## Project Structure

```
japanese/
├── docs/
│   ├── lessons/           # Learning content
│   │   ├── grammar/       # Grammar lessons
│   │   └── vocabulary/    # Vocabulary lessons
│   └── reference/         # Quick reference materials
├── src/
│   ├── components/        # React components
│   ├── pages/            # Custom pages
│   │   └── vocabulary.tsx # Interactive vocabulary page
│   └── css/              # Custom styles
├── static/               # Static assets
└── docusaurus.config.ts  # Docusaurus configuration
```

## Adding New Content

### Adding Lessons

1. Create a new markdown file in the appropriate directory:
   - `docs/lessons/` for main lessons
   - `docs/lessons/grammar/` for grammar lessons
   - `docs/lessons/vocabulary/` for vocabulary lessons

2. Add frontmatter with metadata:
```markdown
---
sidebar_position: 1
title: Your Lesson Title
description: Brief description
tags: [tag1, tag2, tag3]
---
```

3. Update the sidebar configuration in `sidebars.ts` if needed

### Adding Vocabulary

1. Edit the `vocabularyData` array in `src/pages/vocabulary.tsx`
2. Add new vocabulary items with the following structure:
```typescript
{
  id: 'unique-id',
  hiragana: 'ひらがな',
  katakana: 'カタカナ', // optional
  kanji: '漢字', // optional
  romaji: 'romaji',
  meaning: 'English meaning',
  category: 'category-name',
  tags: ['tag1', 'tag2'],
  lesson: 'lesson-name' // optional
}
```

### Adding Reference Materials

1. Create markdown files in `docs/reference/`
2. Include comprehensive tables and examples
3. Use consistent formatting and structure
4. Update the reference sidebar in `sidebars.ts`

## Customization

### Styling
- Modify `src/css/custom.css` for global styles
- Component-specific styles are in their respective `.module.css` files
- The vocabulary page uses `src/pages/vocabulary.module.css`

### Navigation
- Update `docusaurus.config.ts` for main navigation
- Modify `sidebars.ts` for sidebar organization
- Add new pages in `src/pages/` for custom functionality

### Search
- The site uses Docusaurus's built-in search functionality
- Search works across all markdown content
- Vocabulary search is handled by the custom vocabulary page

## Content Guidelines

### Lesson Structure
- Start with an introduction and learning objectives
- Include clear examples with romaji and English translations
- Add practice exercises at the end
- Use consistent formatting for tables and code blocks

### Vocabulary Entries
- Include all relevant writing systems (hiragana, katakana, kanji)
- Provide accurate romaji pronunciation
- Add appropriate categories and tags
- Include context or example usage when helpful

### Reference Materials
- Use comprehensive tables for quick lookup
- Include pronunciation guides
- Add cultural notes where relevant
- Keep information concise but complete

## Deployment

### GitHub Pages
1. Update the `baseUrl` in `docusaurus.config.ts`
2. Set up GitHub Actions for automatic deployment
3. Configure the repository settings for GitHub Pages

### Other Platforms
- Netlify: Connect your repository and deploy automatically
- Vercel: Import your repository and deploy
- Any static hosting service that supports Node.js builds

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the MIT License.

## Support

For questions or issues:
1. Check the documentation
2. Search existing issues
3. Create a new issue with detailed information

---

**Happy Learning! 頑張ってください！(Ganbatte kudasai!)**