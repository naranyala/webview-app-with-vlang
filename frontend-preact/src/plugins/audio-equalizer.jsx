import { useEffect, useState } from 'preact/hooks';
import { backend } from '../backend.js';
import {
  formatDuration,
  formatTempo,
  MOCK_AUDIO_FEATURES,
  parseAudioFeatures
} from '../mir.mjs';
import { styles, stylex } from '../stylex.js';

const equalizerPresets = [
  { name: 'Flat', values: [0, 0, 0, 0, 0, 0, 0] },
  { name: 'Focus', values: [-2, 1, 3, 4, 2, -1, -2] },
  { name: 'Warm', values: [4, 3, 1, -1, -2, -2, -1] },
  { name: 'Vocal', values: [-3, -1, 2, 4, 3, 1, -2] }
];

const bandLabels = ['60', '150', '400', '1k', '2.4k', '6k', '14k'];
const visualizerLevels = [
  42, 66, 52, 78, 58, 86, 69, 48, 72, 54, 80, 62, 44, 74, 57, 68
];

export function AudioEqualizer() {
  const [activePreset, setActivePreset] = useState('Focus');
  const [equalizerEnabled, setEqualizerEnabled] = useState(true);
  const [bandValues, setBandValues] = useState([-2, 1, 3, 4, 2, -1, -2]);
  const [masterVolume, setMasterVolume] = useState(68);
  const [features, setFeatures] = useState(MOCK_AUDIO_FEATURES);
  const [analysisError, setAnalysisError] = useState('');

  useEffect(() => {
    let active = true;
    backend
      .analyzeAudio('night-drive.wav')
      .then((result) => {
        const parsed = parseAudioFeatures(result);
        if (active && parsed) setFeatures(parsed);
      })
      .catch((error) => {
        if (active && error?.message) setAnalysisError(error.message);
      });
    return () => {
      active = false;
    };
  }, []);

  function choosePreset(preset) {
    setActivePreset(preset.name);
    setBandValues([...preset.values]);
  }

  function updateBand(index, event) {
    const next = [...bandValues];
    next[index] = Number(event.currentTarget.value);
    setBandValues(next);
    setActivePreset('Custom');
  }

  return (
    <section className={stylex.props(styles.toolPage).className}>
      <div className={stylex.props(styles.toolHeading).className}>
        <div>
          <p className={stylex.props(styles.eyebrow).className}>MIR bench</p>
          <h1 className={stylex.props(styles.headingTitle).className}>
            MIR Workbench
          </h1>
          <p className={stylex.props(styles.headingText).className}>
            {formatTempo(features)} · {formatDuration(features.durationSec)} ·
            centroid {Math.round(features.spectralCentroidHz)} Hz
            {analysisError
              ? ` · native analysis pending (${analysisError})`
              : ''}
          </p>
        </div>
        <span className={stylex.props(styles.mockBadge).className}>Local</span>
      </div>

      <div className={stylex.props(styles.toolPanel).className}>
        <div className={stylex.props(styles.trackMeta).className}>
          <div className={stylex.props(styles.albumArt).className}>AUX</div>
          <div>
            <span className={stylex.props(styles.panelLabel).className}>
              Source
            </span>
            <h2 className={stylex.props(styles.trackTitle).className}>
              Night drive
            </h2>
            <span className={stylex.props(styles.mutedSmall).className}>
              Local mock
            </span>
          </div>
          <button
            type="button"
            className={
              stylex.props(
                styles.toggle,
                equalizerEnabled && styles.toggleEnabled
              ).className
            }
            onClick={() => setEqualizerEnabled((value) => !value)}
          >
            {equalizerEnabled ? 'Enabled' : 'Bypassed'}
          </button>
        </div>
        <div
          className={stylex.props(styles.visualizer).className}
          role="img"
          aria-label="Mock audio visualizer"
        >
          {visualizerLevels.map((level, index) => (
            <span
              key={index}
              className={
                stylex.props(
                  styles.visualizerBar,
                  index % 4 === 0 && styles.visualizerAccent
                ).className
              }
              style={`height: ${level}%`}
            />
          ))}
        </div>
        <div className={stylex.props(styles.transportRow).className}>
          <span>01:24</span>
          <div className={stylex.props(styles.transportTrack).className}>
            <span className={stylex.props(styles.transportFill).className} />
          </div>
          <span>03:48</span>
        </div>
      </div>

      <div
        className={
          stylex.props(styles.gridTwo, styles.responsiveGrid).className
        }
      >
        <div className={stylex.props(styles.toolPanel).className}>
          <div className={stylex.props(styles.panelHeading).className}>
            <div>
              <span className={stylex.props(styles.panelLabel).className}>
                Bands
              </span>
              <h2 className={stylex.props(styles.panelHeadingTitle).className}>
                {activePreset}
              </h2>
            </div>
            <span className={stylex.props(styles.panelStatus).className}>
              Local
            </span>
          </div>
          <div className={stylex.props(styles.bands).className}>
            {bandValues.map((value, index) => (
              <label
                className={stylex.props(styles.band).className}
                key={bandLabels[index]}
              >
                <input
                  type="range"
                  min="-12"
                  max="12"
                  value={value}
                  onInput={(event) => updateBand(index, event)}
                  aria-label={`${bandLabels[index]} Hz gain`}
                  className={stylex.props(styles.bandInput).className}
                />
                <span className={stylex.props(styles.bandValue).className}>
                  {value > 0 ? '+' : ''}
                  {value}
                </span>
                <span className={stylex.props(styles.bandLabel).className}>
                  {bandLabels[index]}
                </span>
              </label>
            ))}
          </div>
          <div className={stylex.props(styles.footerRow).className}>
            <span>Master</span>
            <input
              type="range"
              min="0"
              max="100"
              value={masterVolume}
              onInput={(event) =>
                setMasterVolume(Number(event.currentTarget.value))
              }
              aria-label="Master volume"
            />
            <strong>{masterVolume}%</strong>
          </div>
        </div>

        <div className={stylex.props(styles.toolPanel).className}>
          <span className={stylex.props(styles.panelLabel).className}>
            Presets
          </span>
          <div className={stylex.props(styles.presetList).className}>
            {equalizerPresets.map((preset) => (
              <button
                type="button"
                key={preset.name}
                className={
                  stylex.props(
                    styles.presetButton,
                    activePreset === preset.name && styles.presetActive
                  ).className
                }
                onClick={() => choosePreset(preset)}
              >
                {preset.name}
              </button>
            ))}
          </div>
          <p className={stylex.props(styles.panelNote).className}>
            Presets update controls only until the backend connects.
          </p>
        </div>
      </div>
    </section>
  );
}
