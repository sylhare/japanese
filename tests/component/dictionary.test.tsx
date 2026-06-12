import fs from 'fs';
import path from 'path';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import Vocabulary, { getTagPath, matchesJlptEntry } from '../../src/pages/dictionary';
import { loadVocabularyData } from '../test-utils';

vi.mock('../../src/data/vocabulary.yaml', async () => {
  const { mockVocabularyData } = await import('../__fixtures__/component/vocabulary-mock-data');
  return {
    default: mockVocabularyData,
  };
});

vi.mock('../../src/data/jlpt-vocabulary.json', () => ({
  default: {
    N5: [{ kanji: '赤', hiragana: 'あか', romaji: 'aka' }],
  },
}));

vi.mock('../../src/pages/dictionary.module.css', () => ({
  default: {},
}));

describe('Vocabulary Component', () => {
  beforeEach(() => {
    delete (window as any).location;
    window.location = { href: '' } as any;
  });

  describe('Component Rendering', () => {
    it('renders the vocabulary page with title and description', () => {
      render(<Vocabulary />);

      expect(screen.getByText('Japanese Vocabulary')).toBeInTheDocument();
      expect(screen.getByText('Search and explore Japanese vocabulary with hiragana, katakana, kanji, and romaji.')).toBeInTheDocument();
    });

    it('displays vocabulary items from the mocked data', () => {
      render(<Vocabulary />);

      expect(screen.getByText('あか')).toBeInTheDocument();
      expect(screen.getByText('あお')).toBeInTheDocument();
      expect(screen.getByText('あまい')).toBeInTheDocument();
      expect(screen.getByText('コーヒー')).toBeInTheDocument();
    });

    it('displays vocabulary with correct structure', () => {
      render(<Vocabulary />);

      expect(screen.getByText('赤')).toBeInTheDocument();
      expect(screen.getByText('あか')).toBeInTheDocument();
      expect(screen.getByText('aka')).toBeInTheDocument();
      expect(screen.getByText('red')).toBeInTheDocument();
      expect(screen.getAllByText('い-adjective')).toHaveLength(4);
    });

    it('shows correct results count', () => {
      render(<Vocabulary />);

      expect(screen.getByText('Showing 5 of 5 vocabulary items')).toBeInTheDocument();
    });
  });

  describe('Search Functionality', () => {
    it('filters vocabulary by search term', async () => {
      const user = userEvent.setup();
      render(<Vocabulary />);

      const searchInput = screen.getByPlaceholderText('Search vocabulary...');
      await user.type(searchInput, 'あか');

      expect(screen.getByText('あか')).toBeInTheDocument();
      expect(screen.queryByText('あお')).not.toBeInTheDocument();
      expect(screen.queryByText('あまい')).not.toBeInTheDocument();

      expect(screen.getByText('Showing 1 of 5 vocabulary items')).toBeInTheDocument();
    });

    it('filters vocabulary by hiragana search', async () => {
      const user = userEvent.setup();
      render(<Vocabulary />);

      const searchInput = screen.getByPlaceholderText('Search vocabulary...');
      await user.type(searchInput, 'あまい');

      expect(screen.getByText('あまい')).toBeInTheDocument();
      expect(screen.queryByText('あか')).not.toBeInTheDocument();
      expect(screen.queryByText('あお')).not.toBeInTheDocument();
    });

    it('filters vocabulary by meaning search', async () => {
      const user = userEvent.setup();
      render(<Vocabulary />);

      const searchInput = screen.getByPlaceholderText('Search vocabulary...');
      await user.type(searchInput, 'red');

      expect(screen.getByText('red')).toBeInTheDocument();
      expect(screen.queryByText('blue')).not.toBeInTheDocument();
    });

    it('filters vocabulary by romaji search', async () => {
      const user = userEvent.setup();
      render(<Vocabulary />);

      const searchInput = screen.getByPlaceholderText('Search vocabulary...');
      await user.type(searchInput, 'aka');

      expect(screen.getByText('aka')).toBeInTheDocument();
      expect(screen.queryByText('ao')).not.toBeInTheDocument();
    });

    it('shows no results when search finds nothing', async () => {
      const user = userEvent.setup();
      render(<Vocabulary />);

      const searchInput = screen.getByPlaceholderText('Search vocabulary...');
      await user.type(searchInput, 'nonexistent');

      expect(screen.getByText('No vocabulary found')).toBeInTheDocument();
      expect(screen.getByText('Try adjusting your search terms or filters.')).toBeInTheDocument();
    });
  });

  describe('Category Filtering', () => {
    it('filters vocabulary by category', async () => {
      const user = userEvent.setup();
      render(<Vocabulary />);

      const categorySelect = screen.getByDisplayValue('All categories');
      await user.selectOptions(categorySelect, 'vocabulary');

      expect(screen.getByText('あか')).toBeInTheDocument();
      expect(screen.getByText('あお')).toBeInTheDocument();
      expect(screen.getByText('あまい')).toBeInTheDocument();
      expect(screen.getByText('コーヒー')).toBeInTheDocument();
    });
  });

  describe('Type Filtering', () => {
    it('renders the type filter dropdown', () => {
      render(<Vocabulary />);

      expect(screen.getByDisplayValue('All types')).toBeInTheDocument();
    });

    it('filters vocabulary by type', async () => {
      const user = userEvent.setup();
      render(<Vocabulary />);

      const typeSelect = screen.getByDisplayValue('All types');
      await user.selectOptions(typeSelect, 'noun');

      expect(screen.getByText('コーヒー')).toBeInTheDocument();
      expect(screen.queryByText('あか')).not.toBeInTheDocument();
      expect(screen.queryByText('たべる')).not.toBeInTheDocument();
    });

    it('filters vocabulary by verb type', async () => {
      const user = userEvent.setup();
      render(<Vocabulary />);

      const typeSelect = screen.getByDisplayValue('All types');
      await user.selectOptions(typeSelect, 'verb');

      expect(screen.getByText('たべる')).toBeInTheDocument();
      expect(screen.queryByText('あか')).not.toBeInTheDocument();
      expect(screen.queryByText('コーヒー')).not.toBeInTheDocument();
    });

    it('shows all items when "All types" is selected', async () => {
      const user = userEvent.setup();
      render(<Vocabulary />);

      const typeSelect = screen.getByDisplayValue('All types');
      await user.selectOptions(typeSelect, 'verb');
      await user.selectOptions(typeSelect, 'all');

      expect(screen.getByText('Showing 5 of 5 vocabulary items')).toBeInTheDocument();
    });

    it('combines type filter with search', async () => {
      const user = userEvent.setup();
      render(<Vocabulary />);

      const typeSelect = screen.getByDisplayValue('All types');
      await user.selectOptions(typeSelect, 'い-adjective');

      const searchInput = screen.getByPlaceholderText('Search vocabulary...');
      await user.type(searchInput, 'red');

      expect(screen.getByText('あか')).toBeInTheDocument();
      expect(screen.queryByText('あお')).not.toBeInTheDocument();
    });

    it('combines type filter with category filter', async () => {
      const user = userEvent.setup();
      render(<Vocabulary />);

      const categorySelect = screen.getByDisplayValue('All categories');
      await user.selectOptions(categorySelect, 'grammar');

      const typeSelect = screen.getByDisplayValue('All types');
      await user.selectOptions(typeSelect, 'verb');

      expect(screen.getByText('たべる')).toBeInTheDocument();
      expect(screen.queryByText('あか')).not.toBeInTheDocument();
    });
  });

  describe('Sorting Functionality', () => {
    it('sorts vocabulary by hiragana', async () => {
      const user = userEvent.setup();
      render(<Vocabulary />);

      const sortSelect = screen.getByDisplayValue('Hiragana (あ→ん)');
      await user.selectOptions(sortSelect, 'hiragana');

      const vocabularyCards = screen.getAllByText(/あか|あお|あまい/);

      expect(vocabularyCards[0]).toHaveTextContent('あお');
      expect(vocabularyCards[1]).toHaveTextContent('あか');
      expect(vocabularyCards[2]).toHaveTextContent('あまい');
    });

    it('sorts vocabulary by romaji', async () => {
      const user = userEvent.setup();
      render(<Vocabulary />);

      const sortSelect = screen.getByDisplayValue('Hiragana (あ→ん)');
      await user.selectOptions(sortSelect, 'romaji');

      const vocabularyCards = screen.getAllByText(/あか|あお|あまい|コーヒー/);

      expect(vocabularyCards[0]).toHaveTextContent('あか');
      expect(vocabularyCards[1]).toHaveTextContent('あまい');
      expect(vocabularyCards[2]).toHaveTextContent('あお');
    });
  });

  describe('Combined Functionality', () => {
    it('handles combined filters correctly', async () => {
      const user = userEvent.setup();
      render(<Vocabulary />);

      const categorySelect = screen.getByDisplayValue('All categories');
      await user.selectOptions(categorySelect, 'vocabulary');

      const searchInput = screen.getByPlaceholderText('Search vocabulary...');
      await user.type(searchInput, 'あまい');

      expect(screen.getByText('あまい')).toBeInTheDocument();
      expect(screen.queryByText('あか')).not.toBeInTheDocument();
      expect(screen.queryByText('あお')).not.toBeInTheDocument();
      expect(screen.queryByText('コーヒー')).not.toBeInTheDocument();

      expect(screen.getByText('Showing 1 of 5 vocabulary items')).toBeInTheDocument();
    });

    it('updates results count when filters change', async () => {
      const user = userEvent.setup();
      render(<Vocabulary />);

      expect(screen.getByText('Showing 5 of 5 vocabulary items')).toBeInTheDocument();

      const searchInput = screen.getByPlaceholderText('Search vocabulary...');
      await user.type(searchInput, 'あか');
      expect(screen.getByText('Showing 1 of 5 vocabulary items')).toBeInTheDocument();
    });

    it('resets filters when search is cleared', async () => {
      const user = userEvent.setup();
      render(<Vocabulary />);

      const searchInput = screen.getByPlaceholderText('Search vocabulary...');
      await user.type(searchInput, 'あか');
      expect(screen.getByText('Showing 1 of 5 vocabulary items')).toBeInTheDocument();

      await user.clear(searchInput);
      expect(screen.getByText('Showing 5 of 5 vocabulary items')).toBeInTheDocument();
    });
  });

  describe('Data Display', () => {
    it('displays tags correctly', () => {
      render(<Vocabulary />);

      expect(screen.getAllByText('colors')).toHaveLength(2);
      expect(screen.getAllByText('tastes')).toHaveLength(3);
    });

    it('renders multiple tags with correct links for a single item', () => {
      render(<Vocabulary />);

      const sweetMeaning = screen.getByText('sweet');
      const card = sweetMeaning.closest('div')?.parentElement;
      expect(card).not.toBeNull();

      const tagLinks = Array.from(card?.querySelectorAll('a') ?? []);
      const tagTexts = tagLinks.map(link => link.textContent);

      expect(tagTexts).toEqual(expect.arrayContaining(['tastes', 'particle-guide']));

      const tastesLink = tagLinks.find(link => link.textContent === 'tastes');
      expect(tastesLink?.getAttribute('href')).toBe('/docs/lessons/vocabulary/food/tastes');

      const particleLink = tagLinks.find(link => link.textContent === 'particle-guide');
      expect(particleLink?.getAttribute('href')).toBe('/docs/lessons/grammar/sentence-building/particle-guide');
    });

    it('adds an N5 tag with the correct reference link for N5 items only', () => {
      render(<Vocabulary />);

      const n5Tags = screen.getAllByText('N5');
      expect(n5Tags).toHaveLength(1);

      const n5Tag = n5Tags[0];
      expect(n5Tag.getAttribute('href')).toBe('/docs/reference/n5-vocabulary');

      const redMeaning = screen.getByText('red');
      const redCard = redMeaning.closest('div')?.parentElement;
      expect(redCard?.querySelectorAll('a')).toHaveLength(2);
      expect(redCard?.textContent).toContain('N5');
    });

    it('displays kanji when available', () => {
      render(<Vocabulary />);

      expect(screen.getByText('赤')).toBeInTheDocument();
      expect(screen.getByText('青')).toBeInTheDocument();
      expect(screen.getByText('甘い')).toBeInTheDocument();
    });

    it('displays katakana when available', () => {
      render(<Vocabulary />);

      expect(screen.getByText('コーヒー')).toBeInTheDocument();
    });

    it('handles tag clicks with navigation', async () => {
      const user = userEvent.setup();
      render(<Vocabulary />);

      const mockLocation = { href: '' };
      Object.defineProperty(window, 'location', {
        value: mockLocation,
        writable: true,
      });

      const colorTags = screen.getAllByText('colors');
      await user.click(colorTags[0]);

      expect(mockLocation.href).toBe('/docs/lessons/vocabulary/colors');
    });
  });
});

describe('getTagPath', () => {
  describe('JLPT tags', () => {
    it('should map "N5" tag to the N5 reference page', () => {
      expect(getTagPath('N5')).toBe('docs/reference/n5-vocabulary');
    });

    it('should map lowercase "n5" tag to the N5 reference page', () => {
      expect(getTagPath('n5')).toBe('docs/reference/n5-vocabulary');
    });
  });

  describe('Numbers-related tags', () => {
    it('should map "basics" tag to the numbers basics lesson', () => {
      expect(getTagPath('basics')).toBe('docs/lessons/vocabulary/numbers/basics');
    });

    it('should map "counting" tag to counting lesson path', () => {
      expect(getTagPath('counting')).toBe('docs/lessons/vocabulary/numbers/counting');
    });
  });

  describe('Time-related tags', () => {
    it('should map "calendar" tag to the calendar lesson page', () => {
      expect(getTagPath('calendar')).toBe('docs/lessons/vocabulary/time/calendar');
    });

    it('should map "clock" tag to the telling-time lesson page', () => {
      expect(getTagPath('clock')).toBe('docs/lessons/vocabulary/time/clock');
    });
  });

  describe('Case insensitivity', () => {
    it('should resolve an uppercase real-lesson tag to its lowercase path', () => {
      expect(getTagPath('COLORS')).toBe('docs/lessons/vocabulary/colors');
    });

    it('should resolve a mixed-case real-lesson tag', () => {
      expect(getTagPath('Family')).toBe('docs/lessons/vocabulary/family');
    });
  });

  describe('Vocabulary tags (default path)', () => {
    it('should map "colors" tag to vocabulary lesson path', () => {
      expect(getTagPath('colors')).toBe('docs/lessons/vocabulary/colors');
    });

    it('should map "tastes" tag to vocabulary lesson path', () => {
      expect(getTagPath('tastes')).toBe('docs/lessons/vocabulary/food/tastes');
    });

    it('should map "family" tag to vocabulary lesson path', () => {
      expect(getTagPath('family')).toBe('docs/lessons/vocabulary/family');
    });

    it('should map unmapped tag to vocabulary lesson path', () => {
      expect(getTagPath('unknown-tag')).toBe('docs/lessons/vocabulary/unknown-tag');
    });
  });

  describe('Special characters and edge cases', () => {
    it('should handle tags with hyphens', () => {
      expect(getTagPath('confusing-kanji')).toBe('docs/lessons/vocabulary/essentials/confusing-kanji');
    });

    it('should handle empty string', () => {
      expect(getTagPath('')).toBe('docs/lessons/vocabulary/');
    });

    it('should preserve original tag casing in the path', () => {
      expect(getTagPath('MyCustomTag')).toBe('docs/lessons/vocabulary/MyCustomTag');
    });
  });

  describe('All vocabulary tags resolve to existing pages', () => {
    const allTags = new Set<string>();
    loadVocabularyData().vocabulary.forEach(item => item.tags.forEach(t => allTags.add(t)));

    allTags.forEach(tag => {
      it(`tag "${tag}" should link to an existing lesson page`, () => {
        const tagPath = getTagPath(tag);
        const basePath = path.resolve(__dirname, '../../', tagPath);
        const candidates = [
          `${basePath}.md`,
          `${basePath}.mdx`,
          path.join(basePath, 'index.md'),
          path.join(basePath, 'index.mdx'),
        ];
        const exists = candidates.some(c => fs.existsSync(c));
        expect(exists, `Tag "${tag}" maps to "${tagPath}" but no page exists`).toBe(true);
      });
    });
  });

  describe('Tag path format', () => {
    it('should always start with "docs/lessons/"', () => {
      const tags = ['numbers', 'colors', 'time', 'counters', 'family'];
      tags.forEach(tag => {
        expect(getTagPath(tag)).toMatch(/^docs\/lessons\//);
      });
    });

    it('should return correct paths for vocabulary tags', () => {
      expect(getTagPath('colors')).toBe('docs/lessons/vocabulary/colors');
      expect(getTagPath('family')).toBe('docs/lessons/vocabulary/family');
    });

    it('should return correct paths for numbers tags', () => {
      expect(getTagPath('basics')).toBe('docs/lessons/vocabulary/numbers/basics');
      expect(getTagPath('counting')).toBe('docs/lessons/vocabulary/numbers/counting');
    });

    it('should return correct paths for time-related tags', () => {
      expect(getTagPath('calendar')).toBe('docs/lessons/vocabulary/time/calendar');
      expect(getTagPath('clock')).toBe('docs/lessons/vocabulary/time/clock');
      expect(getTagPath('frequency')).toBe('docs/lessons/vocabulary/time/frequency');
    });
  });

  describe('matchesJlptEntry (homonym handling)', () => {
    const hanaFlower = { id: 'h1', hiragana: 'はな', kanji: '花', romaji: 'hana', meaning: 'flower', category: 'vocabulary', tags: [], type: 'noun' };
    const hanaNose = { id: 'h2', hiragana: 'はな', kanji: '鼻', romaji: 'hana', meaning: 'nose', category: 'vocabulary', tags: [], type: 'noun' };

    it('matches when reading and kanji both agree', () => {
      expect(matchesJlptEntry(hanaFlower, { kanji: '花', hiragana: 'はな', romaji: 'hana' })).toBe(true);
    });

    it('does NOT match a same-reading homonym with a different kanji', () => {
      expect(matchesJlptEntry(hanaFlower, { kanji: '鼻', hiragana: 'はな', romaji: 'hana' })).toBe(false);
      expect(matchesJlptEntry(hanaNose, { kanji: '花', hiragana: 'はな', romaji: 'hana' })).toBe(false);
    });

    it('matches a kana-only entry by reading alone', () => {
      const kirei = { id: 'k1', hiragana: 'きれい', romaji: 'kirei', meaning: 'pretty', category: 'vocabulary', tags: [], type: 'な-adjective' };
      expect(matchesJlptEntry(kirei, { hiragana: 'きれい', romaji: 'kirei' })).toBe(true);
    });

    it('matches by reading when the item has no kanji even if the entry does', () => {
      const hanaKana = { id: 'h3', hiragana: 'はな', romaji: 'hana', meaning: 'flower', category: 'vocabulary', tags: [], type: 'noun' };
      expect(matchesJlptEntry(hanaKana, { kanji: '花', hiragana: 'はな', romaji: 'hana' })).toBe(true);
    });

    it('does not match when the reading differs', () => {
      expect(matchesJlptEntry(hanaFlower, { kanji: '水', hiragana: 'みず', romaji: 'mizu' })).toBe(false);
    });
  });
});

