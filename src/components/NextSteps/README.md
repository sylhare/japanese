# NextSteps Component

A component for displaying recommended next lessons at the end of a lesson page.

## Usage

```mdx
---
title: My Lesson
description: Learn something cool
---

import NextSteps from '@site/src/components/NextSteps';

# My Lesson

Your lesson content here...

---

<NextSteps items={[
  {
    title: 'Next Lesson Title',
    description: 'Learn frequency expressions like "once a week"',
    to: './next-lesson',
  },
  {
    title: 'Related Lesson',
    description: 'Apply numbers to dates with special exceptions',
    to: '../other/related-lesson',
  },
]} />
```

## Props

### `items` (required)

An array of next step items. Each item should have:

- **`title`** (string, required): The title of the next lesson
- **`description`** (string, required): A brief description of what the lesson covers
- **`to`** (string, required): The relative path to the lesson

## Features

- Automatically styled with a gradient background
- Hover effects with smooth transitions
- Responsive grid layout
- Arrow animation on hover
- Follows Docusaurus theme variables for dark/light mode support

## Examples

### Single Next Step

```mdx
<NextSteps items={[
  {
    title: 'Verb Conjugation',
    description: 'Master the art of Japanese verb conjugation',
    to: '../conjugation/verbs',
  },
]} />
```

### Multiple Next Steps

```mdx
<NextSteps items={[
  {
    title: 'Counters and Frequency',
    description: 'Learn frequency expressions like "once a week"',
    to: './counters',
  },
  {
    title: 'Dates and Calendar',
    description: 'Apply numbers to dates with special exceptions',
    to: './dates',
  },
  {
    title: 'Time Expressions',
    description: 'Learn how to tell time and express duration',
    to: '../vocabulary/time',
  },
]} />
```

## Styling

The component uses CSS modules for styling. Customize the appearance by modifying `styles.module.css`.

