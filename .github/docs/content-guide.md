---
sidebar_position: 3
title: Content Guide
description: Guidelines for creating Japanese lesson content
tags: [content, writing, lessons, vocabulary]
---

# Content Guide

Guidelines for creating high-quality Japanese lesson content.

## Lesson Structure

### Introduction

- Start with a clear introduction to the topic
- State learning objectives
- Explain why this lesson is important
- Provide context for when to use the content

### Main Content

- Break content into logical sections
- Use clear headings and subheadings
- Include plenty of examples
- Explain grammar points step by step

### Examples

- Include clear examples with romaji and English translations
- Use realistic, practical sentences
- Show both positive and negative examples when relevant
- Include cultural context where helpful

### Practice Exercises

- Add practice exercises at the end
- Include answer keys when appropriate
- Vary exercise types (fill-in-the-blank, translation, etc.)
- Make exercises progressively more challenging

### Formatting

- Use consistent formatting for tables and code blocks
- Include pronunciation guides
- Use proper Japanese punctuation
- Maintain consistent romaji style (Hepburn)

## Customization

### Styling

- Modify `src/css/custom.css` for global styles
- Component-specific styles are in their respective `.module.css` files
- The vocabulary page uses `src/pages/vocabulary.module.css`

### Navigation

- Update `docusaurus.config.ts` for main navigation
- Modify `sidebars.ts` for sidebar organization
- Add new pages in `src/pages/` for custom functionality

### Search

- The site uses Docusaurus's built-in search functionality
- Search works across all markdown content
- Vocabulary search is handled by the custom vocabulary page

## Vocabulary Entries

Follow the [vocabulary extraction](./vocabulary-extraction.md) procedure.