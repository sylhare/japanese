import { Page, expect, test } from '@playwright/test';
import { type Lesson, type LessonSection, lessonDocPath } from './lessonData';
import { validateCardLinks, validateSidebarLinks, verifyPageIsFound } from './pageHelper';

export interface LessonSuiteConfig {
  /** Top-level describe title, e.g. 'Grammar Pages'. */
  title: string;
  /** URL segment under docs/lessons, e.g. 'grammar'. */
  segment: string;
  /** Heading shown on the section landing page. */
  landingHeading: RegExp;
  /** Describe title for the landing-page navigation group. */
  navTitle: string;
  lessons: Lesson[];
  sections: LessonSection[];
  /** Builds the per-section describe title from the section name. */
  sectionTitle: (section: string) => string;
  /** Describe title for the direct-page-access group. */
  directAccessTitle: string;
  /** Include a per-lesson "navigate from sidebar" group (grammar omits it). */
  includeSidebarNav?: boolean;
  /** Match the lesson path with a partial (`*=`) / suffix (`$=`) attribute selector instead of `href*="/seg/path"`. */
  matchLessonPathByAttr?: boolean;
  /** Only test direct access for non-partial (leaf) lessons. */
  directAccessNonPartialOnly?: boolean;
  /** Section index URLs use a trailing slash. */
  sectionTrailingSlash?: boolean;
  /** Also test loading each sub-lesson directly. */
  sectionSubDirect?: boolean;
  /** Also test reaching each sub-lesson from the sidebar. */
  sectionSubSidebar?: boolean;
}

async function gotoAndVerify(page: Page, url: string, heading: RegExp) {
  await page.goto(url);
  await page.waitForLoadState('networkidle');
  await verifyPageIsFound(page);
  await expect(page.getByRole('heading', { name: heading }).first()).toBeVisible();
}

async function clickAndVerify(page: Page, selector: string, heading: RegExp) {
  const link = page.locator(selector).first();
  await expect(link).toBeVisible();
  await link.click();
  await verifyPageIsFound(page);
  await expect(page.getByRole('heading', { name: heading }).first()).toBeVisible();
}

/** Generates the standard lesson-section e2e suite; each spec adds its own cross-reference tests. */
export function runLessonSuite(cfg: LessonSuiteConfig): void {
  const base = `./docs/lessons/${cfg.segment}`;
  const lessonSelector = (prefix: string, lesson: Lesson) =>
    cfg.matchLessonPathByAttr
      ? `${prefix}[href${lesson.partial ? '*=' : '$='}"/${cfg.segment}/${lesson.path}"]`
      : `${prefix}[href*="/${cfg.segment}/${lesson.path}"]`;

  test.describe(cfg.title, () => {
    test.describe(`${cfg.title} Landing Page`, () => {
      test(`should load ${cfg.segment} index page`, async ({ page }) => {
        await gotoAndVerify(page, `${base}/`, cfg.landingHeading);
      });
    });

    test.describe(cfg.navTitle, () => {
      test.beforeEach(async ({ page }) => {
        await page.goto(`${base}/`);
        await page.waitForLoadState('networkidle');
      });

      if (cfg.includeSidebarNav) {
        test.describe('Sidebar Links', () => {
          for (const lesson of cfg.lessons) {
            test(`should navigate to ${lesson.name} from sidebar`, async ({ page }) => {
              await clickAndVerify(page, lessonSelector('a.menu__link', lesson), lesson.heading);
            });
          }
        });
      }

      test.describe('Landing Page Cards (LessonList)', () => {
        for (const lesson of cfg.lessons) {
          test(`should navigate to ${lesson.name} from landing page`, async ({ page }) => {
            await clickAndVerify(page, lessonSelector('a[class*="lessonCard"]', lesson), lesson.heading);
          });
        }
      });

      test.describe('Link Validation', () => {
        test(`should have valid href attributes for all ${cfg.segment} sidebar links`, async ({ page }) => {
          await validateSidebarLinks(page, cfg.segment);
        });

        test(`should have valid href attributes for all ${cfg.segment} card links`, async ({ page }) => {
          await validateCardLinks(page, cfg.segment);
        });
      });
    });

    test.describe(cfg.directAccessTitle, () => {
      const lessons = cfg.directAccessNonPartialOnly ? cfg.lessons.filter(l => !l.partial) : cfg.lessons;
      for (const lesson of lessons) {
        test(`should load ${lesson.name} page directly`, async ({ page }) => {
          await gotoAndVerify(page, `${base}/${lesson.path}`, lesson.heading);
        });
      }
    });

    for (const { section, basePath, heading, subLessons } of cfg.sections) {
      const sectionUrl = `${base}/${basePath}${cfg.sectionTrailingSlash ? '/' : ''}`;

      test.describe(cfg.sectionTitle(section), () => {
        test.beforeEach(async ({ page }) => {
          await page.goto(sectionUrl);
          await page.waitForLoadState('networkidle');
        });

        test('page loads successfully', async ({ page }) => {
          await verifyPageIsFound(page);
          await expect(page.getByRole('heading', { name: heading }).first()).toBeVisible();
        });

        for (const sub of subLessons) {
          test(`should navigate to ${sub.name} from landing page`, async ({ page }) => {
            await clickAndVerify(page, `a[class*="lessonCard"][href*="${sub.path}"]`, sub.heading);
          });
        }

        if (cfg.sectionSubSidebar) {
          for (const sub of subLessons) {
            test(`should reach ${sub.name} from the sidebar`, async ({ page }) => {
              await clickAndVerify(page, `a.menu__link[href*="/${cfg.segment}/${basePath}/${sub.path}"]`, sub.heading);
            });
          }
        }
      });

      if (cfg.sectionSubDirect) {
        test.describe(`${cfg.sectionTitle(section)} — Direct Navigation`, () => {
          for (const sub of subLessons) {
            test(`should load ${sub.name} page directly`, async ({ page }) => {
              await gotoAndVerify(page, `./${lessonDocPath(sub.path)}`, sub.heading);
            });
          }
        });
      }
    }
  });
}
