# LessonList

Renders a card grid of lessons. Used in section index files to list all lessons in a category.

**Import:**

```mdx
import LessonList from '@site/src/components/LessonList';
```

## Props

`items` (required) — array of objects, each with:

| Prop | Type | Description |
|------|------|-------------|
| `title` | string | Lesson title |
| `description` | string | One-line description of the lesson |
| `to` | string | Relative path to the lesson |

## Usage

```mdx
import LessonList from '@site/src/components/LessonList';

<LessonList items={[
  {
    title: 'Reason (から / ので)',
    description: 'Express reasons and causes using から and ので',
    to: './reason',
  },
  {
    title: 'Conjunctions (そして / でも / だから)',
    description: 'Connect sentences with conjunctions',
    to: './conjunctions',
  },
]} />
```

## When to use

Section index files only (`docs/lessons/grammar/index.mdx`, `docs/lessons/vocabulary/index.mdx`, `docs/lessons/conjugation/index.mdx`). Always use `.mdx` extension for these files.
