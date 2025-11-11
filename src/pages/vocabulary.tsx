import React, { useState, useMemo } from 'react';
import Layout from '@theme/Layout';
import useBaseUrl from '@docusaurus/useBaseUrl';
import styles from './vocabulary.module.css';
import vocabularyYamlData from '../data/vocabulary.yaml';

interface VocabularyItem {
  id: string;
  hiragana: string;
  katakana?: string;
  kanji?: string;
  romaji: string;
  meaning: string;
  category: string;
  tags: string[];
  type?: string;
}

const vocabularyData: VocabularyItem[] = vocabularyYamlData.vocabulary;
const categories = vocabularyYamlData.categories;
const sortOptions = vocabularyYamlData.sortOptions;

export default function Vocabulary(): React.JSX.Element {
  const baseUrl = useBaseUrl('/');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('hiragana');
  const [showOnlyHiragana, setShowOnlyHiragana] = useState(false);
  const [showOnlyKatakana, setShowOnlyKatakana] = useState(false);

  const filteredAndSortedVocabulary = useMemo(() => {
    let filtered = vocabularyData.filter(item => {
      const matchesSearch = 
        item.hiragana?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.katakana?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.kanji?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.romaji.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.meaning.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
      
      const matchesHiragana = !showOnlyHiragana || item.hiragana;
      const matchesKatakana = !showOnlyKatakana || item.katakana;

      return matchesSearch && matchesCategory && matchesHiragana && matchesKatakana;
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
  }, [searchTerm, selectedCategory, sortBy, showOnlyHiragana, showOnlyKatakana]);

  return (
    <Layout title="Vocabulary" description="Japanese vocabulary with search and filtering">
      <div className="container margin-vert--lg">
        <div className="row">
          <div className="col col--12">
            <h1>Japanese Vocabulary</h1>
            <p>Search and explore Japanese vocabulary with hiragana, katakana, kanji, and romaji.</p>
            
            {/* Search and Filter Controls */}
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
                      {category.charAt(0).toUpperCase() + category.slice(1)}
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
                
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={showOnlyHiragana}
                    onChange={(e) => setShowOnlyHiragana(e.target.checked)}
                  />
                  Hiragana only
                </label>
                
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={showOnlyKatakana}
                    onChange={(e) => setShowOnlyKatakana(e.target.checked)}
                  />
                  Katakana only
                </label>
              </div>
            </div>

            {/* Results Count */}
            <div className={styles.resultsCount}>
              Showing {filteredAndSortedVocabulary.length} of {vocabularyData.length} vocabulary items
            </div>

            {/* Vocabulary Grid */}
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
                      const tagUrl = `${baseUrl}docs/lessons/vocabulary/${tag}`;
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
