import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import NextSteps from '../../src/components/NextSteps';
import type { NextStepItem } from '../../src/components/NextSteps';

vi.mock('../../src/components/NextSteps/styles.module.css', () => ({
  default: {
    nextStepsContainer: 'nextStepsContainer',
    sectionTitle: 'sectionTitle',
    sectionSubtitle: 'sectionSubtitle',
    nextStepsGrid: 'nextStepsGrid',
    nextStepCard: 'nextStepCard',
    cardContent: 'cardContent',
    cardTitle: 'cardTitle',
    cardDescription: 'cardDescription',
    cardArrow: 'cardArrow',
  },
}));

describe('NextSteps Component', () => {
  const mockItems: NextStepItem[] = [
    {
      title: 'Reading Numbers',
      description: 'Learn how to pronounce any number with sound changes and special cases',
      to: './counting',
    },
    {
      title: 'Counters and Frequency',
      description: 'Master Japanese counter suffixes for frequency and repetition',
      to: './counters',
    },
  ];

  describe('Component Rendering', () => {
    it('renders the component with title and subtitle', () => {
      render(<NextSteps items={mockItems} />);

      expect(screen.getByText('Next Steps')).toBeInTheDocument();
      expect(screen.getByText("Once you're comfortable with this lesson, check out:")).toBeInTheDocument();
    });

    it('renders all provided next step items', () => {
      render(<NextSteps items={mockItems} />);

      expect(screen.getByText('Reading Numbers')).toBeInTheDocument();
      expect(screen.getByText('Counters and Frequency')).toBeInTheDocument();
    });

    it('renders descriptions for all items', () => {
      render(<NextSteps items={mockItems} />);

      expect(screen.getByText('Learn how to pronounce any number with sound changes and special cases')).toBeInTheDocument();
      expect(screen.getByText('Master Japanese counter suffixes for frequency and repetition')).toBeInTheDocument();
    });

    it('renders navigation arrows for each card', () => {
      render(<NextSteps items={mockItems} />);

      const arrows = screen.getAllByText('→');
      expect(arrows).toHaveLength(2);
    });
  });

  describe('Links and Navigation', () => {
    it('creates links with correct hrefs', () => {
      render(<NextSteps items={mockItems} />);

      const readingNumbersLink = screen.getByText('Reading Numbers').closest('a');
      const countersLink = screen.getByText('Counters and Frequency').closest('a');

      expect(readingNumbersLink).toHaveAttribute('href', './counting');
      expect(countersLink).toHaveAttribute('href', './counters');
    });

    it('renders links with relative paths', () => {
      const itemsWithRelativePaths: NextStepItem[] = [
        {
          title: 'Time Expressions',
          description: 'Learn how to tell time and express duration',
          to: '../../vocabulary/time',
        },
      ];

      render(<NextSteps items={itemsWithRelativePaths} />);

      const link = screen.getByText('Time Expressions').closest('a');
      expect(link).toHaveAttribute('href', '../../vocabulary/time');
    });
  });

  describe('Single Item', () => {
    it('renders correctly with a single next step', () => {
      const singleItem: NextStepItem[] = [
        {
          title: 'Verb Conjugation',
          description: 'Master the art of Japanese verb conjugation',
          to: '../conjugation/verbs',
        },
      ];

      render(<NextSteps items={singleItem} />);

      expect(screen.getByText('Verb Conjugation')).toBeInTheDocument();
      expect(screen.getByText('Master the art of Japanese verb conjugation')).toBeInTheDocument();
      expect(screen.getAllByText('→')).toHaveLength(1);
    });
  });

  describe('Multiple Items', () => {
    it('renders correctly with three or more items', () => {
      const multipleItems: NextStepItem[] = [
        {
          title: 'Numbers',
          description: 'Learn basic numbers',
          to: './numbers',
        },
        {
          title: 'Counters',
          description: 'Learn frequency expressions',
          to: './counters',
        },
        {
          title: 'Dates',
          description: 'Apply numbers to dates',
          to: './dates',
        },
      ];

      render(<NextSteps items={multipleItems} />);

      expect(screen.getByText('Numbers')).toBeInTheDocument();
      expect(screen.getByText('Counters')).toBeInTheDocument();
      expect(screen.getByText('Dates')).toBeInTheDocument();
      expect(screen.getAllByText('→')).toHaveLength(3);
    });
  });

  describe('Content Structure', () => {
    it('wraps each card with proper structure', () => {
      render(<NextSteps items={mockItems} />);

      const readingNumbersTitle = screen.getByText('Reading Numbers');
      const readingNumbersDesc = screen.getByText('Learn how to pronounce any number with sound changes and special cases');

      // Both should be within the same link
      const link = readingNumbersTitle.closest('a');
      expect(link).toContainElement(readingNumbersDesc);
    });

    it('uses h4 for card titles', () => {
      render(<NextSteps items={mockItems} />);

      const title = screen.getByText('Reading Numbers');
      expect(title.tagName).toBe('H4');
    });

    it('uses h2 for section title', () => {
      render(<NextSteps items={mockItems} />);

      const sectionTitle = screen.getByText('Next Steps');
      expect(sectionTitle.tagName).toBe('H2');
    });

    it('uses paragraph for descriptions', () => {
      render(<NextSteps items={mockItems} />);

      const description = screen.getByText('Learn how to pronounce any number with sound changes and special cases');
      expect(description.tagName).toBe('P');
    });
  });

  describe('Special Characters in Content', () => {
    it('handles special characters in titles and descriptions', () => {
      const itemsWithSpecialChars: NextStepItem[] = [
        {
          title: 'Learn "Quotations" & Symbols',
          description: "Master expressions like 'once a week' and <special> cases",
          to: './special',
        },
      ];

      render(<NextSteps items={itemsWithSpecialChars} />);

      expect(screen.getByText('Learn "Quotations" & Symbols')).toBeInTheDocument();
      expect(screen.getByText("Master expressions like 'once a week' and <special> cases")).toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    it('renders container even with no items', () => {
      render(<NextSteps items={[]} />);

      expect(screen.getByText('Next Steps')).toBeInTheDocument();
      expect(screen.getByText("Once you're comfortable with this lesson, check out:")).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('renders semantic HTML structure', () => {
      const { container } = render(<NextSteps items={mockItems} />);

      // Check for proper heading hierarchy
      const h2 = container.querySelector('h2');
      const h4s = container.querySelectorAll('h4');

      expect(h2).toBeInTheDocument();
      expect(h4s).toHaveLength(2);
    });

    it('renders links with accessible content', () => {
      render(<NextSteps items={mockItems} />);

      const links = screen.getAllByRole('link');
      expect(links).toHaveLength(2);

      // Each link should contain visible text
      links.forEach(link => {
        expect(link).toHaveTextContent(/./);
      });
    });
  });
});

