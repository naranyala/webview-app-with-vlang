import { useState } from 'preact/hooks';
import { backend, backendError } from '../backend.js';
import { analyzeSamples, describeFeatures, windowSamples } from '../mir.mjs';
import { styles, stylex } from '../stylex.js';

export function MirLab() {
  const [features, setFeatures] = useState(null);
  const [detail, setDetail] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [source, setSource] = useState('demo 440Hz tone');

  async function runAnalysis(samples, sampleRate, label) {
    setBusy(true);
    setError('');
    try {
      const windowed = windowSamples(samples);
      const result = backend.isNative()
        ? await backend.mirAnalyze(windowed, sampleRate)
        : analyzeSamples(windowed, sampleRate);
      setFeatures(result);
      setDetail(describeFeatures(result));
      setSource(label);
    } catch (failure) {
      setError(backendError(failure));
    } finally {
      setBusy(false);
    }
  }

  function analyzeDemo() {
    const sampleRate = 48000;
    const samples = Array.from({ length: 48000 }, (_, i) =>
      Math.sin((2 * Math.PI * 440 * i) / sampleRate)
    );
    return runAnalysis(samples, sampleRate, 'demo 440Hz tone');
  }

  async function analyzeFile(event) {
    const file = event.currentTarget.files?.[0];
    if (!file) return;
    try {
      const AudioCtx = globalThis.AudioContext || globalThis.webkitAudioContext;
      if (!AudioCtx) {
        setError('Web Audio is unavailable in this shell.');
        return;
      }
      const ctx = new AudioCtx();
      const bytes = await file.arrayBuffer();
      const audio = await ctx.decodeAudioData(bytes);
      const channel = audio.getChannelData(0);
      await ctx.close?.();
      return runAnalysis([...channel], audio.sampleRate, file.name);
    } catch (failure) {
      setError(backendError(failure));
    }
  }

  async function logToNotes() {
    if (!features) return;
    try {
      await backend.createNote(
        `MIR: ${source}`,
        'MIR',
        `Source: ${source}\nRMS ${features.rms.toFixed(4)} / peak ${features.peak.toFixed(4)} / ZCR ${features.zcr.toFixed(4)}\n${detail}\nWindow: ${features.sample_count} samples @ ${features.sample_rate}Hz`
      );
    } catch (failure) {
      setError(backendError(failure));
    }
  }

  return (
    <section className={stylex.props(styles.toolPage).className}>
      <div className={stylex.props(styles.toolHeading).className}>
        <div>
          <p className={stylex.props(styles.eyebrow).className}>
            Music Information Retrieval
          </p>
          <h1 className={stylex.props(styles.headingTitle).className}>
            MIR Lab
          </h1>
          <p className={stylex.props(styles.headingText).className}>
            Offline time-domain analysis. Native V when hosted, JS mirror in the
            browser.
          </p>
        </div>
        <span className={stylex.props(styles.mockBadge).className}>
          {backend.isNative() ? 'Native' : 'Browser mirror'}
        </span>
      </div>
      <div className={stylex.props(styles.toolPanel).className}>
        <div className={stylex.props(styles.notesListHeading).className}>
          <button
            type="button"
            className={stylex.props(styles.newNoteButton).className}
            onClick={analyzeDemo}
            disabled={busy}
          >
            Analyze demo tone
          </button>
          <label className={stylex.props(styles.textButton).className}>
            Open audio file
            <input
              type="file"
              accept="audio/*"
              hidden
              onChange={analyzeFile}
              disabled={busy}
            />
          </label>
          <button
            type="button"
            className={stylex.props(styles.textButton).className}
            onClick={logToNotes}
            disabled={!features || busy}
          >
            Log to Production Log
          </button>
        </div>
        {error && (
          <p className={stylex.props(styles.panelNote).className} role="alert">
            {error}
          </p>
        )}
        {features ? (
          <ul className={stylex.props(styles.todoList).className}>
            <li>Source: {source}</li>
            <li>RMS {features.rms.toFixed(4)}</li>
            <li>Peak {features.peak.toFixed(4)}</li>
            <li>ZCR {features.zcr.toFixed(4)}</li>
            <li>
              {features.sample_count} samples @ {features.sample_rate}Hz (
              {features.duration_seconds.toFixed(2)}s)
            </li>
            <li>{detail}</li>
          </ul>
        ) : (
          <p className={stylex.props(styles.panelNote).className}>
            No analysis yet. Files stay on device; only a bounded window is sent
            to the native analyzer.
          </p>
        )}
        <p className={stylex.props(styles.panelNote).className}>
          FFT chroma/tempo arrive after the spectral step; ZCR + level already
          triage brightness and headroom.
        </p>
      </div>
    </section>
  );
}
