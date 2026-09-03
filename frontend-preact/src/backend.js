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

const BRIDGE_TIMEOUT_MS = 8000;

const NATIVE_BINDINGS = [
  'greet_from_v',
  'get_time',
  'get_system_info',
  'get_status',
  'increment',
  'reset',
  'minimize_window',
  'maximize_window',
  'restore_window',
  'close_window'
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
      code: 'backend_request_failed',
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

// Local fallback counter keeps browser development usable when V bindings are
// unavailable. Native calls use the V-owned counter above this fallback.
let localCount = 0;

async function callNativeCount(binding, call) {
  const raw = unwrapBridge(await call(), binding);
  return parseCount(raw, binding);
}

export const backend = {
  isNative: () => NATIVE_BINDINGS.some(hasBinding),
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
