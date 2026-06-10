import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import Study from '../../src/pages/study';
import { studyMockItems } from '../__fixtures__/component/study-mock-data';

vi.mock('../../src/data/vocabulary.yaml', async () => {
  const { studyMockVocabularyData } = await import('../__fixtures__/component/study-mock-data');
  return { default: studyMockVocabularyData };
});

vi.mock('../../src/pages/study.module.css', () => ({ default: {} }));

const mockItems = studyMockItems;
const meanings = mockItems.map(i => i.meaning);

/** The only Japanese text on screen before answering is the prompt, so we can
 * map it back to the item being asked about. */
function shownMeaning(): string {
  const found = mockItems.find(i => screen.queryAllByText(i.hiragana).length > 0);
  if (!found) {
    throw new Error('No prompt rendered');
  }
  return found.meaning;
}

describe('Study page', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('renders the heading and intro', () => {
    render(<Study />);
    expect(screen.getByRole('heading', { name: 'Study Vocabulary' })).toBeInTheDocument();
  });

  it('shows a question with four meaning options', () => {
    render(<Study />);
    const correct = shownMeaning();
    const optionButtons = screen.getAllByRole('button').filter(b => meanings.includes(b.textContent ?? ''));
    expect(optionButtons).toHaveLength(4);
    expect(optionButtons.map(b => b.textContent)).toContain(correct);
  });

  it('marks a correct answer and reveals the word details', async () => {
    const user = userEvent.setup();
    render(<Study />);
    const correct = shownMeaning();

    await user.click(screen.getByRole('button', { name: correct }));

    expect(screen.getByText('Correct!')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Next' })).toBeInTheDocument();

    const tagLink = screen.getAllByRole('link')[0];
    expect(tagLink.getAttribute('href')).toMatch(/^\/docs\/lessons\//);
  });

  it('marks a wrong answer as incorrect', async () => {
    const user = userEvent.setup();
    render(<Study />);
    const correct = shownMeaning();
    const wrongButton = screen
      .getAllByRole('button')
      .find(b => meanings.includes(b.textContent ?? '') && b.textContent !== correct);
    expect(wrongButton).toBeDefined();

    await user.click(wrongButton as HTMLElement);

    expect(screen.getByText('Incorrect')).toBeInTheDocument();
  });

  it('advances to the next question and updates stats', async () => {
    const user = userEvent.setup();
    render(<Study />);
    await user.click(screen.getByRole('button', { name: shownMeaning() }));
    await user.click(screen.getByRole('button', { name: 'Next' }));

    expect(screen.getByText('Answered: 1')).toBeInTheDocument();
    expect(screen.queryByText('Correct!')).not.toBeInTheDocument();
  });

  it('shows an empty state when all word types are excluded', async () => {
    const user = userEvent.setup();
    render(<Study />);
    await user.click(screen.getByRole('button', { name: 'Settings' }));

    const noneButtons = screen.getAllByRole('button', { name: 'None' });
    await user.click(noneButtons[1]);

    expect(screen.getByText('No words to study')).toBeInTheDocument();
  });

  it('resets progress', async () => {
    const user = userEvent.setup();
    render(<Study />);
    await user.click(screen.getByRole('button', { name: shownMeaning() }));
    await user.click(screen.getByRole('button', { name: 'Next' }));
    expect(screen.getByText('Answered: 1')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Reset progress' }));
    expect(screen.getByText('Answered: 0')).toBeInTheDocument();
  });

  it('persists progress to localStorage', async () => {
    const user = userEvent.setup();
    render(<Study />);
    await user.click(screen.getByRole('button', { name: shownMeaning() }));

    expect(window.localStorage.getItem('japanese-study-progress-v1')).toBeTruthy();
  });
});
