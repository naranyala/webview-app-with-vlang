import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { parseExternalChat, parseStoredQna, serializeQna } from './qna.mjs';

describe('Q&A model', () => {
  it('round-trips the canonical stored envelope', () => {
    assert.deepEqual(parseStoredQna(serializeQna('What?', 'This.')), {
      question: 'What?',
      answer: 'This.'
    });
  });

  it('imports labelled external chats and paragraph-separated text', () => {
    assert.deepEqual(parseExternalChat('Question: Why?\n\nAnswer: Because.'), {
      question: 'Why?',
      answer: 'Because.'
    });
    assert.deepEqual(parseExternalChat('A question\n\nAn answer'), {
      question: 'A question',
      answer: 'An answer'
    });
  });

  it('keeps a single unlabelled answer recoverable', () => {
    assert.deepEqual(parseExternalChat('Only one block'), {
      question: '',
      answer: 'Only one block'
    });
  });
});
