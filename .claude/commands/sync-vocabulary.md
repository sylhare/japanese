# Sync Vocabulary

Keep `src/data/vocabulary.yaml` in sync with the current lesson files and verify nothing broke.

## Steps

1. Run extraction:
   ```bash
   npm run extract-vocabulary
   ```

2. Report the result from the script output:
   - How many items were **added** (new vocabulary from lesson tables)
   - How many items were **removed** (orphaned entries from deleted/changed lessons)
   - Or confirm "no changes" if the file was already up to date

3. Run unit tests:
   ```bash
   npm test
   ```

4. If tests fail, show the failures and offer to investigate the root cause.
