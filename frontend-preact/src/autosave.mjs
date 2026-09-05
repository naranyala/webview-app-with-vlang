// Keep writes ordered even when navigation flushes a debounce early.
const registeredFlushers = new Set();

export function registerAutosave(flush) {
  if (typeof flush !== 'function') {
    throw new TypeError('Autosave flusher must be a function');
  }
  registeredFlushers.add(flush);
  return () => registeredFlushers.delete(flush);
}

export async function flushRegisteredAutosaves() {
  let saved = true;
  for (const flush of [...registeredFlushers]) {
    try {
      saved = (await flush()) && saved;
    } catch {
      saved = false;
    }
  }
  return saved;
}

export function createAutosave(
  write,
  { delay = 350, onError = () => {} } = {}
) {
  const pending = new Map();
  let timer;
  let tail = Promise.resolve(true);

  function flush() {
    clearTimeout(timer);
    const batch = [...pending.values()];
    pending.clear();
    if (!batch.length) return tail;
    tail = tail.then(async () => {
      let saved = true;
      for (const value of batch) {
        try {
          await write(value);
        } catch (error) {
          saved = false;
          onError(error);
        }
      }
      return saved;
    });
    return tail;
  }

  return {
    schedule(key, value) {
      pending.set(key, value);
      clearTimeout(timer);
      timer = setTimeout(flush, delay);
    },
    flush
  };
}
