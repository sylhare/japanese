import type { VocabularyItem } from '../data/vocabulary-types';

/** Which script the learner is shown when guessing the meaning. */
export type PromptMode = 'hiragana' | 'kanji';

/** Study mode: learning meaning from hiragana, or learning kanji readings. */
export type StudyMode = 'meaning' | 'kanji';

/** A source-of-randomness in the [0, 1) range, injectable for testing. */
export type Rng = () => number;

/** The subset of the Web Storage API the persistence helpers rely on. */
export interface StudyStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export interface ItemProgress {
  correct: number;
  incorrect: number;
  /** Consecutive correct answers; resets to 0 on a wrong answer. */
  streak: number;
}

export type StudyProgress = Record<string, ItemProgress>;

export interface StudySettings {
  /** Mode to study in: meaning (hiragana -> English) or kanji (kanji -> hiragana). */
  studyMode?: StudyMode;
  /** Source tags the learner has switched off. */
  excludedSources: string[];
  /** Word types the learner has switched off. */
  excludedTypes: string[];
}

export interface Question {
  item: VocabularyItem;
  studyMode: StudyMode;
  promptMode: PromptMode;
  /** The text shown to the learner (hiragana/katakana or kanji). */
  prompt: string;
  /** Question prompt label. */
  promptLabel: string;
  /** Four options, shuffled. */
  options: string[];
  /** The correct answer, always present in `options`. */
  answer: string;
  /** Mapping of option text to the source item for "Why?" explanations. */
  optionItems?: Record<string, VocabularyItem>;
}

export interface StudyStats {
  answered: number;
  correct: number;
  /** Items whose current streak has reached MASTER_STREAK consecutive correct answers. */
  mastered: number;
}

/** Correct answers needed before a word with kanji is shown in kanji. */
export const PROMOTE_STREAK = 1;
/** A word counts as mastered once its streak reaches this. */
export const MASTER_STREAK = 2;
export const OPTION_COUNT = 4;

const STORAGE_VERSION = 'v1';
export const PROGRESS_KEY = `japanese-study-progress-${STORAGE_VERSION}`;
export const SETTINGS_KEY = `japanese-study-settings-${STORAGE_VERSION}`;

export const DEFAULT_SETTINGS: StudySettings = {
  studyMode: 'meaning',
  excludedSources: [],
  excludedTypes: [],
};

const EMPTY_PROGRESS: ItemProgress = { correct: 0, incorrect: 0, streak: 0 };

/** The kana reading used as the base prompt (hiragana preferred, katakana fallback). */
export function baseScript(item: VocabularyItem): string {
  return item.hiragana || item.katakana || '';
}

/** Whether an item has kanji text. */
export function hasKanji(item: VocabularyItem): boolean {
  return Boolean(item.kanji && item.kanji.trim().length > 0);
}

/** An item can be studied only if it has a base reading, a meaning and a usable type. */
export function isStudyable(item: VocabularyItem): boolean {
  return Boolean(baseScript(item) && item.meaning && item.type && item.type !== 'unknown');
}

export function studyableItems(items: VocabularyItem[]): VocabularyItem[] {
  return items.filter(isStudyable);
}

/** Filter candidates based on the active study mode (kanji mode requires a kanji character). */
export function filterPoolForMode(items: VocabularyItem[], mode: StudyMode): VocabularyItem[] {
  if (mode === 'kanji') {
    return items.filter(hasKanji);
  }
  return items;
}

/** De-duplicate and sort alphabetically, ignoring empty values. */
function distinctSorted(values: Array<string | undefined>): string[] {
  const present = values.filter((value): value is string => Boolean(value));
  return [...new Set(present)].sort((a, b) => a.localeCompare(b));
}

/** Distinct source tags across the items, sorted alphabetically. */
export function listSources(items: VocabularyItem[]): string[] {
  return distinctSorted(items.flatMap(item => item.tags));
}

/** Distinct word types across the items, sorted alphabetically. */
export function listTypes(items: VocabularyItem[]): string[] {
  return distinctSorted(items.map(item => item.type));
}

/**
 * Keep an item when its type is enabled and it still has at least one enabled
 * source tag. Items with several tags survive until all their sources are off.
 */
export function applySettings(items: VocabularyItem[], settings: StudySettings): VocabularyItem[] {
  const excludedSources = new Set(settings.excludedSources);
  const excludedTypes = new Set(settings.excludedTypes);
  return items.filter(item => {
    if (item.type && excludedTypes.has(item.type)) {
      return false;
    }
    return item.tags.some(tag => !excludedSources.has(tag));
  });
}

export function promptModeFor(
  item: VocabularyItem,
  progress: StudyProgress,
  mode?: StudyMode,
): PromptMode {
  if (mode === 'meaning') {
    return 'hiragana';
  }
  if (mode === 'kanji') {
    return 'kanji';
  }
  const entry = progress[item.id];
  if (item.kanji && entry && entry.streak >= PROMOTE_STREAK) {
    return 'kanji';
  }
  return 'hiragana';
}

export function promptTextFor(item: VocabularyItem, mode: PromptMode): string {
  if (mode === 'kanji' && item.kanji) {
    return item.kanji;
  }
  return baseScript(item);
}

/** Fisher-Yates shuffle using the injected rng; returns a new array. */
export function shuffle<T>(items: T[], rng: Rng): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Pick `count` distractor items with meanings different from `item`. Same-type
 * items are preferred; if there aren't enough, other types fill the remainder.
 * Meanings are de-duplicated so the four options are always distinct.
 *
 * Homonyms are excluded: a candidate that shares the item's reading or kanji
 * would be a legitimate answer to the same prompt (e.g. きる → 切る "to cut"
 * vs 着る "to wear"), so it can never appear as a wrong option.
 */
export function pickDistractors(
  item: VocabularyItem,
  pool: VocabularyItem[],
  count: number,
  rng: Rng,
): VocabularyItem[] {
  const takenMeanings = new Set([item.meaning]);
  const reading = baseScript(item);
  const eligible = pool.filter(
    candidate =>
      candidate.id !== item.id &&
      candidate.meaning !== item.meaning &&
      baseScript(candidate) !== reading &&
      !(item.kanji && candidate.kanji === item.kanji),
  );
  const sameType = eligible.filter(candidate => candidate.type === item.type);
  const otherType = eligible.filter(candidate => candidate.type !== item.type);

  const ordered = [...shuffle(sameType, rng), ...shuffle(otherType, rng)];
  const distractors: VocabularyItem[] = [];
  for (const candidate of ordered) {
    if (distractors.length >= count) {
      break;
    }
    if (!takenMeanings.has(candidate.meaning)) {
      takenMeanings.add(candidate.meaning);
      distractors.push(candidate);
    }
  }
  return distractors;
}

/**
 * Pick `count` distractor items with hiragana readings different from `item`.
 * Candidates that share tags or the same type with `item` are prioritized (related);
 * remaining slots are filled with other candidates (randomized).
 * Hiragana readings are de-duplicated so the options are always distinct.
 */
export function pickKanjiDistractors(
  item: VocabularyItem,
  pool: VocabularyItem[],
  count: number,
  rng: Rng,
): VocabularyItem[] {
  const targetReading = baseScript(item);
  const takenReadings = new Set([targetReading]);
  const itemTags = new Set(item.tags);

  const eligible = pool.filter(
    candidate =>
      candidate.id !== item.id &&
      Boolean(baseScript(candidate)) &&
      baseScript(candidate) !== targetReading &&
      !(item.kanji && candidate.kanji === item.kanji),
  );

  const sameTag = eligible.filter(candidate => candidate.tags.some(tag => itemTags.has(tag)));
  const sameTypeOnly = eligible.filter(
    candidate => candidate.type === item.type && !candidate.tags.some(tag => itemTags.has(tag)),
  );
  const others = eligible.filter(
    candidate => candidate.type !== item.type && !candidate.tags.some(tag => itemTags.has(tag)),
  );

  const ordered = [
    ...shuffle(sameTag, rng),
    ...shuffle(sameTypeOnly, rng),
    ...shuffle(others, rng),
  ];
  const distractors: VocabularyItem[] = [];
  for (const candidate of ordered) {
    if (distractors.length >= count) {
      break;
    }
    const reading = baseScript(candidate);
    if (!takenReadings.has(reading)) {
      takenReadings.add(reading);
      distractors.push(candidate);
    }
  }
  return distractors;
}

export function buildQuestion(
  item: VocabularyItem,
  pool: VocabularyItem[],
  progress: StudyProgress,
  rng: Rng,
  studyMode?: StudyMode,
): Question {
  const effectiveMode: StudyMode = studyMode ?? 'meaning';

  if (effectiveMode === 'kanji') {
    const distractors = pickKanjiDistractors(item, pool, OPTION_COUNT - 1, rng);
    const answer = baseScript(item);
    const options = shuffle([answer, ...distractors.map(d => baseScript(d))], rng);
    const optionItems: Record<string, VocabularyItem> = {
      [answer]: item,
    };
    for (const d of distractors) {
      optionItems[baseScript(d)] = d;
    }
    return {
      item,
      studyMode: 'kanji',
      promptMode: 'kanji',
      prompt: item.kanji || baseScript(item),
      promptLabel: 'How do you read this kanji?',
      options,
      answer,
      optionItems,
    };
  }

  const promptMode = studyMode === 'meaning' ? 'hiragana' : promptModeFor(item, progress);
  const distractors = pickDistractors(item, pool, OPTION_COUNT - 1, rng);
  const answer = item.meaning;
  const options = shuffle([answer, ...distractors.map(d => d.meaning)], rng);
  const optionItems: Record<string, VocabularyItem> = {
    [answer]: item,
  };
  for (const d of distractors) {
    optionItems[d.meaning] = d;
  }
  return {
    item,
    studyMode: 'meaning',
    promptMode,
    prompt: promptTextFor(item, promptMode),
    promptLabel: 'What does this mean?',
    options,
    answer,
    optionItems,
  };
}

/** Weight selection toward less-practised items so they come up more often. */
export function itemWeight(progress: StudyProgress, id: string): number {
  const entry = progress[id];
  if (!entry) {
    return 4;
  }
  if (entry.streak <= 0) {
    return 3;
  }
  if (entry.streak === 1) {
    return 2;
  }
  return 1;
}

/**
 * Weighted-random pick of the next item to study. `excludeId` is avoided when
 * other items are available so the same word doesn't repeat back to back.
 */
export function selectItem(
  items: VocabularyItem[],
  progress: StudyProgress,
  rng: Rng,
  excludeId?: string,
): VocabularyItem | null {
  if (items.length === 0) {
    return null;
  }
  const candidates =
    excludeId && items.length > 1 ? items.filter(item => item.id !== excludeId) : items;

  const weights = candidates.map(item => itemWeight(progress, item.id));
  const total = weights.reduce((sum, weight) => sum + weight, 0);
  let threshold = rng() * total;
  for (let i = 0; i < candidates.length; i++) {
    threshold -= weights[i];
    if (threshold < 0) {
      return candidates[i];
    }
  }
  return candidates[candidates.length - 1];
}

export function recordAnswer(
  progress: StudyProgress,
  id: string,
  correct: boolean,
): StudyProgress {
  const prev = progress[id] ?? EMPTY_PROGRESS;
  const next: ItemProgress = correct
    ? { correct: prev.correct + 1, incorrect: prev.incorrect, streak: prev.streak + 1 }
    : { correct: prev.correct, incorrect: prev.incorrect + 1, streak: 0 };
  return { ...progress, [id]: next };
}

export function computeStats(progress: StudyProgress): StudyStats {
  return Object.values(progress).reduce<StudyStats>(
    (stats, entry) => ({
      answered: stats.answered + entry.correct + entry.incorrect,
      correct: stats.correct + entry.correct,
      mastered: stats.mastered + (entry.streak >= MASTER_STREAK ? 1 : 0),
    }),
    { answered: 0, correct: 0, mastered: 0 },
  );
}

export function loadProgress(storage: StudyStorage): StudyProgress {
  return readJson<StudyProgress>(storage, PROGRESS_KEY, {});
}

export function saveProgress(storage: StudyStorage, progress: StudyProgress): void {
  writeJson(storage, PROGRESS_KEY, progress);
}

export function loadSettings(storage: StudyStorage): StudySettings {
  const parsed = readJson<Partial<StudySettings>>(storage, SETTINGS_KEY, {});
  const settings: StudySettings = {
    excludedSources: Array.isArray(parsed.excludedSources) ? parsed.excludedSources : [],
    excludedTypes: Array.isArray(parsed.excludedTypes) ? parsed.excludedTypes : [],
  };
  if (parsed.studyMode === 'kanji' || parsed.studyMode === 'meaning') {
    settings.studyMode = parsed.studyMode;
  }
  return settings;
}

export function saveSettings(storage: StudyStorage, settings: StudySettings): void {
  writeJson(storage, SETTINGS_KEY, settings);
}

export function resetProgress(storage: StudyStorage): void {
  try {
    storage.removeItem(PROGRESS_KEY);
  } catch {
    return;
  }
}

function readJson<T>(storage: StudyStorage, key: string, fallback: T): T {
  try {
    const raw = storage.getItem(key);
    if (!raw) {
      return fallback;
    }
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? (parsed as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(storage: StudyStorage, key: string, value: unknown): void {
  try {
    storage.setItem(key, JSON.stringify(value));
  } catch {
    return;
  }
}
