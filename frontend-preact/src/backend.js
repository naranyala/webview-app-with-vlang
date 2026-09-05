/**
 * V backend bridge.
 *
 * Inside the native WebView each `window.*` function is bound by V
 * (`bridge.v` via `plugins.v`) and returns a Promise of a JSON-encoded
 * BridgeResponse: `{ "ok": true, "data": "..." }` or
 * `{ "ok": false, "error": "..." }`.
 * Under `npm run dev` / esbuild serve those bindings don't exist, so every
 * helper falls back to a mock that keeps the UI usable in the browser.
 *
 * Native calls use the V-owned counter, system info, status, timestamp, and
 * window controls. Browser fallbacks stay app-local. Every native call is
 * bounded by a timeout so a hung bridge cannot freeze the UI.
 */

import { parseStoredQna } from './qna.mjs';
import { parseQuizPayloadValue } from './schemas.mjs';

const BRIDGE_TIMEOUT_MS = 8000;

const NATIVE_BINDINGS = [
  'greet_from_v',
  'get_time',
  'get_system_info',
  'get_status',
  'get_notes',
  'create_note',
  'update_note',
  'delete_note',
  'save_pdf',
  'increment',
  'reset',
  'minimize_window',
  'maximize_window',
  'restore_window',
  'close_window',
  'quiz_list',
  'quiz_create_collection',
  'quiz_update_collection',
  'quiz_delete_collection',
  'quiz_create_question',
  'quiz_update_question',
  'quiz_delete_question',
  'list_volumes',
  'start_asset_scan',
  'get_asset_scan_status',
  'cancel_asset_scan',
  'get_audio_metadata',
  'analyze_audio',
  'mir_analyze'
];

export class BackendError extends Error {
  constructor(message, options = {}) {
    super(message);
    this.name = 'BackendError';
    this.code = options.code ?? 'backend_error';
    this.binding = options.binding;
  }
}

function hasBinding(name) {
  return typeof window !== 'undefined' && typeof window[name] === 'function';
}

function mockValue(name) {
  switch (name) {
    case 'increment':
    case 'reset':
      return 0;
    case 'getSystemInfo':
      return 'Browser mock';
    case 'getTimestamp':
      return String(Math.floor(Date.now() / 1000));
    case 'getStatus':
      return 'Browser mock';
    default:
      return undefined;
  }
}

function withTimeout(promise, binding) {
  if (!promise || typeof promise.then !== 'function') {
    return Promise.resolve(promise);
  }
  let timer = null;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => {
      reject(
        new BackendError(`${binding} timed out after ${BRIDGE_TIMEOUT_MS}ms`, {
          code: 'backend_timeout',
          binding
        })
      );
    }, BRIDGE_TIMEOUT_MS);
  });
  return Promise.race([promise, timeout]).finally(() => {
    if (timer !== null) clearTimeout(timer);
  });
}

function callBinding(name, ...args) {
  if (hasBinding(name)) {
    try {
      return withTimeout(window[name](...args), name);
    } catch (error) {
      return Promise.reject(
        new BackendError(backendError(error), {
          code: 'backend_invoke_failed',
          binding: name
        })
      );
    }
  }
  if (
    typeof window !== 'undefined' &&
    window.__PREACT_MOCK_BRIDGE__ === false
  ) {
    return Promise.reject(
      new BackendError(`${name} is unavailable outside the native shell`, {
        code: 'backend_unavailable',
        binding: name
      })
    );
  }
  return Promise.resolve(mockValue(name));
}

export function unwrapBridge(raw, binding = 'backend') {
  let response = raw;
  if (typeof raw === 'string') {
    try {
      response = JSON.parse(raw);
    } catch {
      // V always encodes BridgeResponse as JSON; a plain string is data.
      return raw;
    }
  }
  if (response && typeof response === 'object' && 'ok' in response) {
    if (response.ok) return response.data;
    throw new BackendError(response.error || 'Backend request failed', {
      code: response.code || 'backend_request_failed',
      binding
    });
  }
  return response;
}

export function parseCount(raw, binding = 'counter') {
  const value = Number(raw);
  if (!Number.isInteger(value)) {
    throw new BackendError(`Invalid counter value received from ${binding}`, {
      code: 'backend_invalid_payload',
      binding
    });
  }
  return value;
}

export function parseQuizPayload(raw, binding = 'quiz') {
  const value = unwrapBridge(raw, binding);
  if (typeof value !== 'string') return value;
  try {
    const parsed = parseQuizPayloadValue(JSON.parse(value));
    if (parsed !== undefined) return parsed;
  } catch {
    if (binding.startsWith('quiz_delete_')) return value;
  }
  throw new BackendError(`Invalid quiz payload received from ${binding}`, {
    code: 'backend_invalid_payload',
    binding
  });
}

function parseJsonData(raw, binding) {
  const value = unwrapBridge(raw, binding);
  if (typeof value !== 'string') return value;
  try {
    return JSON.parse(value);
  } catch {
    throw new BackendError(`Invalid payload received from ${binding}`, {
      code: 'backend_invalid_payload',
      binding
    });
  }
}

function normalizeNote(note) {
  if (!note || typeof note !== 'object') return undefined;
  const qna = parseStoredQna(note.body);
  if (
    typeof note.id !== 'string' ||
    typeof note.title !== 'string' ||
    typeof note.tag !== 'string' ||
    typeof note.updated !== 'string'
  ) {
    return undefined;
  }
  return {
    id: note.id,
    title: note.title,
    tag: note.tag,
    updated: note.updated,
    question: qna.question,
    answer: qna.answer
  };
}

function nativeNotesAvailable() {
  return hasBinding('get_notes');
}

function callNativeNote(name, ...args) {
  return callBinding(name, ...args).then((raw) => {
    const note = normalizeNote(parseJsonData(raw, name));
    if (!note) {
      throw new BackendError(`Invalid note payload received from ${name}`, {
        code: 'backend_invalid_payload',
        binding: name
      });
    }
    return note;
  });
}

function parseNotesPayload(raw) {
  const notes = parseJsonData(raw, 'get_notes');
  if (!Array.isArray(notes)) return [];
  return notes.map(normalizeNote).filter(Boolean);
}

function callQuizBinding(name, payload) {
  if (!hasBinding(name)) return Promise.resolve(undefined);
  return callBinding(name, JSON.stringify(payload)).then((raw) =>
    parseQuizPayload(raw, name)
  );
}

function callQuizIdBinding(name, id) {
  if (!hasBinding(name)) return Promise.resolve(undefined);
  return callBinding(name, id).then((raw) => parseQuizPayload(raw, name));
}

// Local fallback counter keeps browser development usable when V bindings are
// unavailable. Native calls use the V-owned counter above this fallback.
let localCount = 0;

async function callNativeCount(binding, call) {
  const raw = unwrapBridge(await call(), binding);
  return parseCount(raw, binding);
}

export const backend = {
  isNative: () => NATIVE_BINDINGS.some(hasBinding),
  hasNativeBinding: (name) => hasBinding(name),
  increment: async (delta) => {
    if (hasBinding('increment')) {
      return callNativeCount('increment', () =>
        callBinding('increment', delta)
      );
    }
    localCount += typeof delta === 'number' ? delta : 1;
    return localCount;
  },
  reset: async () => {
    if (hasBinding('reset')) {
      return callNativeCount('reset', () => callBinding('reset'));
    }
    localCount = 0;
    return localCount;
  },
  getSystemInfo: async () => {
    if (hasBinding('get_system_info')) {
      return unwrapBridge(
        await callBinding('get_system_info'),
        'get_system_info'
      );
    }
    if (hasBinding('greet_from_v')) {
      return unwrapBridge(
        await callBinding('greet_from_v', 'system info requested'),
        'greet_from_v'
      );
    }
    return callBinding('getSystemInfo');
  },
  getTimestamp: async () => {
    if (hasBinding('get_time')) {
      return unwrapBridge(await callBinding('get_time'), 'get_time');
    }
    return callBinding('getTimestamp');
  },
  getStatus: async () => {
    if (hasBinding('get_status')) {
      return unwrapBridge(await callBinding('get_status'), 'get_status');
    }
    return callBinding('getStatus');
  },
  getNotes: async () =>
    nativeNotesAvailable()
      ? parseNotesPayload(await callBinding('get_notes'))
      : undefined,
  createNote: (title, tag, body) =>
    nativeNotesAvailable()
      ? callNativeNote('create_note', title, tag, body)
      : undefined,
  updateNote: (id, title, tag, body) =>
    nativeNotesAvailable()
      ? callNativeNote('update_note', id, title, tag, body)
      : undefined,
  deleteNote: (id) =>
    nativeNotesAvailable()
      ? callBinding('delete_note', id).then((raw) =>
          unwrapBridge(raw, 'delete_note')
        )
      : undefined,
  savePdf: async (filename, dataBase64) => {
    if (!hasBinding('save_pdf')) return undefined;
    const result = parseJsonData(
      await callBinding('save_pdf', filename, dataBase64),
      'save_pdf'
    );
    if (!result || typeof result.path !== 'string') {
      throw new BackendError('Invalid PDF save result', {
        code: 'backend_invalid_payload',
        binding: 'save_pdf'
      });
    }
    return result;
  },
  quizList: async () => {
    if (!hasBinding('quiz_list')) return undefined;
    return parseQuizPayload(await callBinding('quiz_list'), 'quiz_list');
  },
  quizCreateCollection: (collection) =>
    callQuizBinding('quiz_create_collection', collection),
  quizUpdateCollection: (collection) =>
    callQuizBinding('quiz_update_collection', collection),
  quizDeleteCollection: (id) => callQuizIdBinding('quiz_delete_collection', id),
  quizCreateQuestion: (question) =>
    callQuizBinding('quiz_create_question', question),
  quizUpdateQuestion: (question) =>
    callQuizBinding('quiz_update_question', question),
  quizDeleteQuestion: (question) =>
    callQuizBinding('quiz_delete_question', question),
  listVolumes: async () => {
    if (!hasBinding('list_volumes')) return undefined;
    return parseJsonData(await callBinding('list_volumes'), 'list_volumes');
  },
  startAssetScan: async (path) => {
    if (!hasBinding('start_asset_scan')) return undefined;
    return parseJsonData(
      await callBinding('start_asset_scan', path),
      'start_asset_scan'
    );
  },
  getAssetScanStatus: async (jobId) => {
    if (!hasBinding('get_asset_scan_status')) return undefined;
    return parseJsonData(
      await callBinding('get_asset_scan_status', jobId),
      'get_asset_scan_status'
    );
  },
  cancelAssetScan: async (jobId) => {
    if (!hasBinding('cancel_asset_scan')) return undefined;
    return unwrapBridge(
      await callBinding('cancel_asset_scan', jobId),
      'cancel_asset_scan'
    );
  },
  getAudioMetadata: async (path) => {
    if (!hasBinding('get_audio_metadata')) return undefined;
    return parseJsonData(
      await callBinding('get_audio_metadata', path),
      'get_audio_metadata'
    );
  },
  analyzeAudio: async (path) => {
    if (!hasBinding('analyze_audio')) {
      const { MOCK_AUDIO_FEATURES } = await import('./mir.mjs');
      return MOCK_AUDIO_FEATURES;
    }
    return parseJsonData(
      await callBinding('analyze_audio', path),
      'analyze_audio'
    );
  },
  mirAnalyze: async (samples, sampleRate) => {
    const { analyzeSamples, validateMirInput } = await import('./mir.mjs');
    const invalid = validateMirInput(samples, sampleRate);
    if (invalid) {
      throw new BackendError(invalid, {
        code: 'backend_invalid_payload',
        binding: 'mir_analyze'
      });
    }
    if (!hasBinding('mir_analyze')) return analyzeSamples(samples, sampleRate);
    const raw = await callBinding(
      'mir_analyze',
      JSON.stringify({ samples, sample_rate: sampleRate })
    );
    const value = parseJsonData(raw, 'mir_analyze');
    const numeric = ['rms', 'peak', 'zcr', 'duration_seconds'].every(
      (key) => typeof value?.[key] === 'number' && Number.isFinite(value[key])
    );
    if (
      !value ||
      typeof value !== 'object' ||
      !numeric ||
      !Number.isInteger(value.sample_count) ||
      !Number.isInteger(value.sample_rate)
    ) {
      throw new BackendError('Invalid MIR features received from mir_analyze', {
        code: 'backend_invalid_payload',
        binding: 'mir_analyze'
      });
    }
    return value;
  },
  minimizeWindow: () =>
    callBinding('minimize_window').then((raw) =>
      unwrapBridge(raw, 'minimize_window')
    ),
  maximizeWindow: () =>
    callBinding('maximize_window').then((raw) =>
      unwrapBridge(raw, 'maximize_window')
    ),
  restoreWindow: () =>
    callBinding('restore_window').then((raw) =>
      unwrapBridge(raw, 'restore_window')
    ),
  closeWindow: () =>
    callBinding('close_window').then((raw) => unwrapBridge(raw, 'close_window'))
};

export function backendError(error) {
  if (error instanceof BackendError) return error.message;
  return error instanceof Error ? error.message : String(error);
}
