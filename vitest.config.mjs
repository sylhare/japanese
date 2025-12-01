import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import { defineConfig } from 'vitest/config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  assetsInclude: ['**/*.yaml', '**/*.yml'],
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['tests/**/*.test.{js,ts,tsx}'],
    exclude: ['node_modules', 'dist', 'build'],
    setupFiles: ['./tests/setup.ts'],
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
  },
  resolve: {
    alias: {
      '@theme': resolve(__dirname, 'tests/__mocks__/@theme'),
      '@docusaurus/Link': resolve(__dirname, 'tests/__mocks__/@docusaurus/Link'),
      '@docusaurus/useBaseUrl': resolve(__dirname, 'tests/__mocks__/@docusaurus/useBaseUrl'),
      '@docusaurus/Link': resolve(__dirname, 'tests/__mocks__/@docusaurus/Link'),
      '@docusaurus': resolve(__dirname, 'node_modules/@docusaurus'),
    },
  },
  define: {
    'process.env.NODE_ENV': '"test"',
  },
});
