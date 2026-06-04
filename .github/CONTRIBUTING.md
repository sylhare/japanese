# Contributing

## Setup

```bash
npm install
```

## Development commands

| Command                      | What it does                                                                     |
|------------------------------|----------------------------------------------------------------------------------|
| `npm start`                  | Runs vocabulary extraction then starts the dev server at `http://localhost:3003` |
| `npm run build`              | Runs vocabulary extraction then builds the static site into `build/`             |
| `npm run serve`              | Serves the built site locally (run after `build`)                                |
| `npm run clear`              | Clears Docusaurus cache — use when the dev server shows stale output             |
| `npm run typecheck`          | TypeScript type-check without emitting files                                     |
| `npm run lint`               | Lint all `.ts`/`.tsx`/`.js`/`.jsx` files                                         |
| `npm run lint:fix`           | Lint and auto-fix                                                                |
| `npm run extract-vocabulary` | Extract vocabulary from lesson tables into `src/data/vocabulary.yaml`            |
| `npm test`                   | Run unit tests (Vitest)                                                          |
| `npm run test:e2e`           | Run end-to-end tests (Playwright) — starts the site automatically                |

## Deployment

The site deploys automatically to GitHub Pages on every push to `main` via [`deploy.yml`](./workflows/deploy.yml).

The pipeline runs in a single job, so you can reproduce it locally with these steps:

1. Install dependencies (`npm ci`)
2. Run vocabulary extraction (`npm run extract-vocabulary`)
3. Build the site (`npm run build` with `NODE_ENV=production`)
4. Upload and deploy the `build/` artifact to GitHub Pages

## Adding a new lesson

Lesson authoring, templates, and the full checklist live in the content documentation:

- [`.github/docs/templates/README.md`](docs/templates/README.md) — which template to copy, where to place it,
  how to wire it into the section index, how to update the e2e test data, and how to run the e2e tests.
- [`.github/docs/README.md`](docs/README.md) — style, formatting, and romanization conventions.

Follow the checklist and information in those documents before creating a new article.

## Documentation

Developer and contributor documentation lives in [`.github/docs/`](docs):

| Resource                                                        | Path                                                                        |
|-----------------------------------------------------------------|-----------------------------------------------------------------------------|
| Docusaurus configuration, menus, sidebars, plugins              | [`.github/docs/docusaurus.md`](docs/docusaurus.md)                          |
| Vocabulary extraction, table format, YAML structure, tag system | [`.github/docs/vocabulary-extraction.md`](docs/vocabulary-extraction.md)    |
| Deployment pipeline                                             | [`.github/workflows`](./workflows)                                          |
| Lesson templates and contributor checklist                      | [`.github/docs/templates/`](docs/templates)                                 |
| Component usage (NextSteps, LessonList, ReferenceCard)          | [`src/components/`](../src/components) (README.md in each component folder) |
