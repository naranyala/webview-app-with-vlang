import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  createAutosave,
  flushRegisteredAutosaves,
  registerAutosave
} from './autosave.mjs';

test('navigation flush preserves the latest edit for each note', async () => {
  const writes = [];
  const save = createAutosave(async (value) => writes.push(value));
  save.schedule('a', 'old');
  save.schedule('a', 'latest');
  save.schedule('b', 'other note');
  assert.equal(await save.flush(), true);
  assert.deepEqual(writes, ['latest', 'other note']);
});

test('a slow write finishes before a newer flushed write starts', async () => {
  const writes = [];
  let release;
  const blocked = new Promise((resolve) => {
    release = resolve;
  });
  const save = createAutosave(async (value) => {
    if (value === 'first') await blocked;
    writes.push(value);
  });
  save.schedule('a', 'first');
  const first = save.flush();
  await Promise.resolve();
  save.schedule('a', 'second');
  const second = save.flush();
  assert.deepEqual(writes, []);
  release();
  await Promise.all([first, second]);
  assert.deepEqual(writes, ['first', 'second']);
});

test('a failed write is reported without blocking later saves', async () => {
  const errors = [];
  const writes = [];
  const save = createAutosave(
    async (value) => {
      if (value === 'bad') throw new Error('Disk full');
      writes.push(value);
    },
    { onError: (error) => errors.push(error.message) }
  );
  save.schedule('a', 'bad');
  assert.equal(await save.flush(), false);
  save.schedule('a', 'retry');
  assert.equal(await save.flush(), true);
  assert.deepEqual(errors, ['Disk full']);
  assert.deepEqual(writes, ['retry']);
});

test('registered autosaves flush before application close', async () => {
  const writes = [];
  const save = createAutosave(async (value) => writes.push(value));
  const unregister = registerAutosave(save.flush);

  save.schedule('note-1', 'latest');
  assert.equal(await flushRegisteredAutosaves(), true);
  assert.deepEqual(writes, ['latest']);

  unregister();
  save.schedule('note-1', 'not flushed');
  assert.equal(await flushRegisteredAutosaves(), true);
  assert.deepEqual(writes, ['latest']);
});

test('a failed registered autosave blocks close', async () => {
  const save = createAutosave(async () => {
    throw new Error('Disk full');
  });
  const unregister = registerAutosave(save.flush);

  save.schedule('note-1', 'pending');
  assert.equal(await flushRegisteredAutosaves(), false);
  unregister();
});
