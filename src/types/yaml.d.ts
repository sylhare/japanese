declare module '*.yaml' {
  const content: import('../data/vocabulary-types').VocabularyData;
  export default content;
}
