import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { createNoteSearcher } from './notes-search.mjs';

const notes = [
  {
    id: 'scanner',
    title: 'Scanner flow',
    tag: 'Product',
    question: 'How should a disk scan report progress?',
    answer: 'Use a cancellable scan and surface the largest folders first.'
  },
  {
    id: 'audio',
    title: 'Audio notes',
    tag: 'Research',
    question: 'What is the right scope for an equalizer?',
    answer: 'Keep the first equalizer app-local.'
  }
];

describe('createNoteSearcher', () => {
  it('returns all notes for an empty query', () => {
    const searcher = createNoteSearcher(notes);
    assert.strictEqual(searcher.search(''), notes);
    assert.strictEqual(searcher.search('   '), notes);
  });

  it('finds a note from a typo across its Q&A fields', () => {
    const searcher = createNoteSearcher(notes);
    assert.equal(searcher.search('scannr progress')[0].id, 'scanner');
  });
});
