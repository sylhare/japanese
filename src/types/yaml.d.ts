declare module '*.yaml' {
  const content: {
    vocabulary: Array<{
      id: string;
      hiragana: string;
      katakana?: string;
      kanji?: string;
      romaji: string;
      meaning: string;
      category: string;
      tags: string[];
      lesson?: string;
    }>;
    categories: string[];
    sortOptions: Array<{
      value: string;
      label: string;
    }>;
  };
  export default content;
}
