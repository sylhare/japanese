import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
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
        '**/*.config.js'
      ]
    }
  },
  resolve: {
    alias: {
      '@theme': path.resolve(__dirname, 'src/theme'),
      '@docusaurus': path.resolve(__dirname, 'node_modules/@docusaurus')
    }
  }
});
