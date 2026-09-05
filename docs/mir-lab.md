# MIR Lab

Offline Music Information Retrieval bench for the Blender + audio workflow.
Time-domain first, FFT later — deterministic and native-accelerated.

## What it does

- `frontend-preact/src/plugins/mir-lab.jsx` — file or demo-tone analysis UI.
- `frontend-preact/src/mir.mjs` — shared JS math used in the browser
  and as the native mock fallback. Pure functions only, so a future shared
  C/JS library can replace both implementations.
- `mir_core.v` — native `rms`, `peak`, `zcr`, bounded `analyze()`.
- `mir_analyze` binding — `window.mir_analyze(payload)` where payload is JSON
  `{ "samples": [...], "sample_rate": 48000 }`; the frontend windows long
  files to 262,144 samples before sending.

## Reading a result

- **RMS**: average energy / loudness. `<0.02` silence, `0.12-0.3` healthy,
  `>0.3` hot.
- **Peak**: loudest instant; catches clipping RMS hides.
- **ZCR**: brightness cue. Low = bass/dark, high = hats/sibilance/noise.

`Log to Production Log` stores the result as a `MIR`-tagged note so
mix decisions stay next to Blender scene logs.

## Limits

- One bounded window per call; long stems are stride-downsampled.
- No FFT yet: tempo/key/chroma/centroid stay in the placeholder
  `analyze_audio` contract and the Trainer theory decks until the spectral
  step lands.
