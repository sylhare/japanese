/**
 * Guards the dictionary page tag links against stale paths.
 *
 * Every tag rendered on the /dictionary page is a link to `getTagPath(tag)`,
 * which resolves via the auto-generated `src/data/lesson-paths.json`. These
 * tests fail if a tag points at a lesson page that no longer exists, or if the
 * committed path map has drifted from the lesson files on disk.
 */
import fs from 'fs';
import path from 'path';
import { describe, expect, it } from 'vitest';
import { buildLessonPaths } from '../../scripts/extract-vocabulary';
import lessonPaths from '../../src/data/lesson-paths.json';
import { getTagPath } from '../../src/pages/dictionary';
import { loadVocabularyData } from '../test-utils';

const REPO_ROOT = path.join(__dirname, '../..');

/** Resolve a `docs/...` path (without extension) to an existing .md/.mdx file. */
function docExists(relPathNoExt: string): boolean {
  const full = path.join(REPO_ROOT, relPathNoExt);
  return fs.existsSync(`${full}.md`) || fs.existsSync(`${full}.mdx`);
}

/** Every tag the dictionary can render, including the dynamically added N5 tag. */
function collectDictionaryTags(): string[] {
  const tags = new Set<string>();
  for (const item of loadVocabularyData().vocabulary) {
    (item.tags ?? []).forEach(tag => tags.add(tag));
  }
  tags.add('N5');
  return [...tags].sort();
}

describe('dictionary tag paths', () => {
  const tags = collectDictionaryTags();

  it('has tags to validate', () => {
    expect(tags.length).toBeGreaterThan(0);
  });

  it('resolves every tag to a real lesson page', () => {
    const stale = tags
      .map(tag => ({ tag, target: getTagPath(tag) }))
      .filter(({ target }) => !docExists(target));

    expect(
      stale,
      `These dictionary tags resolve to missing lesson pages:\n${stale
        .map(({ tag, target }) => `  ${tag} -> ${target}`)
        .join('\n')}`,
    ).toEqual([]);
  });

  it('maps every tag explicitly (never the silent fallback)', () => {
    const map = lessonPaths as Record<string, string>;
    const unmapped = tags.filter(tag => map[tag.toLowerCase()] === undefined);

    expect(
      unmapped,
      `These tags rely on the silent vocabulary/{tag} fallback instead of an explicit lesson path:\n${unmapped
        .map(tag => `  ${tag}`)
        .join('\n')}`,
    ).toEqual([]);
  });

  it('keeps lesson-paths.json in sync with the lesson files on disk', () => {
    expect(buildLessonPaths()).toEqual(lessonPaths);
  });
});
