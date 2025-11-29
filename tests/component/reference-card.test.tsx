import {render, screen} from '@testing-library/react';
import React from 'react';
import {describe, expect, it, vi} from 'vitest';
import ReferenceCardGrid, {ReferenceCard} from '../../src/components/ReferenceCard';

vi.mock('@docusaurus/Link', () => ({
  default: ({ to, children, className }: { to: string; children: React.ReactNode; className?: string }) => (
    <a href={to} className={className}>
      {children}
    </a>
  ),
}));

vi.mock('../../src/components/ReferenceCard/styles.module.css', () => ({
  default: {
    cardGrid: 'cardGrid',
    card: 'card',
    cardTitle: 'cardTitle',
    cardDescription: 'cardDescription',
    cardLink: 'cardLink',
  },
}));

describe('ReferenceCard', () => {
  describe('Component Rendering', () => {
    it('renders a reference card with all props', () => {
      render(
        <ReferenceCard
          emoji="📝"
          title="Test Card"
          description="This is a test description"
          href="/test"
          linkText="View Test"
        />,
      );

      expect(screen.getByText(/Test Card/)).toBeInTheDocument();
      expect(screen.getByText('This is a test description')).toBeInTheDocument();
      expect(screen.getByText('View Test →')).toBeInTheDocument();
    });

    it('renders emoji in the title', () => {
      render(
        <ReferenceCard
          emoji="📚"
          title="Dictionary"
          description="Search vocabulary"
          href="/dictionary"
          linkText="Open Dictionary"
        />,
      );

      const heading = screen.getByRole('heading', {level: 3});
      expect(heading.textContent).toContain('📚');
      expect(heading.textContent).toContain('Dictionary');
    });

    it('renders link with correct href', () => {
      render(
        <ReferenceCard
          emoji="📝"
          title="Test"
          description="Test description"
          href="/test-path"
          linkText="Click Here"
        />,
      );

      const link = screen.getByText('Click Here →');
      expect(link).toHaveAttribute('href', '/test-path');
    });

    it('renders multiple cards independently', () => {
      const {container} = render(
        <>
          <ReferenceCard
            emoji="📝"
            title="Card 1"
            description="Description 1"
            href="/card1"
            linkText="View Card 1"
          />
          <ReferenceCard
            emoji="📚"
            title="Card 2"
            description="Description 2"
            href="/card2"
            linkText="View Card 2"
          />
        </>,
      );

      const headings = screen.getAllByRole('heading', {level: 3});
      expect(headings[0].textContent).toContain('Card 1');
      expect(headings[1].textContent).toContain('Card 2');
      expect(screen.getByText('Description 1')).toBeInTheDocument();
      expect(screen.getByText('Description 2')).toBeInTheDocument();
    });
  });

  describe('ReferenceCardGrid', () => {
    it('renders a grid container with children', () => {
      render(
        <ReferenceCardGrid>
          <ReferenceCard
            emoji="📝"
            title="Card 1"
            description="Description 1"
            href="/card1"
            linkText="View Card 1"
          />
          <ReferenceCard
            emoji="📚"
            title="Card 2"
            description="Description 2"
            href="/card2"
            linkText="View Card 2"
          />
        </ReferenceCardGrid>,
      );

      const headings = screen.getAllByRole('heading', {level: 3});
      expect(headings[0].textContent).toContain('Card 1');
      expect(headings[1].textContent).toContain('Card 2');
    });

    it('renders empty grid when no children provided', () => {
      const {container} = render(<ReferenceCardGrid>{null}</ReferenceCardGrid>);

      const grid = container.querySelector('.cardGrid');
      expect(grid).toBeInTheDocument();
      expect(grid?.children.length).toBe(0);
    });

    it('renders grid with single child', () => {
      render(
        <ReferenceCardGrid>
          <ReferenceCard
            emoji="📝"
            title="Single Card"
            description="Only one card"
            href="/single"
            linkText="View Single"
          />
        </ReferenceCardGrid>,
      );

      expect(screen.getByText(/Single Card/)).toBeInTheDocument();
    });
  });

  describe('Content Variations', () => {
    it('handles long descriptions', () => {
      const longDescription =
        'This is a very long description that contains multiple sentences and should still render correctly within the card component without any issues.';

      render(
        <ReferenceCard
          emoji="📝"
          title="Test"
          description={longDescription}
          href="/test"
          linkText="View Test"
        />,
      );

      expect(screen.getByText(longDescription)).toBeInTheDocument();
    });

    it('handles different emoji types', () => {
      const emojis = ['📝', '📚', '🎌', '✨'];

      emojis.forEach((emoji, index) => {
        const {rerender} = render(
          <ReferenceCard
            emoji={emoji}
            title={`Card ${index}`}
            description="Description"
            href="/test"
            linkText="View"
          />,
        );

        const title = screen.getByText(new RegExp(`Card ${index}`));
        expect(title.textContent).toContain(emoji);

        if (index < emojis.length - 1) {
          rerender(<div />);
        }
      });
    });

    it('handles link text variations', () => {
      const linkTexts = ['View Chart', 'Open Dictionary', 'Browse Vocabulary'];

      linkTexts.forEach((linkText) => {
        render(
          <ReferenceCard
            emoji="📝"
            title="Test"
            description="Description"
            href="/test"
            linkText={linkText}
          />,
        );

        expect(screen.getByText(`${linkText} →`)).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('renders semantic HTML structure', () => {
      const {container} = render(
        <ReferenceCard
          emoji="📝"
          title="Test Card"
          description="Test description"
          href="/test"
          linkText="View Test"
        />,
      );

      expect(container.querySelector('h3')).toBeInTheDocument();
      expect(container.querySelector('p')).toBeInTheDocument();
      expect(container.querySelector('a')).toBeInTheDocument();
    });

    it('ensures heading hierarchy is correct', () => {
      render(
        <ReferenceCard
          emoji="📝"
          title="Test Heading"
          description="Description"
          href="/test"
          linkText="View"
        />,
      );

      const heading = screen.getByRole('heading', {level: 3});
      expect(heading).toBeInTheDocument();
      expect(heading.textContent).toContain('Test Heading');
    });
  });
});

