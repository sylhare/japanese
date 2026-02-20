export interface Lesson {
  name: string;
  path: string;
  heading: RegExp;
  partial?: boolean; // use href*= instead of href$= (for category index pages)
}

export interface SubLesson {
  name: string;
  path: string;
  heading: RegExp;
}

export interface LessonSection {
  section: string;
  basePath: string;
  heading: RegExp;
  subLessons: SubLesson[];
}

export const INTRO_LINKS: Lesson[] = [
  { name: 'Grammar',        path: '/grammar',       heading: /grammar/i },
  { name: 'Vocabulary',     path: '/vocabulary',    heading: /vocabulary/i },
  { name: 'Conjugation',    path: '/conjugation',   heading: /conjugation/i },
  { name: 'Dictionary',     path: '/dictionary',    heading: /vocabulary|dictionary/i },
  { name: 'Hiragana Chart', path: 'hiragana-chart', heading: /hiragana/i },
  { name: 'Katakana Chart', path: 'katakana-chart', heading: /katakana/i },
];

export const CONJUGATION_LESSONS: Lesson[] = [
  { name: 'Verb Conjugation Basics', path: 'basics',          heading: /verb conjugation|conjugation/i },
  { name: 'Dictionary Form',         path: 'dictionary-form', heading: /introduction/i },
];

export const GRAMMAR_LESSONS: Lesson[] = [
  { name: 'Particle Guide',       path: 'particle-guide',       heading: /particle/i },
  { name: 'Experience',           path: 'experience',           heading: /experience/i },
  { name: 'Conjunctions',         path: 'conjunctions',         heading: /listing items|conjunctions/i },
  { name: 'Excess',               path: 'excess',               heading: /too much|excess|すぎる/i },
  { name: 'Comparison',           path: 'comparison',           heading: /comparison/i },
  { name: 'Advice',               path: 'advice',               heading: /advice/i },
  { name: 'Obligation',           path: 'obligation',           heading: /obligation/i },
  { name: 'Reason',               path: 'reason',               heading: /reason/i },
  { name: 'Desire',               path: 'desire',               heading: /desire/i },
  { name: 'Intention',            path: 'intend_to',            heading: /intention|つもり/i },
  { name: 'Appearance',           path: 'appearance',           heading: /appearance/i },
  { name: 'Actions and Thinking', path: 'actions-and-thinking', heading: /actions|thinking/i },
  { name: 'Sequential Actions',   path: 'sequential-actions',   heading: /sequential|てから/i },
  { name: 'Prohibition',          path: 'prohibition',          heading: /prohibition|いけません|だめ/i },
  { name: 'Question Words',       path: 'question-words',       heading: /question words/i },
  { name: 'Linking Words',        path: 'linking-words',        heading: /linking words/i },
];

export const VOCABULARY_LESSONS: Lesson[] = [
  { name: 'Colors',          path: 'colors',         heading: /colors/i },
  { name: 'Food',            path: 'food',           heading: /food/i,               partial: true },
  { name: 'Time',            path: 'time',           heading: /time|dates/i,         partial: true },
  { name: 'Numbers',         path: 'numbers',        heading: /numbers|counting/i,   partial: true },
  { name: 'Family',          path: 'family',         heading: /family|relationships/i },
  { name: 'Clothes',         path: 'clothes',        heading: /clothes|wearing/i },
  { name: 'Weather',         path: 'weather',        heading: /weather/i },
  { name: 'Health',          path: 'health',         heading: /health|medical/i },
  { name: 'Confusing Kanji', path: 'confusing-kanji', heading: /confusing kanji/i },
];

export const VOCABULARY_SECTIONS: LessonSection[] = [
  {
    section: 'Food',
    basePath: 'food',
    heading: /food/i,
    subLessons: [
      { name: 'Food and Ingredients', path: 'food-and-ingredients', heading: /food|ingredients/i },
      { name: 'Cooking',              path: 'cooking',  heading: /cooking|food prep/i },
      { name: 'Tastes',               path: 'tastes',   heading: /tastes|flavors/i },
    ],
  },
  {
    section: 'Time',
    basePath: 'time',
    heading: /time|dates/i,
    subLessons: [
      { name: 'Days and Weeks', path: 'days-and-weeks', heading: /days.*weeks|days of the week/i },
      { name: 'Calendar',       path: 'calendar',       heading: /calendar|dates/i },
    ],
  },
  {
    section: 'Numbers',
    basePath: 'numbers',
    heading: /numbers|counting/i,
    subLessons: [
      { name: 'Basic Numbers',   path: 'basics',   heading: /basic numbers|numbers/i },
      { name: 'Reading Numbers', path: 'counting', heading: /reading numbers|counting/i },
      { name: 'Counters',        path: 'counters', heading: /counters|frequency/i },
    ],
  },
];
