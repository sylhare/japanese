# ReferenceCard / ReferenceCardGrid

Renders a styled card for reference pages (kana charts, etc.). Used on the reference section index.

**Import:**

```mdx
import ReferenceCardGrid, { ReferenceCard } from '@site/src/components/ReferenceCard';
```

## Props

`ReferenceCard` props:

| Prop | Type | Description |
|------|------|-------------|
| `emoji` | string | Decorative emoji shown in the card header |
| `title` | string | Card title |
| `description` | string | Short description |
| `href` | string | Link target |
| `linkText` | string | Link label text |

`ReferenceCardGrid` wraps one or more `ReferenceCard` components and handles the grid layout.

## Usage

```mdx
<ReferenceCardGrid>
  <ReferenceCard
    emoji="あ"
    title="Hiragana Chart"
    description="Complete hiragana syllabary with stroke order"
    href="/docs/reference/hiragana-chart"
    linkText="View chart"
  />
  <ReferenceCard
    emoji="ア"
    title="Katakana Chart"
    description="Complete katakana syllabary with stroke order"
    href="/docs/reference/katakana-chart"
    linkText="View chart"
  />
</ReferenceCardGrid>
```

## When to use

Reference section index and reference overview pages only.
