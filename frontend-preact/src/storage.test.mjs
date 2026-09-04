import 'fake-indexeddb/auto';
import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import {
  frontendDb,
  LEGACY_STORAGE_KEYS,
  loadAcademicPapersFromStorage,
  loadChainNotesFromStorage,
  loadTodosFromStorage,
  STORAGE_BACKUP_KEY,
  saveAcademicPapersToStorage,
  saveTodosToStorage
} from './storage.mjs';

class MemoryStorage {
  values = new Map();

  getItem(key) {
    return this.values.has(key) ? this.values.get(key) : null;
  }

  setItem(key, value) {
    this.values.set(key, String(value));
  }
}

describe('IndexedDB frontend storage', () => {
  before(async () => {
    globalThis.window = { localStorage: new MemoryStorage() };
    await frontendDb.delete();
    window.localStorage.setItem(
      LEGACY_STORAGE_KEYS.todos,
      JSON.stringify([{ id: 'todo-1', title: 'Migrate', completed: false }])
    );
    window.localStorage.setItem(
      LEGACY_STORAGE_KEYS.academicPapers,
      JSON.stringify([{ id: 'paper-1', title: 'Migrated paper' }])
    );
  });

  after(async () => {
    await frontendDb.delete();
    delete globalThis.window;
  });

  it('backs up and migrates legacy collections once', async () => {
    assert.deepEqual(await loadTodosFromStorage(), [
      { id: 'todo-1', title: 'Migrate', completed: false, dueDate: null }
    ]);
    assert.deepEqual(await loadAcademicPapersFromStorage(), [
      {
        id: 'paper-1',
        title: 'Migrated paper',
        subtitle: '',
        authors: [],
        venue: '',
        year: '',
        abstract: '',
        keywords: [],
        sections: [],
        references: [],
        assets: []
      }
    ]);

    const backup = JSON.parse(window.localStorage.getItem(STORAGE_BACKUP_KEY));
    assert.equal(
      backup.values[LEGACY_STORAGE_KEYS.todos].includes('todo-1'),
      true
    );
    assert.equal(
      backup.values[LEGACY_STORAGE_KEYS.academicPapers].includes('paper-1'),
      true
    );
  });

  it('keeps empty migrated collections empty and stores assets as Blobs', async () => {
    assert.deepEqual(await loadChainNotesFromStorage(), null);
    assert.equal(
      await saveTodosToStorage([
        { id: 'todo-2', title: 'Saved', completed: true, dueDate: null }
      ]),
      true
    );
    assert.deepEqual(await loadTodosFromStorage(), [
      { id: 'todo-2', title: 'Saved', completed: true, dueDate: null }
    ]);

    await saveAcademicPapersToStorage([
      {
        id: 'paper-2',
        title: 'Assets',
        assets: [
          {
            id: 'asset-1',
            name: 'figure.png',
            type: 'image/png',
            src: 'data:image/png;base64,AA==',
            alt: 'Figure',
            caption: ''
          }
        ]
      }
    ]);
    const [asset] = await frontendDb.paperAssets.toArray();
    assert.equal(asset.blob instanceof Blob, true);
    assert.equal(
      (await loadAcademicPapersFromStorage())[0].assets[0].src,
      'data:image/png;base64,AA=='
    );
  });
});
