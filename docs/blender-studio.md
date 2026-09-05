# Blender Studio

Scene companion for model → shade → light → render work, kept next to audio.

## What it does

- `frontend-preact/src/plugins/blender-companion.jsx` — scene list with
  engine (`Eevee`/`Cycles`/`Workbench`) and stage
  (`modeling` → `composite`).
- `frontend-preact/src/blender.mjs` — validation + localStorage
  persistence + `sceneToNoteBody()` export. Framework-free, so a future
  shared JS library or native scene store can adopt these shapes unchanged.
- `Log` on a scene creates a `Blender`-tagged Production Log note, so render
  notes and mix notes share one searchable timeline.

## Workflow

1. Add the `.blend` under work with its engine.
2. Advance its stage as the shot moves; keep notes on blockers.
3. Log locked looks to the Production Log; link the matching MIR analysis
   there when sound drives the visual (e.g. onset → cut, RMS → lighting
   energy).

`Asset Scanner` stays the place to audit where packs, stems,
and `.blend` files live before a session.
