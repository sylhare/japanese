import { describe, expect, it } from 'vitest';
import {
  CONJUGATION_LESSONS,
  CONJUGATION_SECTIONS,
  GRAMMAR_SECTIONS,
  VOCABULARY_LESSONS,
  VOCABULARY_SECTIONS,
  lessonDocPath,
} from '../e2e/helpers/lessonData';

/**
 * Guards that the e2e lesson data and the generated manifest
 * (src/data/lesson-paths.json) stay in sync — both encode lesson locations.
 */
describe('lessonData and lesson-paths.json consistency', () => {
  const sections = [...GRAMMAR_SECTIONS, ...VOCABULARY_SECTIONS, ...CONJUGATION_SECTIONS];

  it('resolves every sub-lesson slug through the manifest, under its section folder', () => {
    for (const { basePath, subLessons } of sections) {
      for (const sub of subLessons) {
        const docPath = lessonDocPath(sub.path);
        expect(docPath.endsWith(`/${sub.path}`)).toBe(true);
        expect(docPath).toContain(`/${basePath}/`);
      }
    }
  });

  it('resolves every leaf top-level lesson slug through the manifest', () => {
    const leafLessons = [...VOCABULARY_LESSONS, ...CONJUGATION_LESSONS].filter(l => !l.partial);
    for (const lesson of leafLessons) {
      expect(lessonDocPath(lesson.path).endsWith(`/${lesson.path}`)).toBe(true);
    }
  });
});
