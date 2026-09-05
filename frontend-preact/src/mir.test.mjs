import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { backend } from './backend.js';
import {
  analyzeSamples,
  describeFeatures,
  formatDuration,
  formatTempo,
  MOCK_AUDIO_FEATURES,
  mixSimilarity,
  parseAudioFeatures,
  validateMirInput,
  windowSamples
} from './mir.mjs';

describe('MIR feature contracts', () => {
  it('validates native feature payloads', () => {
    assert.deepEqual(
      parseAudioFeatures(MOCK_AUDIO_FEATURES),
      MOCK_AUDIO_FEATURES
    );
    assert.equal(parseAudioFeatures({ tempo: 0 }), null);
    assert.equal(parseAudioFeatures(null), null);
  });

  it('formats tempo and duration for the workbench', () => {
    assert.equal(formatTempo(MOCK_AUDIO_FEATURES), '124 BPM · A minor');
    assert.equal(formatDuration(142), '2:22');
  });

  it('scores compatible mixes higher', () => {
    const same = mixSimilarity(MOCK_AUDIO_FEATURES, MOCK_AUDIO_FEATURES);
    const other = mixSimilarity(MOCK_AUDIO_FEATURES, {
      ...MOCK_AUDIO_FEATURES,
      tempo: 200,
      key: 'F# major'
    });
    assert.equal(same, 1);
    assert.ok(other < same);
  });
});

describe('MIR time-domain core (parity with mir_core.v)', () => {
  it('maps silence, dc, and alternating polarity', () => {
    assert.equal(analyzeSamples([0, 0, 0, 0], 48000).rms, 0);
    assert.ok(
      Math.abs(analyzeSamples([0.5, 0.5, 0.5, 0.5], 44100).rms - 0.5) < 1e-6
    );
    assert.ok(Math.abs(analyzeSamples([1, -1, 1, -1], 48000).zcr - 1) < 1e-6);
  });

  it('rejects empty windows, bad rates, and oversized buffers', () => {
    assert.notEqual(validateMirInput([], 48000), null);
    assert.notEqual(validateMirInput([0.1], 0), null);
    assert.notEqual(validateMirInput(new Array(262145).fill(0), 48000), null);
    assert.equal(validateMirInput([0.1], 48000), null);
  });

  it('windows long buffers to the native limit', () => {
    assert.ok(windowSamples(new Array(300000).fill(0)).length <= 262144);
    assert.deepEqual(windowSamples([0.1, 0.2]), [0.1, 0.2]);
  });

  it('describes features in mix words', () => {
    assert.ok(
      describeFeatures({ rms: 0.4, peak: 0.9, zcr: 0.5 }).includes('hot')
    );
  });

  it('falls back to the JS mirror without native bindings', async () => {
    const previous = globalThis.window;
    globalThis.window = {};
    try {
      const features = await backend.mirAnalyze([0.5, -0.5, 0.5], 48000);
      assert.ok(features.rms > 0);
      assert.equal(features.sample_rate, 48000);
      await assert.rejects(() => backend.mirAnalyze([], 48000));
    } finally {
      if (previous === undefined) delete globalThis.window;
      else globalThis.window = previous;
    }
  });
});
