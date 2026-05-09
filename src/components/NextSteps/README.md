# NextSteps

Renders a card grid of recommended next lessons at the bottom of a page.

**Import:**

```mdx
import NextSteps from '@site/src/components/NextSteps';
```

## Props

`items` (required) — array of objects, each with:

| Prop | Type | Description |
|------|------|-------------|
| `title` | string | Title of the next lesson |
| `description` | string | Brief description of what the lesson covers |
| `to` | string | Relative path to the lesson |

## Usage

```mdx
<NextSteps items={[
  {
    title: 'Te-form',
    description: 'Learn to connect actions and make requests',
    to: '../conjugation/te-form',
  },
  {
    title: 'Reason (から / ので)',
    description: 'Express reasons and causes in Japanese',
    to: './reason',
  },
]} />
```

## When to use

Grammar and conjugation lessons only. Vocabulary lessons do not use `NextSteps` — they end with a `:::tip Common Phrases` callout instead.

The lesson file must use `.md` or `.mdx`. Docusaurus processes all `.md` files as MDX by default, so JSX imports work in both extensions.
