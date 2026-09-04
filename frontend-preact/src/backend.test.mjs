import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  BackendError,
  backend,
  backendError,
  parseCount,
  parseQuizPayload,
  unwrapBridge
} from './backend.js';

describe('unwrapBridge', () => {
  it('returns data from successful bridge payloads', () => {
    assert.equal(
      unwrapBridge('{"ok":true,"data":"Linux"}', 'get_system_info'),
      'Linux'
    );
  });

  it('throws BackendError for failed bridge payloads', () => {
    assert.throws(
      () => unwrapBridge('{"ok":false,"error":"nope"}', 'increment'),
      (error) => error instanceof BackendError && error.message === 'nope'
    );
  });

  it('preserves stable backend error codes', () => {
    assert.throws(
      () => unwrapBridge('{"ok":false,"code":"StorageCorrupt","error":"bad"}'),
      (error) => error.code === 'StorageCorrupt'
    );
  });

  it('passes through plain strings and non-bridge values', () => {
    assert.equal(unwrapBridge('plain', 'get_time'), 'plain');
    assert.equal(unwrapBridge(42, 'get_time'), 42);
  });
});

describe('native note adapter', () => {
  it('converts the canonical native body into the editor shape', async () => {
    globalThis.window = {
      get_notes: () =>
        Promise.resolve(
          JSON.stringify({
            ok: true,
            data: JSON.stringify([
              {
                id: 'note-1',
                title: 'Native note',
                tag: 'Research',
                updated: 'Just now',
                body: 'Question:\nWhat?\n\nAnswer:\nThis.'
              }
            ])
          })
        )
    };
    assert.deepEqual(await backend.getNotes(), [
      {
        id: 'note-1',
        title: 'Native note',
        tag: 'Research',
        updated: 'Just now',
        question: 'What?',
        answer: 'This.'
      }
    ]);
    delete globalThis.window;
  });
});

describe('parseCount', () => {
  it('accepts integer values and numeric strings', () => {
    assert.equal(parseCount(3), 3);
    assert.equal(parseCount('4'), 4);
  });

  it('rejects non-integer payloads', () => {
    assert.throws(() => parseCount('abc'), BackendError);
    assert.throws(() => parseCount(1.5), BackendError);
    assert.throws(() => parseCount(Number.NaN), BackendError);
  });
});

describe('parseQuizPayload', () => {
  it('unwraps and parses structured quiz data', () => {
    assert.deepEqual(
      parseQuizPayload(
        '{"ok":true,"data":"[{\\"id\\":\\"deck-1\\",\\"title\\":\\"Deck\\",\\"description\\":\\"Study\\",\\"tone\\":\\"blue\\",\\"level\\":\\"Beginner\\",\\"questions\\":[]}]"}'
      ),
      [
        {
          id: 'deck-1',
          title: 'Deck',
          description: 'Study',
          tone: 'blue',
          level: 'Beginner',
          questions: []
        }
      ]
    );
  });

  it('rejects malformed structured quiz data', () => {
    assert.throws(
      () => parseQuizPayload('{"ok":true,"data":"broken"}'),
      BackendError
    );
  });

  it('accepts plain status strings from delete bindings', () => {
    assert.equal(
      parseQuizPayload(
        '{"ok":true,"data":"Quiz collection deleted"}',
        'quiz_delete_collection'
      ),
      'Quiz collection deleted'
    );
  });
});

describe('backendError', () => {
  it('formats BackendError, Error, and unknown values', () => {
    assert.equal(backendError(new BackendError('boom')), 'boom');
    assert.equal(backendError(new Error('fail')), 'fail');
    assert.equal(backendError('plain failure'), 'plain failure');
  });
});
