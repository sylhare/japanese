import useBaseUrl from '@docusaurus/useBaseUrl';
import Layout from '@theme/Layout';
import React, { useMemo, useState } from 'react';
import lessonPaths from '../data/lesson-paths.json';
import n5VocabularyData from '../data/n5-vocabulary.json';
import { VALID_TYPES, normalizeToken } from '../data/vocabulary-types';
import type { VocabularyItem } from '../data/vocabulary-types';
import vocabularyYamlData from '../data/vocabulary.yaml';
import styles from './dictionary.module.css';

const vocabularyData: VocabularyItem[] = vocabularyYamlData.vocabulary;
const categories = vocabularyYamlData.categories;
const sortOptions = vocabularyYamlData.sortOptions;

const N5_TAG = 'N5';
const n5VocabularyTokens = new Set<string>(n5VocabularyData.tokens);

function isN5VocabularyItem(item: VocabularyItem): boolean {
  const primaryCandidates = [
    normalizeToken(item.hiragana),
    normalizeToken(item.katakana),
    normalizeToken(item.kanji),
  ].filter(Boolean);

  if (primaryCandidates.some(candidate => n5VocabularyTokens.has(candidate))) {
    return true;
  }

  const romajiCandidate = normalizeToken(item.romaji);
  return romajiCandidate ? n5VocabularyTokens.has(romajiCandidate) : false;
}

function addN5Tag(tags: string[]): string[] {
  if (tags.some(tag => tag.toLowerCase() === 'n5')) {
    return tags;
  }
  return [...tags, N5_TAG];
}

/**
 * Get the lesson path for a tag.
 *
 * Paths are derived from the lesson files on disk by the extraction script
 * (`src/data/lesson-paths.json`), so new lessons are linked automatically with
 * no manual mapping. Unknown tags fall back to the vocabulary folder.
 */
export function getTagPath(tag: string): string {
  const paths = lessonPaths as Record<string, string>;
  return paths[tag.toLowerCase()] ?? `docs/lessons/vocabulary/${tag}`;
}

export default function Vocabulary(): React.JSX.Element {
  const baseUrl = useBaseUrl('/');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [sortBy, setSortBy] = useState('hiragana');
  const types = ['all', ...VALID_TYPES];
  const vocabularyWithJlptTags = useMemo(
    () =>
      vocabularyData.map(item => {
        if (!isN5VocabularyItem(item)) {
          return item;
        }
        return {
          ...item,
          tags: addN5Tag(item.tags),
        };
      }),
    [],
  );

  const filteredAndSortedVocabulary = useMemo(() => {
    const filtered = vocabularyWithJlptTags.filter(item => {
      const matchesSearch =
        item.hiragana?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.katakana?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.kanji?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.romaji.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.meaning.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
      const matchesType = selectedType === 'all' || item.type === selectedType;

      return matchesSearch && matchesCategory && matchesType;
    });

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'hiragana':
          return (a.hiragana || '').localeCompare(b.hiragana || '');
        case 'romaji':
          return a.romaji.localeCompare(b.romaji);
        case 'meaning':
          return a.meaning.localeCompare(b.meaning);
        case 'category':
          return a.category.localeCompare(b.category);
        default:
          return 0;
      }
    });

    return filtered;
  }, [
    searchTerm,
    selectedCategory,
    selectedType,
    sortBy,
    vocabularyWithJlptTags,
  ]);

  return (
    <Layout title="Vocabulary" description="Japanese vocabulary with search and filtering">
      <div className="container margin-vert--lg">
        <div className="row">
          <div className="col col--12">
            <h1>Japanese Vocabulary</h1>
            <p>Search and explore Japanese vocabulary with hiragana, katakana, kanji, and romaji.</p>

            <div className={styles.controls}>
              <div className={styles.searchBox}>
                <input
                  type="text"
                  placeholder="Search vocabulary..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={styles.searchInput}
                />
              </div>

              <div className={styles.filters}>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className={styles.filterSelect}
                >
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category === 'all' ? 'All categories' : category.charAt(0).toUpperCase() + category.slice(1)}
                    </option>
                  ))}
                </select>

                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className={styles.filterSelect}
                >
                  {types.map(type => (
                    <option key={type} value={type}>
                      {type === 'all' ? 'All types' : type}
                    </option>
                  ))}
                </select>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className={styles.filterSelect}
                >
                  {sortOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>

              </div>
            </div>

            <div className={styles.resultsCount}>
              Showing {filteredAndSortedVocabulary.length} of {vocabularyData.length} vocabulary items
            </div>

            <div className={styles.vocabularyGrid}>
              {filteredAndSortedVocabulary.map(item => (
                <div key={item.id} className={styles.vocabularyCard}>
                  <div className={styles.japanese}>
                    {item.kanji && (
                      <div className={styles.kanji}>{item.kanji}</div>
                    )}
                    {item.hiragana && (
                      <div className={styles.hiragana}>{item.hiragana}</div>
                    )}
                    {item.katakana && (
                      <div className={styles.katakana}>{item.katakana}</div>
                    )}
                    <div className={styles.romaji}>{item.romaji}</div>
                  </div>
                  <div className={styles.meaning}>{item.meaning}</div>
                  <div className={styles.meta}>
                    <span className={styles.category}>{item.type || 'unknown'}</span>
                  </div>
                  <div className={styles.tags}>
                    {item.tags.map(tag => {
                      const tagUrl = `${baseUrl}${getTagPath(tag)}`;
                      return (
                        <a
                          key={tag}
                          href={tagUrl}
                          className={styles.tag}
                          onClick={(e) => {
                            e.preventDefault();
                            window.location.href = tagUrl;
                          }}
                        >
                          {tag}
                        </a>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {filteredAndSortedVocabulary.length === 0 && (
              <div className={styles.noResults}>
                <h3>No vocabulary found</h3>
                <p>Try adjusting your search terms or filters.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}

