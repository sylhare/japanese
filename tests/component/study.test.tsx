import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { splitKanjiWord } from '../../src/lib/study';
import Study from '../../src/pages/study';
import { studyMockItems } from '../__fixtures__/component/study-mock-data';

vi.mock('../../src/data/vocabulary.yaml', async () => {
  const { studyMockVocabularyData } = await import('../__fixtures__/component/study-mock-data');
  return { default: studyMockVocabularyData };
});

vi.mock('../../src/pages/study.module.css', () => ({ default: {} }));

const mockItems = studyMockItems;
const meanings = mockItems.map(i => i.meaning);

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

  it('hides choices and shows explanation after an answer is selected', async () => {
    const user = userEvent.setup();
    render(<Study />);
    const correct = shownMeaning();
    const optionButtons = screen.getAllByRole('button').filter(b => meanings.includes(b.textContent ?? ''));
    expect(optionButtons.length).toBeGreaterThan(0);

    await user.click(screen.getByRole('button', { name: correct }));

    const choicesAfter = screen.queryAllByRole('button').filter(b => meanings.includes(b.textContent ?? ''));
    expect(choicesAfter).toHaveLength(0);
    expect(screen.getByRole('button', { name: 'Next' })).toBeInTheDocument();
    expect(screen.getByText('Correct!')).toBeInTheDocument();
  });

  it('shows choices again after pressing Next', async () => {
    const user = userEvent.setup();
    render(<Study />);
    await user.click(screen.getByRole('button', { name: shownMeaning() }));
    await user.click(screen.getByRole('button', { name: 'Next' }));

    expect(screen.queryByText('Correct!')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Next' })).not.toBeInTheDocument();
    const choicesBack = screen.getAllByRole('button').filter(b => meanings.includes(b.textContent ?? ''));
    expect(choicesBack.length).toBeGreaterThan(0);
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

  it('switches between Learn Meaning and Learn Kanji modes', async () => {
    const user = userEvent.setup();
    render(<Study />);

    const meaningTab = screen.getByRole('tab', { name: 'Learn Meaning' });
    const kanjiTab = screen.getByRole('tab', { name: 'Learn Kanji' });
    expect(meaningTab).toHaveAttribute('aria-selected', 'true');
    expect(kanjiTab).toHaveAttribute('aria-selected', 'false');

    await user.click(kanjiTab);
    expect(kanjiTab).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByText('How do you read this kanji?')).toBeInTheDocument();

    const kanjiStemReadings = mockItems.map(i => splitKanjiWord(i.kanji ?? '', i.hiragana).targetReading);
    const optionButtons = screen
      .getAllByRole('button')
      .filter(b => kanjiStemReadings.includes(b.textContent ?? ''));
    expect(optionButtons).toHaveLength(4);
  });

  it('renders target kanji with brackets, matches stem, and reveals detail in kanji mode', async () => {
    const user = userEvent.setup();
    render(<Study />);

    await user.click(screen.getByRole('tab', { name: 'Learn Kanji' }));

    const targetSpan = screen.getByText(/【.+】/);
    expect(targetSpan).toBeInTheDocument();

    const match = targetSpan.textContent?.match(/【(.+)】/);
    expect(match).not.toBeNull();
    const targetKanji = match?.[1] ?? '';

    const currentItem = mockItems.find(
      i => splitKanjiWord(i.kanji ?? '', i.hiragana).targetKanji === targetKanji,
    );
    expect(currentItem).toBeDefined();
    if (!currentItem) return;

    const parts = splitKanjiWord(currentItem.kanji ?? '', currentItem.hiragana);
    const correctStem = parts.targetReading;

    const answerButton = screen.getByRole('button', { name: correctStem });
    expect(answerButton).toBeInTheDocument();

    await user.click(answerButton);

    expect(screen.getByText('Correct!')).toBeInTheDocument();
    expect(screen.getByText(currentItem.meaning)).toBeInTheDocument();
    if (currentItem.kanji) {
      expect(screen.getByText(currentItem.kanji)).toBeInTheDocument();
    }
  });

  it('renders okurigana breakdown when answering kanji word with okurigana', async () => {
    const randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0.99);
    const user = userEvent.setup();
    render(<Study />);

    await user.click(screen.getByRole('tab', { name: 'Learn Kanji' }));

    // v0 is 食べる -> kanjiParts: { prefix: '', targetKanji: '食', okurigana: 'べる', targetReading: 'た' }
    expect(screen.getByText('【食】')).toBeInTheDocument();
    expect(screen.getByText('べる')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'た' }));

    expect(screen.getByText('Correct!')).toBeInTheDocument();
    expect(screen.getByText('to eat')).toBeInTheDocument();
    expect(
      screen.getByText((_content, element) => element?.textContent === '食 (た) + べる'),
    ).toBeInTheDocument();

    randomSpy.mockRestore();
  });

  it('shows detailed why explanation when answering incorrectly in kanji mode', async () => {
    const randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0.99);
    const user = userEvent.setup();
    render(<Study />);

    await user.click(screen.getByRole('tab', { name: 'Learn Kanji' }));

    // Target is 食べる (stem: 'た')
    const kanjiStemReadings = mockItems.map(i => splitKanjiWord(i.kanji ?? '', i.hiragana).targetReading);
    const wrongButton = screen
      .getAllByRole('button')
      .find(b => kanjiStemReadings.includes(b.textContent ?? '') && b.textContent !== 'た');
    expect(wrongButton).toBeDefined();
    if (!wrongButton) return;

    await user.click(wrongButton);

    expect(screen.getByText('Incorrect')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Why?' }));

    const wrongStem = wrongButton.textContent ?? '';
    const wrongItem = mockItems.find(
      i => splitKanjiWord(i.kanji ?? '', i.hiragana).targetReading === wrongStem,
    );
    expect(
      screen.getByText(
        `"${wrongStem}" is the reading for ${wrongItem?.kanji} (${wrongItem?.hiragana}, "${wrongItem?.meaning}"), not 食べる.`,
      ),
    ).toBeInTheDocument();

    randomSpy.mockRestore();
  });

  it('reveals Why button on wrong answer and toggles bad answer details', async () => {
    const user = userEvent.setup();
    render(<Study />);
    const correct = shownMeaning();
    const wrongButton = screen
      .getAllByRole('button')
      .find(b => meanings.includes(b.textContent ?? '') && b.textContent !== correct);
    expect(wrongButton).toBeDefined();

    await user.click(wrongButton as HTMLElement);

    expect(screen.getByText('Incorrect')).toBeInTheDocument();
    expect(screen.getByText('Correct answer')).toBeInTheDocument();

    const whyButton = screen.getByRole('button', { name: 'Why?' });
    expect(whyButton).toBeInTheDocument();

    await user.click(whyButton);
    expect(screen.getByText(new RegExp(`Your answer: ${wrongButton?.textContent}`))).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Hide explanation' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Hide explanation' }));
    expect(screen.queryByText(new RegExp(`Your answer: ${wrongButton?.textContent}`))).not.toBeInTheDocument();
  });
});
