import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import HomepageFeatures from '../../src/components/HomepageFeatures';

// SVG mocks are handled via vitest config aliases pointing to mock files
vi.mock('../../src/components/HomepageFeatures/styles.module.css', () => ({
  default: {
    features: 'features',
    featureSvg: 'featureSvg',
  },
}));

describe('HomepageFeatures Component', () => {
  describe('Component Rendering', () => {
    it('renders all three feature sections', () => {
      render(<HomepageFeatures />);

      expect(screen.getByText('Structured Lessons')).toBeInTheDocument();
      expect(screen.getByText('Interactive Vocabulary')).toBeInTheDocument();
      expect(screen.getByText('Quick Reference')).toBeInTheDocument();
    });

    it('renders feature descriptions', () => {
      render(<HomepageFeatures />);

      expect(screen.getByText(/Learn Japanese step-by-step/)).toBeInTheDocument();
      expect(screen.getByText(/Search and explore Japanese vocabulary/)).toBeInTheDocument();
      expect(screen.getByText(/Access kana charts/)).toBeInTheDocument();
    });

    it('renders SVG images for each feature', () => {
      render(<HomepageFeatures />);

      const images = screen.getAllByRole('img');
      expect(images).toHaveLength(3);
    });
  });

  describe('Content Accuracy', () => {
    it('displays Structured Lessons feature correctly', () => {
      render(<HomepageFeatures />);

      expect(screen.getByText('Structured Lessons')).toBeInTheDocument();
      expect(screen.getByText(/organized lessons covering hiragana, katakana/)).toBeInTheDocument();
    });

    it('displays Interactive Vocabulary feature correctly', () => {
      render(<HomepageFeatures />);

      expect(screen.getByText('Interactive Vocabulary')).toBeInTheDocument();
      expect(screen.getByText(/comprehensive database/)).toBeInTheDocument();
    });

    it('displays Quick Reference feature correctly', () => {
      render(<HomepageFeatures />);

      expect(screen.getByText('Quick Reference')).toBeInTheDocument();
      expect(screen.getByText(/conjugation tables/)).toBeInTheDocument();
    });
  });

  describe('Structure and Layout', () => {
    it('renders within a section element', () => {
      const { container } = render(<HomepageFeatures />);

      const section = container.querySelector('section');
      expect(section).toBeInTheDocument();
      expect(section).toHaveClass('features');
    });

    it('renders container and row structure', () => {
      const { container } = render(<HomepageFeatures />);

      expect(container.querySelector('.container')).toBeInTheDocument();
      expect(container.querySelector('.row')).toBeInTheDocument();
    });

    it('renders each feature in a column', () => {
      const { container } = render(<HomepageFeatures />);

      const columns = container.querySelectorAll('.col--4');
      expect(columns).toHaveLength(3);
    });
  });

  describe('Semantic HTML', () => {
    it('uses h3 headings for feature titles', () => {
      render(<HomepageFeatures />);

      const headings = screen.getAllByRole('heading', { level: 3 });
      expect(headings).toHaveLength(3);
    });

    it('uses proper heading text', () => {
      render(<HomepageFeatures />);

      const headings = screen.getAllByRole('heading', { level: 3 });
      expect(headings[0]).toHaveTextContent('Structured Lessons');
      expect(headings[1]).toHaveTextContent('Interactive Vocabulary');
      expect(headings[2]).toHaveTextContent('Quick Reference');
    });

    it('uses paragraph elements for descriptions', () => {
      const { container } = render(<HomepageFeatures />);

      const paragraphs = container.querySelectorAll('p');
      expect(paragraphs.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('Accessibility', () => {
    it('renders images with role="img"', () => {
      render(<HomepageFeatures />);

      const images = screen.getAllByRole('img');
      images.forEach(img => {
        expect(img).toBeInTheDocument();
      });
    });

    it('maintains consistent heading hierarchy', () => {
      render(<HomepageFeatures />);

      const h3Headings = screen.getAllByRole('heading', { level: 3 });
      expect(h3Headings).toHaveLength(3);
    });
  });

  describe('CSS Classes', () => {
    it('applies featureSvg class to SVG images', () => {
      render(<HomepageFeatures />);

      const images = screen.getAllByRole('img');
      images.forEach(img => {
        expect(img).toHaveClass('featureSvg');
      });
    });

    it('applies text-center classes for alignment', () => {
      const { container } = render(<HomepageFeatures />);

      const textCenterElements = container.querySelectorAll('.text--center');
      // Each feature has 2 text-center divs (one for SVG, one for text)
      expect(textCenterElements.length).toBe(6);
    });
  });
});
