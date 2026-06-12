export interface JlptLevel {
  /** Tag applied to vocabulary belonging to this level (e.g. 'N5'). */
  tag: string;
  /** Reference article path, relative to the docs/ directory. */
  article: string;
}

export const JLPT_LEVELS: JlptLevel[] = [
  { tag: 'N5', article: 'reference/n5-vocabulary.md' },
];
