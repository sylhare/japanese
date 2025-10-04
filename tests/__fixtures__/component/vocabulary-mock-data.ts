export const mockVocabularyData = {
  vocabulary: [
    {
      id: 'test_1',
      hiragana: 'あか',
      kanji: '赤',
      romaji: 'aka',
      meaning: 'red',
      category: 'vocabulary',
      tags: ['colors'],
      type: 'い-adjective'
    },
    {
      id: 'test_2',
      hiragana: 'あお',
      kanji: '青',
      romaji: 'ao',
      meaning: 'blue',
      category: 'vocabulary',
      tags: ['colors'],
      type: 'い-adjective'
    },
    {
      id: 'test_3',
      hiragana: 'あまい',
      kanji: '甘い',
      romaji: 'amai',
      meaning: 'sweet',
      category: 'vocabulary',
      tags: ['tastes'],
      type: 'い-adjective'
    },
    {
      id: 'test_4',
      katakana: 'コーヒー',
      romaji: 'koohii',
      meaning: 'coffee',
      category: 'vocabulary',
      tags: ['tastes'],
      type: 'noun'
    }
  ],
  categories: ['all', 'vocabulary'],
  sortOptions: [
    { value: 'hiragana', label: 'Hiragana (A-Z)' },
    { value: 'romaji', label: 'Romaji (A-Z)' },
    { value: 'meaning', label: 'Meaning (A-Z)' },
    { value: 'category', label: 'Category' }
  ]
};
