import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  parseAcademicPaperRecords,
  parseChainNoteRecords,
  parseQuizPayloadValue,
  parseTodoRecords
} from './schemas.mjs';

describe('frontend persistence schemas', () => {
  it('migrates legacy todos without a due date', () => {
    assert.deepEqual(
      parseTodoRecords([
        { id: 'todo-1', title: 'Read', completed: false },
        {
          id: 'todo-2',
          title: 'Write',
          completed: false,
          dueDate: '2026-09-05'
        },
        {
          id: 'todo-3',
          title: 'Review',
          completed: false,
          dueDate: 'not-a-date'
        }
      ]),
      [
        { id: 'todo-1', title: 'Read', completed: false, dueDate: null },
        {
          id: 'todo-2',
          title: 'Write',
          completed: false,
          dueDate: '2026-09-05'
        },
        {
          id: 'todo-3',
          title: 'Review',
          completed: false,
          dueDate: null
        }
      ]
    );
  });

  it('drops malformed records without failing the whole store', () => {
    assert.equal(
      parseChainNoteRecords([{ id: 'valid' }, { id: 'also-valid' }]).length,
      0
    );
    assert.deepEqual(parseAcademicPaperRecords([{ id: 'missing-title' }]), []);
  });

  it('rejects invalid structured Quiz payloads', () => {
    assert.equal(
      parseQuizPayloadValue([{ id: 'incomplete', questions: [] }]),
      undefined
    );
    assert.equal(
      parseQuizPayloadValue('Quiz collection deleted'),
      'Quiz collection deleted'
    );
  });
});
