# Contributing

## Setup

```bash
npm install
```

## Development commands

| Command | What it does |
|---------|-------------|
| `npm start` | Runs vocabulary extraction then starts the dev server at `http://localhost:3003` |
| `npm run build` | Runs vocabulary extraction then builds the static site into `build/` |
| `npm run serve` | Serves the built site locally (run after `build`) |
| `npm run clear` | Clears Docusaurus cache — use when the dev server shows stale output |
| `npm run typecheck` | TypeScript type-check without emitting files |
| `npm run lint` | Lint all `.ts`/`.tsx`/`.js`/`.jsx` files |
| `npm run lint:fix` | Lint and auto-fix |
| `npm run extract-vocabulary` | Extract vocabulary from lesson tables into `src/data/vocabulary.yaml` |
| `npm test` | Run unit tests (Vitest) |
| `npm run test:e2e` | Run end-to-end tests (Playwright) — starts the site automatically; if you added vocabulary with a new tag, see the [Vocabulary System Guide](docs/vocabulary-extraction.md#adding-new-tag-mappings) |

## Deployment

The site deploys automatically to GitHub Pages on every push to `main` via `.github/workflows/deploy.yml`.

The pipeline runs in a single job:
1. Install dependencies (`npm ci`)
2. Run vocabulary extraction (`npm run extract-vocabulary`)
3. Build the site (`npm run build` with `NODE_ENV=production`)
4. Upload and deploy the `build/` artifact to GitHub Pages

No manual steps are needed. To test the full pipeline locally before pushing:

```bash
npm run build
npm run serve
```

## Adding a new lesson

Use the templates in [`.github/docs/templates/`](docs/templates/) when creating a new lesson article.
The [`.github/docs/templates/README.md`](docs/templates/README.md) contains the full checklist, including:

- Which template to copy and where to place it
- How to add the lesson to its section index
- How to link to and from related articles
- How to update the e2e test data in `tests/e2e/helpers/lessonData.ts`
- How to run the e2e tests

Follow all steps in that checklist before opening a pull request.
