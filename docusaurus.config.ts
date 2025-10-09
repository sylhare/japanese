import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
  title: 'Japanese Lessons',
  tagline: 'Learn Japanese with structured lessons and vocabulary',
  favicon: 'img/favicon.ico',

  // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
  future: {
    v4: true, // Improve compatibility with the upcoming Docusaurus v4
  },

  // Set the production url of your site here
  url: 'https://sylhare.github.io',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/japanese/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'sylhare', // Usually your GitHub org/user name.
  projectName: 'japanese', // Usually your repo name.

  onBrokenLinks: 'warn',

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            'https://github.com/sylhare/japanese/tree/main/',
        },
        blog: {
          showReadingTime: true,
          feedOptions: {
            type: ['rss', 'atom'],
            xslt: true,
          },
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            'https://github.com/sylhare/japanese/tree/main/',
          // Useful options to enforce blogging best practices
          onInlineTags: 'warn',
          onInlineAuthors: 'warn',
          onUntruncatedBlogPosts: 'warn',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  plugins: [
    function webpackPlugin() {
      return {
        name: 'yaml-loader',
        configureWebpack(config) {
          config.module.rules.push({
            test: /\.ya?ml$/,
            use: 'yaml-loader',
          });
        },
      };
    },
  ],

  themeConfig: {
    // Replace with your project's social card
    image: 'img/docusaurus-social-card.jpg',
    colorMode: {
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'Japanese Lessons',
      logo: {
        alt: 'Japanese Lessons Logo',
        src: 'img/logo.svg',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'lessonsSidebar',
          position: 'left',
          label: 'Lessons',
        },
        {
          type: 'docSidebar',
          sidebarId: 'referenceSidebar',
          position: 'left',
          label: 'Reference',
        },
        {to: '/vocabulary', label: 'Vocabulary', position: 'left'},
        {
          href: 'https://github.com/sylhare/japanese',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Lessons',
          items: [
            {
              label: 'Getting Started',
              to: '/docs/lessons/intro',
            },
            {
              label: 'Grammar',
              to: '/docs/lessons/grammar/conjugation',
            },
            {
              label: 'Vocabulary',
              to: '/vocabulary',
            },
          ],
        },
        {
          title: 'Resources',
          items: [
            {
              label: 'Vocabulary System',
              to: '/vocabulary',
            },
            {
              label: 'Hiragana Chart',
              to: '/docs/reference/hiragana-chart',
            },
            {
              label: 'Katakana Chart',
              to: '/docs/reference/katakana-chart',
            },
          ],
        },
        {
          title: 'Development',
          items: [
            {
              label: 'GitHub Repository',
              href: 'https://github.com/sylhare/japanese',
            },
            {
              label: 'Development Docs',
              href: 'https://github.com/sylhare/japanese/tree/main/.github/docs',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Japanese Lessons. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
