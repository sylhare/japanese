# Japanese Translator CLI

A command-line tool for translating English to Japanese, designed for beginners learning Japanese.

## Features

- **Multiple output formats**: Japanese (kanji/kana), Hiragana reading, and Romaji
- **Alternative translations**: Get multiple translation options
- **Beginner-friendly**: Prefers native Japanese words over loanwords (katakana)
- **Command history**: Use ↑/↓ arrows to navigate previous translations
- **Smart intent detection**: Distinguishes between text to translate and instructions

## Installation

This project uses [uv](https://github.com/astral-sh/uv) for package management.

```bash
# Navigate to the translator directory
cd translator

# Create virtual environment and install dependencies
uv sync

# Run the translator
uv run translate
```

### Alternative: Install globally

```bash
# Install the package
uv pip install -e .

# Run from anywhere
translate
```

## Usage

```
翻訳 ❯ Hello, how are you?

╭─────────────────── "Hello, how are you?" ───────────────────╮
│                                                              │
│  Japanese   こんにちは、お元気ですか                          │
│  Hiragana   こんにちは、おげんきですか                        │
│  Romaji     konnichiha, ogenki desuka                        │
│                                                              │
╰──────────────────────────────────────────────────────────────╯

Alternatives:
  1. こんにちは、元気ですか  →  こんにちは、げんきですか  (konnichiha, genki desuka)
  2. 元気ですか  →  げんきですか  (genki desuka)
```

## Commands

| Command | Description |
|---------|-------------|
| `help` or `?` | Show help message |
| `quit` or `exit` | Exit the translator |
| `clear` | Clear the screen |

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| ↑/↓ | Navigate command history |
| Ctrl+C | Cancel current input |
| Ctrl+D | Exit the program |

## Configuration

The translator uses the Helsinki-NLP/opus-mt-en-jap model by default. Command history is stored in `~/.japanese_translator_history`.

## Dependencies

- `transformers` - Hugging Face transformers for translation
- `torch` - PyTorch for model inference
- `pykakasi` - Japanese text conversion (romaji/hiragana)
- `rich` - Beautiful terminal output
- `prompt-toolkit` - Interactive prompt with history

## Development

```bash
# Install with dev dependencies
uv sync --dev

# Lint code
uv run ruff check .
```

## Testing

The project has a comprehensive test suite organized by type:

### Unit Tests (fast, no model loading)

```bash
# Run all fast unit tests (default)
uv run pytest tests/ --ignore=tests/e2e

# Run with verbose output
uv run pytest tests/ --ignore=tests/e2e -v
```

### Integration Tests (slow, requires model loading)

```bash
# Run unit tests including slow integration tests
uv run pytest tests/ --ignore=tests/e2e --run-slow
```

### E2E Smoke Tests (CLI verification)

```bash
# Run quick e2e tests (no model loading)
uv run pytest tests/e2e --run-e2e

# Run all e2e tests including slow ones
uv run pytest tests/e2e --run-e2e --run-slow
```

### Full Test Suite

```bash
# Run everything (unit + integration + e2e)
uv run pytest tests/ --run-slow --run-e2e
```

### Test Markers

- `@pytest.mark.slow` - Tests that require model loading (skipped by default)
- `@pytest.mark.e2e` - End-to-end CLI tests (skipped by default)
