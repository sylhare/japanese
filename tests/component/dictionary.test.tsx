import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import Vocabulary from '../../src/pages/dictionary';

vi.mock('../../src/data/vocabulary.yaml', async () => {
  const { mockVocabularyData } = await import('../__fixtures__/component/vocabulary-mock-data');
  return {
    default: mockVocabularyData,
  };
});

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
      expect(screen.getAllByText('い-adjective')).toHaveLength(3);
    });

    it('shows correct results count', () => {
      render(<Vocabulary />);

      expect(screen.getByText('Showing 4 of 4 vocabulary items')).toBeInTheDocument();
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

      expect(screen.getByText('Showing 1 of 4 vocabulary items')).toBeInTheDocument();
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

      const categorySelect = screen.getByDisplayValue('All');
      await user.selectOptions(categorySelect, 'vocabulary');

      expect(screen.getByText('あか')).toBeInTheDocument();
      expect(screen.getByText('あお')).toBeInTheDocument();
      expect(screen.getByText('あまい')).toBeInTheDocument();
      expect(screen.getByText('コーヒー')).toBeInTheDocument();
    });
  });

  describe('Type Filtering', () => {
    it('filters vocabulary by hiragana only checkbox', async () => {
      const user = userEvent.setup();
      render(<Vocabulary />);

      const hiraganaCheckbox = screen.getByLabelText('Hiragana only');
      await user.click(hiraganaCheckbox);

      expect(screen.getByText('あか')).toBeInTheDocument();
      expect(screen.getByText('あお')).toBeInTheDocument();
      expect(screen.getByText('あまい')).toBeInTheDocument();
      expect(screen.queryByText('コーヒー')).not.toBeInTheDocument();

      expect(screen.getByText('Showing 3 of 4 vocabulary items')).toBeInTheDocument();
    });

    it('filters vocabulary by katakana only checkbox', async () => {
      const user = userEvent.setup();
      render(<Vocabulary />);

      const katakanaCheckbox = screen.getByLabelText('Katakana only');
      await user.click(katakanaCheckbox);

      expect(screen.getByText('コーヒー')).toBeInTheDocument();

      expect(screen.queryByText('あか')).not.toBeInTheDocument();
      expect(screen.queryByText('あお')).not.toBeInTheDocument();
      expect(screen.queryByText('あまい')).not.toBeInTheDocument();

      expect(screen.getByText('Showing 1 of 4 vocabulary items')).toBeInTheDocument();
    });
  });

  describe('Sorting Functionality', () => {
    it('sorts vocabulary by hiragana', async () => {
      const user = userEvent.setup();
      render(<Vocabulary />);

      const sortSelect = screen.getByDisplayValue('Hiragana (A-Z)');
      await user.selectOptions(sortSelect, 'hiragana');

      const vocabularyCards = screen.getAllByText(/あか|あお|あまい/);

      expect(vocabularyCards[0]).toHaveTextContent('あお');
      expect(vocabularyCards[1]).toHaveTextContent('あか');
      expect(vocabularyCards[2]).toHaveTextContent('あまい');
    });

    it('sorts vocabulary by romaji', async () => {
      const user = userEvent.setup();
      render(<Vocabulary />);

      const sortSelect = screen.getByDisplayValue('Hiragana (A-Z)');
      await user.selectOptions(sortSelect, 'romaji');

      const vocabularyCards = screen.getAllByText(/あか|あお|あまい|コーヒー/);

      expect(vocabularyCards[0]).toHaveTextContent('あか'); // aka
      expect(vocabularyCards[1]).toHaveTextContent('あまい'); // amai
      expect(vocabularyCards[2]).toHaveTextContent('あお'); // ao
    });
  });

  describe('Combined Functionality', () => {
    it('handles combined filters correctly', async () => {
      const user = userEvent.setup();
      render(<Vocabulary />);

      const categorySelect = screen.getByDisplayValue('All');
      await user.selectOptions(categorySelect, 'vocabulary');

      const searchInput = screen.getByPlaceholderText('Search vocabulary...');
      await user.type(searchInput, 'あまい');

      expect(screen.getByText('あまい')).toBeInTheDocument();
      expect(screen.queryByText('あか')).not.toBeInTheDocument();
      expect(screen.queryByText('あお')).not.toBeInTheDocument();
      expect(screen.queryByText('コーヒー')).not.toBeInTheDocument();

      expect(screen.getByText('Showing 1 of 4 vocabulary items')).toBeInTheDocument();
    });

    it('updates results count when filters change', async () => {
      const user = userEvent.setup();
      render(<Vocabulary />);

      expect(screen.getByText('Showing 4 of 4 vocabulary items')).toBeInTheDocument();

      const searchInput = screen.getByPlaceholderText('Search vocabulary...');
      await user.type(searchInput, 'あか');
      expect(screen.getByText('Showing 1 of 4 vocabulary items')).toBeInTheDocument();
    });

    it('resets filters when search is cleared', async () => {
      const user = userEvent.setup();
      render(<Vocabulary />);

      const searchInput = screen.getByPlaceholderText('Search vocabulary...');
      await user.type(searchInput, 'あか');
      expect(screen.getByText('Showing 1 of 4 vocabulary items')).toBeInTheDocument();

      await user.clear(searchInput);
      expect(screen.getByText('Showing 4 of 4 vocabulary items')).toBeInTheDocument();
    });
  });

  describe('Data Display', () => {
    it('displays tags correctly', () => {
      render(<Vocabulary />);

      expect(screen.getAllByText('colors')).toHaveLength(2); // appears twice
      expect(screen.getAllByText('tastes')).toHaveLength(2); // appears twice
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

