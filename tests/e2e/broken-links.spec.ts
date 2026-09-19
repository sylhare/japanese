import { expect, test } from '@playwright/test';

test('crawls and verifies all app links automatically', async ({ page }) => {
  test.setTimeout(120_000);

  const queue = ['./'];
  const visited = new Set<string>();
  const parentMap = new Map<string, string>();
  const errors: string[] = [];

  const norm = (url: string) => url.split('#')[0].replace(/\/$/, '');

  while (queue.length > 0) {
    const route = queue.shift()!;
    const normKey = norm(new URL(route, 'http://localhost:3003/japanese/').href);

    if (visited.has(normKey)) continue;
    visited.add(normKey);

    const fromPage = parentMap.get(route) || 'Entry Point';

    try {
      const res = await page.goto(route, { waitUntil: 'domcontentloaded' });
      if (!res || res.status() >= 400) {
        errors.push(`From "${fromPage}" -> Broken link "${route}" (HTTP ${res?.status() || 'FAILED'})`);
        continue;
      }

      const notFound = await page.locator('h1.hero__title', { hasText: 'Page Not Found' }).count();
      if (notFound > 0) {
        errors.push(`From "${fromPage}" -> Broken link "${route}" (404 Page Not Found)`);
        continue;
      }

      for (const a of await page.locator('a[href]').all()) {
        const href = await a.getAttribute('href');
        if (!href || href.startsWith('javascript:') || href.startsWith('mailto:') || href === '#') continue;

        try {
          const target = new URL(href, page.url());
          if (target.origin === 'http://localhost:3003' && target.pathname.startsWith('/japanese')) {
            const targetKey = norm(target.href);
            if (!visited.has(targetKey) && !queue.includes(target.href)) {
              parentMap.set(target.href, page.url());
              queue.push(target.href);
            }
          }
        } catch {}
      }
    } catch (err: any) {
      errors.push(`From "${fromPage}" -> Failed to load "${route}": ${err.message}`);
    }
  }

  if (errors.length > 0) {
    console.error('\n❌ Broken Links Found:\n' + errors.join('\n') + '\n');
  }

  expect(errors).toEqual([]);
  expect(visited.size).toBeGreaterThan(20);
});
