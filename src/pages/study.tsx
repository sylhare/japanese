import useBaseUrl from '@docusaurus/useBaseUrl';
import Layout from '@theme/Layout';
import clsx from 'clsx';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { type VocabularyItem, getTagPath } from '../data/vocabulary-types';
import vocabularyYamlData from '../data/vocabulary.yaml';
import {
  DEFAULT_SETTINGS,
  applySettings,
  buildQuestion,
  computeStats,
  listSources,
  listTypes,
  loadProgress,
  loadSettings,
  recordAnswer,
  resetProgress,
  saveProgress,
  saveSettings,
  selectItem,
  studyableItems,
} from '../lib/study';
import type { Question, StudyProgress, StudySettings } from '../lib/study';
import styles from './study.module.css';

const allStudyable: VocabularyItem[] = studyableItems(vocabularyYamlData.vocabulary);
const allSources = listSources(allStudyable);
const allTypes = listTypes(allStudyable);

export default function Study(): React.JSX.Element {
  const baseUrl = useBaseUrl('/');
  const [mounted, setMounted] = useState(false);
  const [progress, setProgress] = useState<StudyProgress>({});
  const [settings, setSettings] = useState<StudySettings>(DEFAULT_SETTINGS);
  const [question, setQuestion] = useState<Question | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  const progressRef = useRef(progress);
  useEffect(() => {
    progressRef.current = progress;
  }, [progress]);

  useEffect(() => {
    setProgress(loadProgress(window.localStorage));
    setSettings(loadSettings(window.localStorage));
    setMounted(true);
  }, []);

  const pool = useMemo(() => applySettings(allStudyable, settings), [settings]);

  const newQuestion = useCallback(
    (excludeId?: string) => {
      const item = selectItem(pool, progressRef.current, Math.random, excludeId);
      setSelected(null);
      setQuestion(item ? buildQuestion(item, pool, progressRef.current, Math.random) : null);
    },
    [pool],
  );

  useEffect(() => {
    if (mounted) {
      newQuestion();
    }
  }, [mounted, newQuestion]);

  const stats = useMemo(() => computeStats(progress), [progress]);
  const accuracy = stats.answered > 0 ? Math.round((stats.correct / stats.answered) * 100) : 0;

  const handleAnswer = (option: string) => {
    if (selected || !question) {
      return;
    }
    setSelected(option);
    const correct = option === question.answer;
    setProgress(prev => {
      const updated = recordAnswer(prev, question.item.id, correct);
      saveProgress(window.localStorage, updated);
      return updated;
    });
  };

  const handleNext = () => newQuestion(question?.item.id);

  const toggleExcluded = (list: string[], value: string): string[] =>
    list.includes(value) ? list.filter(entry => entry !== value) : [...list, value];

  const updateSettings = (next: StudySettings) => {
    setSettings(next);
    saveSettings(window.localStorage, next);
  };

  const toggleSource = (source: string) =>
    updateSettings({ ...settings, excludedSources: toggleExcluded(settings.excludedSources, source) });

  const toggleType = (type: string) =>
    updateSettings({ ...settings, excludedTypes: toggleExcluded(settings.excludedTypes, type) });

  const handleReset = () => {
    resetProgress(window.localStorage);
    setProgress({});
    progressRef.current = {};
    newQuestion();
  };

  const renderTags = (tags: string[]) => (
    <div className={styles.tags}>
      {tags.map(tag => {
        const tagUrl = `${baseUrl}${getTagPath(tag)}`;
        return (
          <a
            key={tag}
            href={tagUrl}
            className={styles.tag}
            onClick={e => {
              e.preventDefault();
              window.location.href = tagUrl;
            }}
          >
            {tag}
          </a>
        );
      })}
    </div>
  );

  return (
    <Layout title="Study" description="Practice Japanese vocabulary with multiple-choice flashcards">
      <div className="container margin-vert--lg">
        <div className="row">
          <div className="col col--8 col--offset-2">
            <h1>Study Vocabulary</h1>
            <p>
              Pick the right meaning for each word. Get a word right and it comes back in kanji —
              hiragana → English, then kanji → English. Your progress is saved on this device.
            </p>

            <div className={styles.statsBar}>
              <span className={styles.stat}>Answered: {stats.answered}</span>
              <span className={styles.stat}>Correct: {stats.correct}</span>
              <span className={styles.stat}>Accuracy: {accuracy}%</span>
              <span className={styles.stat}>Mastered: {stats.mastered}</span>
            </div>

            <div className={styles.toolbar}>
              <button
                type="button"
                className={styles.toolbarButton}
                onClick={() => setShowSettings(show => !show)}
                aria-expanded={showSettings}
              >
                {showSettings ? 'Hide settings' : 'Settings'}
              </button>
              <button type="button" className={styles.toolbarButton} onClick={handleReset}>
                Reset progress
              </button>
            </div>

            {showSettings && (
              <div className={styles.settingsPanel}>
                <SettingsGroup
                  title="Sources"
                  values={allSources}
                  excluded={settings.excludedSources}
                  onToggle={toggleSource}
                  onAll={() => updateSettings({ ...settings, excludedSources: [] })}
                  onNone={() => updateSettings({ ...settings, excludedSources: [...allSources] })}
                />
                <SettingsGroup
                  title="Word types"
                  values={allTypes}
                  excluded={settings.excludedTypes}
                  onToggle={toggleType}
                  onAll={() => updateSettings({ ...settings, excludedTypes: [] })}
                  onNone={() => updateSettings({ ...settings, excludedTypes: [...allTypes] })}
                />
              </div>
            )}

            {mounted && !question && (
              <div className={styles.empty}>
                <h3>No words to study</h3>
                <p>Enable at least one source and word type in the settings to start.</p>
              </div>
            )}

            {question && (
              <div className={styles.quizCard}>
                <div className={styles.promptLabel}>What does this mean?</div>
                <div
                  className={clsx(
                    styles.prompt,
                    question.promptMode === 'kanji' && styles.promptKanji,
                  )}
                >
                  {question.prompt}
                </div>
                <div className={styles.promptType}>{question.item.type}</div>

                <div className={styles.options}>
                  {question.options.map(option => {
                    const isAnswer = option === question.answer;
                    const isPicked = option === selected;
                    return (
                      <button
                        type="button"
                        key={option}
                        className={clsx(
                          styles.option,
                          selected && isAnswer && styles.optionCorrect,
                          selected && isPicked && !isAnswer && styles.optionIncorrect,
                        )}
                        disabled={Boolean(selected)}
                        onClick={() => handleAnswer(option)}
                      >
                        {option}
                      </button>
                    );
                  })}
                </div>

                {selected && (
                  <div className={styles.reveal}>
                    <div
                      className={clsx(
                        styles.feedback,
                        selected === question.answer
                          ? styles.feedbackCorrect
                          : styles.feedbackIncorrect,
                      )}
                    >
                      {selected === question.answer ? 'Correct!' : 'Incorrect'}
                    </div>

                    <div className={styles.detail}>
                      {question.item.kanji && (
                        <div className={styles.detailKanji}>{question.item.kanji}</div>
                      )}
                      <div className={styles.detailHiragana}>
                        {question.item.hiragana || question.item.katakana}
                      </div>
                      <div className={styles.detailRomaji}>{question.item.romaji}</div>
                      <div className={styles.detailMeaning}>{question.item.meaning}</div>
                      <div className={styles.detailType}>{question.item.type}</div>
                      {renderTags(question.item.tags)}
                    </div>

                    <button type="button" className={styles.nextButton} onClick={handleNext}>
                      Next
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}

interface SettingsGroupProps {
  title: string;
  values: string[];
  excluded: string[];
  onToggle: (value: string) => void;
  onAll: () => void;
  onNone: () => void;
}

function SettingsGroup({
  title,
  values,
  excluded,
  onToggle,
  onAll,
  onNone,
}: SettingsGroupProps): React.JSX.Element {
  const excludedSet = new Set(excluded);
  return (
    <div className={styles.settingsGroup}>
      <div className={styles.settingsHeader}>
        <strong>{title}</strong>
        <span className={styles.settingsActions}>
          <button type="button" className={styles.linkButton} onClick={onAll}>
            All
          </button>
          <button type="button" className={styles.linkButton} onClick={onNone}>
            None
          </button>
        </span>
      </div>
      <div className={styles.checklist}>
        {values.map(value => (
          <label key={value} className={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={!excludedSet.has(value)}
              onChange={() => onToggle(value)}
            />
            {value}
          </label>
        ))}
      </div>
    </div>
  );
}
