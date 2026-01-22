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
          description: "Master expressions like 'probably' and <emphasis>",
          to: './special',
        },
      ];

      render(<LessonList items={itemsWithSpecialChars} />);

      expect(screen.getByText('Using "Quotations" & Symbols')).toBeInTheDocument();
      expect(screen.getByText("Master expressions like 'probably' and <emphasis>")).toBeInTheDocument();
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
});
