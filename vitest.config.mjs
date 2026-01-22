import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import { defineConfig } from 'vitest/config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  assetsInclude: ['**/*.yaml', '**/*.yml', '**/*.svg'],
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['tests/**/*.test.{js,ts,tsx}'],
    exclude: ['node_modules', 'dist', 'build'],
    setupFiles: ['./tests/setup.ts'],
    maxWorkers: 2,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'tests/',
        '**/*.test.{js,ts,tsx}',
        '**/*.config.js',
      ],
    },
    mockReset: true,
    clearMocks: true,
    server: {
      deps: {
        inline: [/@site/],
      },
    },
  },
  resolve: {
    alias: {
      '@theme': resolve(__dirname, 'tests/__mocks__/@theme'),
      '@docusaurus/Link': resolve(__dirname, 'tests/__mocks__/@docusaurus/Link'),
      '@docusaurus/useBaseUrl': resolve(__dirname, 'tests/__mocks__/@docusaurus/useBaseUrl'),
      '@docusaurus': resolve(__dirname, 'node_modules/@docusaurus'),
      '@site/static/img/undraw_docusaurus_mountain.svg': resolve(__dirname, 'tests/__mocks__/@site/static/img/undraw_docusaurus_mountain.svg.tsx'),
      '@site/static/img/undraw_docusaurus_tree.svg': resolve(__dirname, 'tests/__mocks__/@site/static/img/undraw_docusaurus_tree.svg.tsx'),
      '@site/static/img/undraw_docusaurus_react.svg': resolve(__dirname, 'tests/__mocks__/@site/static/img/undraw_docusaurus_react.svg.tsx'),
      '@site': resolve(__dirname),
    },
  },
  define: {
    'process.env.NODE_ENV': '"test"',
  },
});
