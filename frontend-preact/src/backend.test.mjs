import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  BackendError,
  backendError,
  parseCount,
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

  it('passes through plain strings and non-bridge values', () => {
    assert.equal(unwrapBridge('plain', 'get_time'), 'plain');
    assert.equal(unwrapBridge(42, 'get_time'), 42);
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

describe('backendError', () => {
  it('formats BackendError, Error, and unknown values', () => {
    assert.equal(backendError(new BackendError('boom')), 'boom');
    assert.equal(backendError(new Error('fail')), 'fail');
    assert.equal(backendError('plain failure'), 'plain failure');
  });
});
