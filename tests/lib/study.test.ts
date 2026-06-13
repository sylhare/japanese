import { describe, expect, it } from 'vitest';
import type { VocabularyItem } from '../../src/data/vocabulary-types';
import {
  MASTER_STREAK,
  OPTION_COUNT,
  PROMOTE_STREAK,
  applySettings,
  baseScript,
  buildQuestion,
  computeStats,
  isStudyable,
  itemWeight,
  listSources,
  listTypes,
  loadProgress,
  loadSettings,
  pickDistractors,
  promptModeFor,
  promptTextFor,
  recordAnswer,
  resetProgress,
  saveProgress,
  saveSettings,
  selectItem,
  shuffle,
  studyableItems,
} from '../../src/lib/study';
import type { Rng, StudyProgress, StudyStorage } from '../../src/lib/study';

function item(overrides: Partial<VocabularyItem> = {}): VocabularyItem {
  return {
    id: 'id_0',
    hiragana: 'あか',
    kanji: '赤',
    romaji: 'aka',
    meaning: 'red',
    category: 'vocabulary',
    tags: ['colors'],
    type: 'noun',
    ...overrides,
  };
}

/** Deterministic rng that cycles through the provided values. */
function seqRng(values: number[]): Rng {
  let i = 0;
  return () => values[i++ % values.length];
}

/** A simple in-memory storage stand-in for the persistence helpers. */
function memoryStorage(): StudyStorage {
  const map = new Map<string, string>();
  return {
    getItem: (key: string) => map.get(key) ?? null,
    removeItem: (key: string) => {
      map.delete(key);
    },
    setItem: (key: string, value: string) => {
      map.set(key, value);
    },
  };
}

describe('baseScript', () => {
  it('prefers hiragana', () => {
    expect(baseScript(item({ hiragana: 'あか', katakana: 'アカ' }))).toBe('あか');
  });

  it('falls back to katakana when hiragana is missing', () => {
    expect(baseScript(item({ hiragana: '', katakana: 'コーヒー' }))).toBe('コーヒー');
  });

  it('is empty when neither kana is present', () => {
    expect(baseScript(item({ hiragana: '', katakana: undefined }))).toBe('');
  });
});

describe('isStudyable', () => {
  it('accepts an item with kana, meaning and a real type', () => {
    expect(isStudyable(item())).toBe(true);
  });

  it('rejects items without a base reading', () => {
    expect(isStudyable(item({ hiragana: '', katakana: undefined }))).toBe(false);
  });

  it('rejects items without a meaning', () => {
    expect(isStudyable(item({ meaning: '' }))).toBe(false);
  });

  it('rejects items with the "unknown" type', () => {
    expect(isStudyable(item({ type: 'unknown' }))).toBe(false);
  });

  it('rejects items with no type', () => {
    expect(isStudyable(item({ type: undefined }))).toBe(false);
  });
});

describe('studyableItems', () => {
  it('filters out non-studyable items', () => {
    const items = [item({ id: 'a' }), item({ id: 'b', type: 'unknown' }), item({ id: 'c', meaning: '' })];
    expect(studyableItems(items).map(i => i.id)).toEqual(['a']);
  });
});

describe('listSources and listTypes', () => {
  const items = [
    item({ id: 'a', tags: ['colors'], type: 'noun' }),
    item({ id: 'b', tags: ['family', 'colors'], type: 'verb' }),
    item({ id: 'c', tags: ['family'], type: 'noun' }),
  ];

  it('returns distinct sorted sources', () => {
    expect(listSources(items)).toEqual(['colors', 'family']);
  });

  it('returns distinct sorted types', () => {
    expect(listTypes(items)).toEqual(['noun', 'verb']);
  });
});

describe('applySettings', () => {
  const items = [
    item({ id: 'a', tags: ['colors'], type: 'noun' }),
    item({ id: 'b', tags: ['family'], type: 'verb' }),
    item({ id: 'c', tags: ['colors', 'family'], type: 'noun' }),
  ];

  it('keeps everything when nothing is excluded', () => {
    expect(applySettings(items, { excludedSources: [], excludedTypes: [] }).map(i => i.id)).toEqual([
      'a',
      'b',
      'c',
    ]);
  });

  it('excludes items by type', () => {
    const result = applySettings(items, { excludedSources: [], excludedTypes: ['verb'] });
    expect(result.map(i => i.id)).toEqual(['a', 'c']);
  });

  it('drops an item only when all of its sources are excluded', () => {
    const result = applySettings(items, { excludedSources: ['colors'], excludedTypes: [] });

    expect(result.map(i => i.id)).toEqual(['b', 'c']);
  });
});

describe('promptModeFor', () => {
  it('shows hiragana before the promote streak is reached', () => {
    expect(promptModeFor(item(), {})).toBe('hiragana');
  });

  it('shows kanji once the streak reaches the threshold', () => {
    const progress: StudyProgress = { id_0: { correct: 1, incorrect: 0, streak: PROMOTE_STREAK } };
    expect(promptModeFor(item(), progress)).toBe('kanji');
  });

  it('stays on hiragana for items without kanji', () => {
    const progress: StudyProgress = { id_0: { correct: 5, incorrect: 0, streak: 5 } };
    expect(promptModeFor(item({ kanji: undefined }), progress)).toBe('hiragana');
  });
});

describe('promptTextFor', () => {
  it('returns kanji in kanji mode', () => {
    expect(promptTextFor(item(), 'kanji')).toBe('赤');
  });

  it('returns the base reading in hiragana mode', () => {
    expect(promptTextFor(item(), 'hiragana')).toBe('あか');
  });

  it('falls back to the base reading when kanji is missing even in kanji mode', () => {
    expect(promptTextFor(item({ kanji: undefined }), 'kanji')).toBe('あか');
  });
});

describe('shuffle', () => {
  it('is a permutation of the input', () => {
    const result = shuffle([1, 2, 3, 4], seqRng([0.1, 0.5, 0.9, 0.3]));
    expect(result.sort()).toEqual([1, 2, 3, 4]);
  });

  it('does not mutate the input', () => {
    const input = [1, 2, 3];
    shuffle(input, seqRng([0]));
    expect(input).toEqual([1, 2, 3]);
  });
});

describe('pickDistractors', () => {
  const pool = [
    item({ id: 'a', meaning: 'red', type: 'noun' }),
    item({ id: 'b', meaning: 'blue', type: 'noun' }),
    item({ id: 'c', meaning: 'green', type: 'noun' }),
    item({ id: 'd', meaning: 'fast', type: 'い-adjective' }),
  ];

  it('prefers same-type items with different meanings', () => {
    const distractors = pickDistractors(pool[0], pool, 2, seqRng([0]));
    expect(distractors).toHaveLength(2);
    distractors.forEach(d => {
      expect(d.type).toBe('noun');
      expect(d.meaning).not.toBe('red');
    });
  });

  it('never repeats a meaning', () => {
    const withDup = [...pool, item({ id: 'e', meaning: 'blue', type: 'noun' })];
    const distractors = pickDistractors(withDup[0], withDup, 3, seqRng([0]));
    const meanings = distractors.map(d => d.meaning);
    expect(new Set(meanings).size).toBe(meanings.length);
  });

  it('falls back to other types when not enough same-type items exist', () => {
    const small = [item({ id: 'a', meaning: 'red', type: 'noun' }), pool[3]];
    const distractors = pickDistractors(small[0], small, 3, seqRng([0]));
    expect(distractors.map(d => d.meaning)).toEqual(['fast']);
  });
});

describe('buildQuestion', () => {
  const pool = [
    item({ id: 'a', meaning: 'red', type: 'noun' }),
    item({ id: 'b', meaning: 'blue', type: 'noun' }),
    item({ id: 'c', meaning: 'green', type: 'noun' }),
    item({ id: 'd', meaning: 'yellow', type: 'noun' }),
  ];

  it('produces OPTION_COUNT distinct options including the answer', () => {
    const question = buildQuestion(pool[0], pool, {}, seqRng([0.2, 0.7, 0.4]));
    expect(question.options).toHaveLength(OPTION_COUNT);
    expect(question.options).toContain('red');
    expect(new Set(question.options).size).toBe(OPTION_COUNT);
    expect(question.answer).toBe('red');
  });

  it('uses the prompt mode derived from progress', () => {
    const progress: StudyProgress = { a: { correct: 1, incorrect: 0, streak: PROMOTE_STREAK } };
    const question = buildQuestion(pool[0], pool, progress, seqRng([0]));
    expect(question.promptMode).toBe('kanji');
    expect(question.prompt).toBe('赤');
  });
});

describe('itemWeight', () => {
  it('weights unseen items highest', () => {
    expect(itemWeight({}, 'x')).toBe(4);
  });

  it('weights items lower as their streak grows', () => {
    expect(itemWeight({ x: { correct: 0, incorrect: 1, streak: 0 } }, 'x')).toBe(3);
    expect(itemWeight({ x: { correct: 1, incorrect: 0, streak: 1 } }, 'x')).toBe(2);
    expect(itemWeight({ x: { correct: 3, incorrect: 0, streak: 3 } }, 'x')).toBe(1);
  });
});

describe('selectItem', () => {
  const items = [item({ id: 'a' }), item({ id: 'b' }), item({ id: 'c' })];

  it('returns null for an empty pool', () => {
    expect(selectItem([], {}, seqRng([0]))).toBeNull();
  });

  it('picks deterministically given the rng and weights', () => {

    expect(selectItem(items, {}, seqRng([0.5]))?.id).toBe('b');
  });

  it('avoids the excluded id when other items exist', () => {
    const picked = selectItem(items, {}, seqRng([0]), 'a');
    expect(picked?.id).not.toBe('a');
  });

  it('returns the only item even if it is excluded', () => {
    const single = [item({ id: 'only' })];
    expect(selectItem(single, {}, seqRng([0]), 'only')?.id).toBe('only');
  });
});

describe('recordAnswer', () => {
  it('increments correct and streak on a correct answer', () => {
    const result = recordAnswer({}, 'x', true);
    expect(result.x).toEqual({ correct: 1, incorrect: 0, streak: 1 });
  });

  it('increments incorrect and resets streak on a wrong answer', () => {
    const start: StudyProgress = { x: { correct: 2, incorrect: 0, streak: 2 } };
    const result = recordAnswer(start, 'x', false);
    expect(result.x).toEqual({ correct: 2, incorrect: 1, streak: 0 });
  });

  it('does not mutate the previous progress', () => {
    const start: StudyProgress = { x: { correct: 1, incorrect: 0, streak: 1 } };
    recordAnswer(start, 'x', true);
    expect(start.x.streak).toBe(1);
  });
});

describe('computeStats', () => {
  it('aggregates answered, correct and mastered counts', () => {
    const progress: StudyProgress = {
      a: { correct: 3, incorrect: 1, streak: MASTER_STREAK },
      b: { correct: 1, incorrect: 2, streak: 0 },
    };
    expect(computeStats(progress)).toEqual({ answered: 7, correct: 4, mastered: 1 });
  });

  it('returns zeroes for empty progress', () => {
    expect(computeStats({})).toEqual({ answered: 0, correct: 0, mastered: 0 });
  });
});

describe('persistence', () => {
  it('round-trips progress through storage', () => {
    const storage = memoryStorage();
    const progress: StudyProgress = { x: { correct: 1, incorrect: 0, streak: 1 } };
    saveProgress(storage, progress);
    expect(loadProgress(storage)).toEqual(progress);
  });

  it('returns empty progress when nothing is stored', () => {
    expect(loadProgress(memoryStorage())).toEqual({});
  });

  it('returns empty progress for corrupt JSON', () => {
    const storage = memoryStorage();
    storage.setItem('japanese-study-progress-v1', '{not json');
    expect(loadProgress(storage)).toEqual({});
  });

  it('round-trips settings and defaults missing fields', () => {
    const storage = memoryStorage();
    saveSettings(storage, { excludedSources: ['colors'], excludedTypes: ['verb'] });
    expect(loadSettings(storage)).toEqual({ excludedSources: ['colors'], excludedTypes: ['verb'] });
  });

  it('returns default settings when fields are not arrays', () => {
    const storage = memoryStorage();
    storage.setItem('japanese-study-settings-v1', JSON.stringify({ excludedSources: 'oops' }));
    expect(loadSettings(storage)).toEqual({ excludedSources: [], excludedTypes: [] });
  });

  it('clears progress on reset without touching settings', () => {
    const storage = memoryStorage();
    saveProgress(storage, { x: { correct: 1, incorrect: 0, streak: 1 } });
    saveSettings(storage, { excludedSources: ['colors'], excludedTypes: [] });
    resetProgress(storage);
    expect(loadProgress(storage)).toEqual({});
    expect(loadSettings(storage).excludedSources).toEqual(['colors']);
  });
});
