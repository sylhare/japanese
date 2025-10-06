# End-to-End Tests

This directory contains Playwright end-to-end tests for the Japanese learning website.

## Running Tests

### Run all e2e tests
```bash
npm run test:e2e
```

### Run tests with UI (interactive mode)
```bash
npm run test:e2e:ui
```

### Run tests in headed mode (see browser)
```bash
npm run test:e2e:headed
```

### Debug tests
```bash
npm run test:e2e:debug
```

## Test Structure

- `vocabulary-search.spec.ts` - Tests for the vocabulary search functionality
  - Basic page loading and display
  - Search by English meaning
  - Search by hiragana
  - Search by romaji
  - Category filtering
  - Sorting options
  - No results handling
  - Vocabulary card structure validation

## Prerequisites

Before running the tests, make sure:

1. The development server is running (`npm run start`)
2. Playwright browsers are installed (`npx playwright install`)
3. The vocabulary data is extracted (`npm run extract-vocabulary`)

## Configuration

The tests are configured in `playwright.config.ts` in the project root. The configuration includes:

- Test directory: `./tests/e2e`
- Base URL: `http://localhost:3000`
- Browser support: Chrome, Firefox, Safari
- Automatic dev server startup
- Retry logic for CI environments
