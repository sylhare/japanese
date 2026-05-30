import path from 'path';
import react from '@vitejs/plugin-react';
import yaml from 'js-yaml';
import type { Plugin } from 'vite';
import { defineConfig } from 'vitest/config';

function yamlPlugin(): Plugin {
  return {
    name: 'yaml-transform',
    transform(code, id) {
      if (id.endsWith('.yaml') || id.endsWith('.yml')) {
        const data = yaml.load(code);
        return `export default ${JSON.stringify(data)}`;
      }
    },
  };
}

export default defineConfig({
  plugins: [react(), yamlPlugin()],
  resolve: {
    alias: {
      '@docusaurus/Link': path.resolve('./tests/__mocks__/@docusaurus/Link.tsx'),
      '@docusaurus/useBaseUrl': path.resolve('./tests/__mocks__/@docusaurus/useBaseUrl.ts'),
      '@theme/Heading': path.resolve('./tests/__mocks__/@theme/Heading.tsx'),
      '@theme/Layout': path.resolve('./tests/__mocks__/@theme/Layout.tsx'),
      '@site/static/img/undraw_docusaurus_mountain.svg': path.resolve('./tests/__mocks__/@site/static/img/undraw_docusaurus_mountain.svg.tsx'),
      '@site/static/img/undraw_docusaurus_react.svg': path.resolve('./tests/__mocks__/@site/static/img/undraw_docusaurus_react.svg.tsx'),
      '@site/static/img/undraw_docusaurus_tree.svg': path.resolve('./tests/__mocks__/@site/static/img/undraw_docusaurus_tree.svg.tsx'),
      '@site': path.resolve('.'),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/component/**/*.test.{ts,tsx}', 'tests/scripts/**/*.test.ts', 'tests/plugins/**/*.test.ts'],
  },
});
