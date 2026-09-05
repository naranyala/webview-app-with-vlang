import Dexie from 'dexie';
import {
  parseAcademicPaper,
  parseAcademicPaperRecords,
  parseAssetRecords,
  parseAudioFeatureRecords,
  parseChainNoteRecords,
  parseTodoRecords
} from './schemas.mjs';

export const STORAGE_DB_NAME = 'webview-app';
export const STORAGE_DB_VERSION = 2;
export const STORAGE_BACKUP_KEY = 'webview-app.local-storage-backup.v1';

const TODO_STORAGE_KEY = 'preact-todomvc.todos';
const CHAIN_NOTES_STORAGE_KEY = 'webview-app.chain-notes';
const ACADEMIC_PAPERS_STORAGE_KEY = 'webview-app.academic-papers';
const ASSETS_STORAGE_KEY = 'webview-app.assets';
const AUDIO_FEATURES_STORAGE_KEY = 'webview-app.audio-features';
const MIGRATION_KEY = 'migration:local-storage:v1';

export const LEGACY_STORAGE_KEYS = {
  todos: TODO_STORAGE_KEY,
  chainNotes: CHAIN_NOTES_STORAGE_KEY,
  academicPapers: ACADEMIC_PAPERS_STORAGE_KEY,
  assets: ASSETS_STORAGE_KEY,
  audioFeatures: AUDIO_FEATURES_STORAGE_KEY
};

export const frontendDb = new Dexie(STORAGE_DB_NAME);
frontendDb.version(1).stores({
  metadata: 'key',
  todos: 'id,dueDate,completed',
  chainNotes: 'id,tag,updated',
  papers: 'id,year',
  paperReferences: 'id,paperId,year',
  paperAssets: 'id,paperId,type'
});
frontendDb
  .version(STORAGE_DB_VERSION)
  .stores({
    metadata: 'key',
    todos: 'id,dueDate,completed',
    chainNotes: 'id,tag,updated',
    papers: 'id,year',
    paperReferences: 'id,paperId,year',
    paperAssets: 'id,paperId,type',
    assets: 'id,kind,path',
    audioFeatures: 'path,tempo,key'
  })
  .upgrade((transaction) =>
    transaction.table('metadata').put({
      key: 'schema',
      version: STORAGE_DB_VERSION
    })
  );

const allTables = [
  frontendDb.metadata,
  frontendDb.todos,
  frontendDb.chainNotes,
  frontendDb.papers,
  frontendDb.paperReferences,
  frontendDb.paperAssets,
  frontendDb.assets,
  frontendDb.audioFeatures
];

let initialization;

function indexedDbAvailable() {
  return typeof window !== 'undefined' && typeof indexedDB !== 'undefined';
}

function readLegacyValue(key) {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function parseLegacyValue(key) {
  const raw = readLegacyValue(key);
  if (raw === null) return { present: false, value: null };
  try {
    return { present: true, value: JSON.parse(raw) };
  } catch {
    return { present: true, value: null };
  }
}

function backupLegacyValues(values) {
  if (readLegacyValue(STORAGE_BACKUP_KEY) !== null) return;
  window.localStorage.setItem(
    STORAGE_BACKUP_KEY,
    JSON.stringify({
      version: STORAGE_DB_VERSION,
      createdAt: new Date().toISOString(),
      values
    })
  );
}

function dataUrlToBlob(src, type) {
  if (typeof Blob === 'undefined' || typeof atob === 'undefined') return null;
  if (!src.startsWith('data:')) return null;

  const [header, encoded] = src.split(',', 2);
  if (!encoded) return null;
  const binary = atob(encoded);
  const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
  const headerType = header.match(/^data:([^;]+)/)?.[1];
  return new Blob([bytes], {
    type: headerType || type || 'application/octet-stream'
  });
}

function blobToDataUrl(blob) {
  if (typeof FileReader === 'undefined') {
    if (typeof btoa === 'undefined') return Promise.resolve('');
    return blob.arrayBuffer().then((buffer) => {
      const binary = String.fromCharCode(...new Uint8Array(buffer));
      return `data:${blob.type || 'application/octet-stream'};base64,${btoa(binary)}`;
    });
  }
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () =>
      reject(reader.error || new Error('Could not read asset.'));
    reader.readAsDataURL(blob);
  });
}

async function serializePaperRecords(papers) {
  const normalized = parseAcademicPaperRecords(papers);
  const paperRows = [];
  const referenceRows = [];
  const assetRows = [];

  for (const paper of normalized) {
    const { references, assets, ...paperRow } = paper;
    paperRows.push(paperRow);
    referenceRows.push(
      ...references.map((reference) => ({ ...reference, paperId: paper.id }))
    );
    for (const asset of assets) {
      const blob = dataUrlToBlob(asset.src, asset.type);
      assetRows.push({
        ...asset,
        paperId: paper.id,
        blob,
        src: blob ? '' : asset.src
      });
    }
  }

  return { normalized, paperRows, referenceRows, assetRows };
}

async function deserializePaperRows(paperRows, referenceRows, assetRows) {
  const referencesByPaper = new Map();
  const assetsByPaper = new Map();

  for (const reference of referenceRows) {
    const references = referencesByPaper.get(reference.paperId) || [];
    const { paperId, ...paperReference } = reference;
    references.push(paperReference);
    referencesByPaper.set(paperId, references);
  }

  for (const asset of assetRows) {
    const assets = assetsByPaper.get(asset.paperId) || [];
    const { paperId, blob, ...paperAsset } = asset;
    assets.push({
      ...paperAsset,
      src: blob ? await blobToDataUrl(blob) : paperAsset.src
    });
    assetsByPaper.set(paperId, assets);
  }

  return paperRows
    .map((paper) =>
      parseAcademicPaper({
        ...paper,
        references: referencesByPaper.get(paper.id) || [],
        assets: assetsByPaper.get(paper.id) || []
      })
    )
    .filter(Boolean);
}

async function migrateLegacyStorage() {
  const migration = await frontendDb.metadata.get(MIGRATION_KEY);
  if (migration) return migration;

  const legacy = {
    [TODO_STORAGE_KEY]: readLegacyValue(TODO_STORAGE_KEY),
    [CHAIN_NOTES_STORAGE_KEY]: readLegacyValue(CHAIN_NOTES_STORAGE_KEY),
    [ACADEMIC_PAPERS_STORAGE_KEY]: readLegacyValue(ACADEMIC_PAPERS_STORAGE_KEY)
  };
  const migratedKeys = Object.entries(legacy)
    .filter(([, value]) => value !== null)
    .map(([key]) => key);

  if (migratedKeys.length > 0) backupLegacyValues(legacy);

  const todos = parseLegacyValue(TODO_STORAGE_KEY);
  const notes = parseLegacyValue(CHAIN_NOTES_STORAGE_KEY);
  const papers = parseLegacyValue(ACADEMIC_PAPERS_STORAGE_KEY);
  const paperRecords = await serializePaperRecords(
    papers.present && Array.isArray(papers.value) ? papers.value : []
  );

  await frontendDb.transaction('rw', allTables, async () => {
    if (todos.present)
      await frontendDb.todos.bulkPut(parseTodoRecords(todos.value));
    if (notes.present) {
      await frontendDb.chainNotes.bulkPut(parseChainNoteRecords(notes.value));
    }
    if (papers.present) {
      await frontendDb.papers.bulkPut(paperRecords.paperRows);
      await frontendDb.paperReferences.bulkPut(paperRecords.referenceRows);
      await frontendDb.paperAssets.bulkPut(paperRecords.assetRows);
    }
    for (const key of migratedKeys) {
      await frontendDb.metadata.put({
        key: `collection:${key}`,
        initialized: true
      });
    }
    await frontendDb.metadata.put({
      key: MIGRATION_KEY,
      version: STORAGE_DB_VERSION,
      migratedKeys
    });
  });

  return { migratedKeys };
}

async function initializeStorage() {
  if (!indexedDbAvailable()) return false;
  if (!initialization) {
    initialization = frontendDb.open().then(() => migrateLegacyStorage());
  }
  await initialization;
  return true;
}

async function collectionInitialized(key) {
  return Boolean(await frontendDb.metadata.get(`collection:${key}`));
}

function readLegacyRecords(key, parser) {
  const legacy = parseLegacyValue(key);
  return legacy.present && Array.isArray(legacy.value)
    ? parser(legacy.value)
    : null;
}

function writeLegacyRecords(key, records) {
  try {
    window.localStorage.setItem(key, JSON.stringify(records));
    return true;
  } catch {
    return false;
  }
}

async function markCollectionInitialized(key) {
  await frontendDb.metadata.put({
    key: `collection:${key}`,
    initialized: true
  });
}

export async function loadTodosFromStorage() {
  if (!indexedDbAvailable())
    return readLegacyRecords(TODO_STORAGE_KEY, parseTodoRecords);
  try {
    await initializeStorage();
    const records = parseTodoRecords(await frontendDb.todos.toArray());
    return records.length || (await collectionInitialized(TODO_STORAGE_KEY))
      ? records
      : null;
  } catch {
    return readLegacyRecords(TODO_STORAGE_KEY, parseTodoRecords);
  }
}

export async function saveTodosToStorage(todos) {
  const records = parseTodoRecords(todos);
  if (!indexedDbAvailable())
    return writeLegacyRecords(TODO_STORAGE_KEY, records);
  try {
    await initializeStorage();
    await frontendDb.transaction(
      'rw',
      [frontendDb.todos, frontendDb.metadata],
      async () => {
        await frontendDb.todos.clear();
        await frontendDb.todos.bulkPut(records);
        await markCollectionInitialized(TODO_STORAGE_KEY);
      }
    );
    return true;
  } catch {
    return writeLegacyRecords(TODO_STORAGE_KEY, records);
  }
}

export async function loadChainNotesFromStorage() {
  if (!indexedDbAvailable()) {
    return readLegacyRecords(CHAIN_NOTES_STORAGE_KEY, parseChainNoteRecords);
  }
  try {
    await initializeStorage();
    const records = parseChainNoteRecords(
      await frontendDb.chainNotes.toArray()
    );
    return records.length ||
      (await collectionInitialized(CHAIN_NOTES_STORAGE_KEY))
      ? records
      : null;
  } catch {
    return readLegacyRecords(CHAIN_NOTES_STORAGE_KEY, parseChainNoteRecords);
  }
}

export async function saveChainNotesToStorage(notes) {
  const records = parseChainNoteRecords(notes);
  if (!indexedDbAvailable())
    return writeLegacyRecords(CHAIN_NOTES_STORAGE_KEY, records);
  try {
    await initializeStorage();
    await frontendDb.transaction(
      'rw',
      [frontendDb.chainNotes, frontendDb.metadata],
      async () => {
        await frontendDb.chainNotes.clear();
        await frontendDb.chainNotes.bulkPut(records);
        await markCollectionInitialized(CHAIN_NOTES_STORAGE_KEY);
      }
    );
    return true;
  } catch {
    return writeLegacyRecords(CHAIN_NOTES_STORAGE_KEY, records);
  }
}

export async function loadAcademicPapersFromStorage() {
  if (!indexedDbAvailable()) {
    return readLegacyRecords(
      ACADEMIC_PAPERS_STORAGE_KEY,
      parseAcademicPaperRecords
    );
  }
  try {
    await initializeStorage();
    const records = await deserializePaperRows(
      await frontendDb.papers.toArray(),
      await frontendDb.paperReferences.toArray(),
      await frontendDb.paperAssets.toArray()
    );
    return records.length ||
      (await collectionInitialized(ACADEMIC_PAPERS_STORAGE_KEY))
      ? records
      : null;
  } catch {
    return readLegacyRecords(
      ACADEMIC_PAPERS_STORAGE_KEY,
      parseAcademicPaperRecords
    );
  }
}

export async function saveAcademicPapersToStorage(papers) {
  const { paperRows, referenceRows, assetRows, normalized } =
    await serializePaperRecords(papers);
  if (!indexedDbAvailable()) {
    return writeLegacyRecords(ACADEMIC_PAPERS_STORAGE_KEY, normalized);
  }
  try {
    await initializeStorage();
    await frontendDb.transaction(
      'rw',
      [
        frontendDb.papers,
        frontendDb.paperReferences,
        frontendDb.paperAssets,
        frontendDb.metadata
      ],
      async () => {
        await frontendDb.papers.clear();
        await frontendDb.paperReferences.clear();
        await frontendDb.paperAssets.clear();
        await frontendDb.papers.bulkPut(paperRows);
        await frontendDb.paperReferences.bulkPut(referenceRows);
        await frontendDb.paperAssets.bulkPut(assetRows);
        await markCollectionInitialized(ACADEMIC_PAPERS_STORAGE_KEY);
      }
    );
    return true;
  } catch {
    return writeLegacyRecords(ACADEMIC_PAPERS_STORAGE_KEY, normalized);
  }
}

export async function loadStudioAssetsFromStorage() {
  if (!indexedDbAvailable()) {
    return readLegacyRecords(ASSETS_STORAGE_KEY, parseAssetRecords);
  }
  try {
    await initializeStorage();
    const records = parseAssetRecords(await frontendDb.assets.toArray());
    return records.length || (await collectionInitialized(ASSETS_STORAGE_KEY))
      ? records
      : null;
  } catch {
    return readLegacyRecords(ASSETS_STORAGE_KEY, parseAssetRecords);
  }
}

export async function saveStudioAssetsToStorage(assets) {
  const records = parseAssetRecords(assets);
  if (!indexedDbAvailable())
    return writeLegacyRecords(ASSETS_STORAGE_KEY, records);
  try {
    await initializeStorage();
    await frontendDb.transaction(
      'rw',
      [frontendDb.assets, frontendDb.metadata],
      async () => {
        await frontendDb.assets.clear();
        await frontendDb.assets.bulkPut(records);
        await markCollectionInitialized(ASSETS_STORAGE_KEY);
      }
    );
    return true;
  } catch {
    return writeLegacyRecords(ASSETS_STORAGE_KEY, records);
  }
}

export async function loadAudioFeaturesFromStorage() {
  if (!indexedDbAvailable()) {
    return readLegacyRecords(
      AUDIO_FEATURES_STORAGE_KEY,
      parseAudioFeatureRecords
    );
  }
  try {
    await initializeStorage();
    const records = parseAudioFeatureRecords(
      await frontendDb.audioFeatures.toArray()
    );
    return records.length ||
      (await collectionInitialized(AUDIO_FEATURES_STORAGE_KEY))
      ? records
      : null;
  } catch {
    return readLegacyRecords(
      AUDIO_FEATURES_STORAGE_KEY,
      parseAudioFeatureRecords
    );
  }
}

export async function saveAudioFeaturesToStorage(features) {
  const records = parseAudioFeatureRecords(features);
  if (!indexedDbAvailable())
    return writeLegacyRecords(AUDIO_FEATURES_STORAGE_KEY, records);
  try {
    await initializeStorage();
    await frontendDb.transaction(
      'rw',
      [frontendDb.audioFeatures, frontendDb.metadata],
      async () => {
        await frontendDb.audioFeatures.clear();
        await frontendDb.audioFeatures.bulkPut(records);
        await markCollectionInitialized(AUDIO_FEATURES_STORAGE_KEY);
      }
    );
    return true;
  } catch {
    return writeLegacyRecords(AUDIO_FEATURES_STORAGE_KEY, records);
  }
}
