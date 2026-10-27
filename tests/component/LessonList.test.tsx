import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import LessonList from '../../src/components/LessonList';
import type { LessonItem } from '../../src/components/LessonList';

vi.mock('../../src/components/LessonList/styles.module.css', () => ({
  default: {
    lessonGrid: 'lessonGrid',
    lessonCard: 'lessonCard',
    cardContent: 'cardContent',
    cardTitle: 'cardTitle',
    cardDescription: 'cardDescription',
    cardArrow: 'cardArrow',
  },
}));

describe('LessonList Component', () => {
  const mockItems: LessonItem[] = [
    {
      title: 'Basic Conjugation',
      description: 'Learn the fundamentals of Japanese verb conjugation',
      to: './conjugation/basics',
    },
    {
      title: 'Te-Form',
      description: 'Master the versatile て-form conjugation pattern',
      to: './conjugation/te-form',
    },
  ];

  describe('Component Rendering', () => {
    it('renders all provided lesson items', () => {
      render(<LessonList items={mockItems} />);

      expect(screen.getByText('Basic Conjugation')).toBeInTheDocument();
      expect(screen.getByText('Te-Form')).toBeInTheDocument();
    });

    it('renders descriptions for all items', () => {
      render(<LessonList items={mockItems} />);

      expect(screen.getByText('Learn the fundamentals of Japanese verb conjugation')).toBeInTheDocument();
      expect(screen.getByText('Master the versatile て-form conjugation pattern')).toBeInTheDocument();
    });

    it('renders navigation arrows for each card', () => {
      render(<LessonList items={mockItems} />);

      const arrows = screen.getAllByText('→');
      expect(arrows).toHaveLength(2);
    });
  });

  describe('Links and Navigation', () => {
    it('creates links with correct hrefs', () => {
      render(<LessonList items={mockItems} />);

      const basicConjugationLink = screen.getByText('Basic Conjugation').closest('a');
      const teFormLink = screen.getByText('Te-Form').closest('a');

      expect(basicConjugationLink).toHaveAttribute('href', './conjugation/basics');
      expect(teFormLink).toHaveAttribute('href', './conjugation/te-form');
    });

    it('renders links with absolute paths', () => {
      const itemsWithAbsolutePaths: LessonItem[] = [
        {
          title: 'Grammar Guide',
          description: 'Complete grammar reference',
          to: '/docs/lessons/grammar',
        },
      ];

      render(<LessonList items={itemsWithAbsolutePaths} />);

      const link = screen.getByText('Grammar Guide').closest('a');
      expect(link).toHaveAttribute('href', '/docs/lessons/grammar');
    });

    it('renders links with relative paths', () => {
      const itemsWithRelativePaths: LessonItem[] = [
        {
          title: 'Numbers',
          description: 'Learn Japanese numbers',
          to: '../vocabulary/numbers',
        },
      ];

      render(<LessonList items={itemsWithRelativePaths} />);

      const link = screen.getByText('Numbers').closest('a');
      expect(link).toHaveAttribute('href', '../vocabulary/numbers');
    });
  });

  describe('Single Item', () => {
    it('renders correctly with a single lesson', () => {
      const singleItem: LessonItem[] = [
        {
          title: 'Introduction',
          description: 'Get started with Japanese',
          to: './intro',
        },
      ];

      render(<LessonList items={singleItem} />);

      expect(screen.getByText('Introduction')).toBeInTheDocument();
      expect(screen.getByText('Get started with Japanese')).toBeInTheDocument();
      expect(screen.getAllByText('→')).toHaveLength(1);
    });
  });

  describe('Multiple Items', () => {
    it('renders correctly with three or more items', () => {
      const multipleItems: LessonItem[] = [
        {
          title: 'Lesson 1',
          description: 'First lesson',
          to: './lesson-1',
        },
        {
          title: 'Lesson 2',
          description: 'Second lesson',
          to: './lesson-2',
        },
        {
          title: 'Lesson 3',
          description: 'Third lesson',
          to: './lesson-3',
        },
      ];

      render(<LessonList items={multipleItems} />);

      expect(screen.getByText('Lesson 1')).toBeInTheDocument();
      expect(screen.getByText('Lesson 2')).toBeInTheDocument();
      expect(screen.getByText('Lesson 3')).toBeInTheDocument();
      expect(screen.getAllByText('→')).toHaveLength(3);
    });
  });

  describe('Empty State', () => {
    it('renders empty container with no items', () => {
      const { container } = render(<LessonList items={[]} />);

      const grid = container.querySelector('.lessonGrid');
      expect(grid).toBeInTheDocument();
      expect(grid?.children.length).toBe(0);
    });
  });

  describe('Content Structure', () => {
    it('wraps each card with proper structure', () => {
      render(<LessonList items={mockItems} />);

      const basicTitle = screen.getByText('Basic Conjugation');
      const basicDesc = screen.getByText('Learn the fundamentals of Japanese verb conjugation');

      // Both should be within the same link
      const link = basicTitle.closest('a');
      expect(link).toContainElement(basicDesc);
    });

    it('uses h3 for card titles', () => {
      render(<LessonList items={mockItems} />);

      const title = screen.getByText('Basic Conjugation');
      expect(title.tagName).toBe('H3');
    });

    it('uses paragraph for descriptions', () => {
      render(<LessonList items={mockItems} />);

      const description = screen.getByText('Learn the fundamentals of Japanese verb conjugation');
      expect(description.tagName).toBe('P');
    });
  });

  describe('Special Characters in Content', () => {
    it('handles Japanese characters in titles and descriptions', () => {
      const itemsWithJapanese: LessonItem[] = [
        {
          title: 'て-Form Conjugation',
          description: 'Learn て-form for connecting actions',
          to: './te-form',
        },
      ];

      render(<LessonList items={itemsWithJapanese} />);

      expect(screen.getByText('て-Form Conjugation')).toBeInTheDocument();
      expect(screen.getByText('Learn て-form for connecting actions')).toBeInTheDocument();
    });

    it('handles special characters and quotes', () => {
      const itemsWithSpecialChars: LessonItem[] = [
        {
          title: 'Using "Quotations" & Symbols',
          description: "Master expressions like 'probably' & more",
          to: './special',
        },
      ];

      render(<LessonList items={itemsWithSpecialChars} />);

      expect(screen.getByText('Using "Quotations" & Symbols')).toBeInTheDocument();
      expect(screen.getByText("Master expressions like 'probably' & more")).toBeInTheDocument();
    });

    it('renders **bold** markdown as <strong> elements', () => {
      const itemsWithBold: LessonItem[] = [
        {
          title: 'Bold Test',
          description: 'Learn how to use **たい** and **ほしい**',
          to: './bold',
        },
      ];

      const { container } = render(<LessonList items={itemsWithBold} />);

      const strongs = container.querySelectorAll('strong');
      expect(strongs).toHaveLength(2);
      expect(strongs[0].textContent).toBe('たい');
      expect(strongs[1].textContent).toBe('ほしい');
    });
  });

  describe('Accessibility', () => {
    it('renders semantic HTML structure', () => {
      const { container } = render(<LessonList items={mockItems} />);

      const h3s = container.querySelectorAll('h3');
      const paragraphs = container.querySelectorAll('p');

      expect(h3s).toHaveLength(2);
      expect(paragraphs).toHaveLength(2);
    });

    it('renders links with accessible content', () => {
      render(<LessonList items={mockItems} />);

      const links = screen.getAllByRole('link');
      expect(links).toHaveLength(2);

      // Each link should contain visible text
      links.forEach(link => {
        expect(link).toHaveTextContent(/./);
      });
    });
  });

  describe('Alphabetical Ordering', () => {
    it('renders items sorted alphabetically by title regardless of input order', () => {
      const unorderedItems: LessonItem[] = [
        { title: 'Zebra Lesson', description: 'Last alphabetically', to: './zebra' },
        { title: 'Apple Lesson', description: 'First alphabetically', to: './apple' },
        { title: 'Mango Lesson', description: 'Middle alphabetically', to: './mango' },
      ];

      const { container } = render(<LessonList items={unorderedItems} />);
      const titles = container.querySelectorAll('h3');

      expect(titles[0]).toHaveTextContent('Apple Lesson');
      expect(titles[1]).toHaveTextContent('Mango Lesson');
      expect(titles[2]).toHaveTextContent('Zebra Lesson');
    });

    it('does not mutate the original items array', () => {
      const items: LessonItem[] = [
        { title: 'Z Lesson', description: 'Z', to: './z' },
        { title: 'A Lesson', description: 'A', to: './a' },
      ];
      const originalOrder = items.map(i => i.title);

      render(<LessonList items={items} />);

      expect(items.map(i => i.title)).toEqual(originalOrder);
    });

    it('renders a single item without error', () => {
      const singleItem: LessonItem[] = [
        { title: 'Only Lesson', description: 'Just one', to: './only' },
      ];

      render(<LessonList items={singleItem} />);

      const titles = screen.getAllByRole('heading', { level: 3 });
      expect(titles).toHaveLength(1);
      expect(titles[0]).toHaveTextContent('Only Lesson');
    });

    it('handles items that are already in alphabetical order', () => {
      const orderedItems: LessonItem[] = [
        { title: 'Alpha', description: 'First', to: './alpha' },
        { title: 'Beta', description: 'Second', to: './beta' },
        { title: 'Gamma', description: 'Third', to: './gamma' },
      ];

      const { container } = render(<LessonList items={orderedItems} />);
      const titles = container.querySelectorAll('h3');

      expect(titles[0]).toHaveTextContent('Alpha');
      expect(titles[1]).toHaveTextContent('Beta');
      expect(titles[2]).toHaveTextContent('Gamma');
    });
  });
});
