# Deployment Guide

This guide explains how the Japanese Lessons site is automatically deployed to GitHub Pages.

### Workflow Overview

1. **Test Phase**: Runs tests and vocabulary extraction
2. **Build Phase**: Builds the Docusaurus site
3. **Deploy Phase**: Deploys to GitHub Pages

### Deployment Configuration

The deployment is configured in `.github/workflows/deploy.yml`.
It uses the config file `docusaurus.config.ts`.

## Local Testing

Before deploying, test the build locally:

```bash
# Install dependencies
npm install

# Run tests
npm run test:run

# Extract vocabulary
npm run extract-vocabulary

# Build the site
npm run build

# Test the built site
npm run serve
```

## Environment Variables

The deployment uses these environment variables:

- `NODE_ENV=production` - Ensures production build
- `GITHUB_TOKEN` - Automatically provided by GitHub Actions

