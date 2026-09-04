import { useState } from 'preact/hooks';
import { backend, backendError } from './backend.js';
import { styles, stylex } from './stylex.js';

function isValidCount(value) {
  return typeof value === 'number' && Number.isInteger(value);
}

export function BackendStatus({ compact = false }) {
  const [count, setCount] = useState(null);
  const [systemInfo, setSystemInfo] = useState('');
  const [timestamp, setTimestamp] = useState('');
  const [status, setStatus] = useState('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');

  async function run(fn) {
    if (pending) return;
    setPending(true);
    setError('');
    try {
      await fn();
    } catch (err) {
      setError(backendError(err));
    } finally {
      setPending(false);
    }
  }

  async function runCount(fn) {
    await run(async () => {
      const next = await fn();
      if (!isValidCount(next)) {
        throw new Error('Invalid counter value received from backend');
      }
      setCount(next);
    });
  }

  async function refreshAll() {
    await run(async () => {
      const [statusResult, systemResult, timestampResult] =
        await Promise.allSettled([
          backend.getStatus(),
          backend.getSystemInfo(),
          backend.getTimestamp()
        ]);
      const failures = [];

      if (statusResult.status === 'fulfilled') {
        setStatus(statusResult.value);
      } else {
        failures.push(`status: ${backendError(statusResult.reason)}`);
      }
      if (systemResult.status === 'fulfilled') {
        setSystemInfo(systemResult.value);
      } else {
        failures.push(`system: ${backendError(systemResult.reason)}`);
      }
      if (timestampResult.status === 'fulfilled') {
        setTimestamp(timestampResult.value);
      } else {
        failures.push(`timestamp: ${backendError(timestampResult.reason)}`);
      }

      if (failures.length > 0) {
        throw new Error(failures.join(' · '));
      }
    });
  }

  return (
    <div {...stylex.props(styles.statusCard)} aria-live="polite">
      <span {...stylex.props(styles.statusLabel)}>
        Backend{backend.isNative() ? '' : ' (mock)'}
      </span>
      <span {...stylex.props(styles.statusValue)}>
        {[
          systemInfo && `${systemInfo}`,
          status && status,
          timestamp && `t:${timestamp}`,
          count !== null && `#${count}`
        ]
          .filter(Boolean)
          .join(' · ') ||
          (compact ? 'tap Refresh to connect' : 'not connected yet')}
      </span>
      <span {...stylex.props(styles.statusActions)}>
        <button
          type="button"
          {...stylex.props(styles.statusAction)}
          disabled={pending}
          onClick={() => runCount(() => backend.increment(1))}
        >
          +1
        </button>
        <button
          type="button"
          {...stylex.props(styles.statusAction)}
          disabled={pending}
          onClick={() => runCount(() => backend.reset())}
        >
          Reset
        </button>
        <button
          type="button"
          {...stylex.props(styles.statusAction)}
          disabled={pending}
          onClick={refreshAll}
        >
          Refresh
        </button>
      </span>
      {error && (
        <span {...stylex.props(styles.statusError)} role="alert">
          {error}
        </span>
      )}
    </div>
  );
}
