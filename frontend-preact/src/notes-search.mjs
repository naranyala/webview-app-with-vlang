import { Searcher } from 'fast-fuzzy';

export const FUSE_NOTE_SEARCH_OPTIONS = {
  ignoreLocation: true,
  includeScore: false,
  minMatchCharLength: 2,
  shouldSort: true,
  threshold: 0.42,
  keys: [
    { name: 'title', weight: 0.35 },
    { name: 'question', weight: 0.35 },
    { name: 'answer', weight: 0.2 },
    { name: 'tag', weight: 0.1 }
  ]
};

export const FAST_FUZZY_NOTE_OPTIONS = {
  ignoreCase: true,
  normalizeWhitespace: true,
  sortBy: 'bestMatch',
  threshold: 0.6,
  keySelector: (note) => [note.title, note.question, note.answer, note.tag]
};

export function createNoteSearcher(notes) {
  const searcher = new Searcher(notes, FAST_FUZZY_NOTE_OPTIONS);

  return {
    search(query) {
      const normalizedQuery = query.trim();
      if (!normalizedQuery) return notes;
      return searcher.search(normalizedQuery);
    }
  };
}
