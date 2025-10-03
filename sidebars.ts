import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

/**
 * Creating a sidebar enables you to:
 - create an ordered group of docs
 - render a sidebar for each doc of that group
 - provide next/previous navigation

 The sidebars can be generated from the filesystem, or explicitly defined here.

 Create as many sidebars as you want.
 */
const sidebars: SidebarsConfig = {
  // Lessons sidebar
  lessonsSidebar: [
    {
      type: 'category',
      label: 'Getting Started',
      items: [
        'lessons/intro',
        'lessons/hiragana-basics',
      ],
    },
    {
      type: 'category',
      label: 'Grammar',
      items: [
        'lessons/grammar/conjugation',
      ],
    },
    {
      type: 'category',
      label: 'Vocabulary',
      items: [
        'lessons/vocabulary/colors',
      ],
    },
  ],

  // Reference sidebar
  referenceSidebar: [
    {
      type: 'category',
      label: 'Kana Reference',
      items: [
        'reference/hiragana-chart',
        'reference/katakana-chart',
      ],
    },
    {
      type: 'category',
      label: 'Grammar Reference',
      items: [
        'reference/verb-conjugation',
        'reference/particle-guide',
      ],
    },
  ],
};

export default sidebars;
