import { useState } from 'preact/hooks';
import { backend, backendError } from '../backend.js';
import {
  BLENDER_ENGINES,
  BLENDER_STAGES,
  createScene,
  loadScenes,
  persistScenes,
  sceneToNoteBody,
  validateScene
} from '../blender.mjs';
import { styles, stylex } from '../stylex.js';

export function BlenderCompanion() {
  const [scenes, setScenes] = useState(loadScenes);
  const [name, setName] = useState('');
  const [blendPath, setBlendPath] = useState('');
  const [engine, setEngine] = useState('Eevee');
  const [error, setError] = useState('');

  function addScene(event) {
    event.preventDefault();
    const scene = createScene(name || 'Untitled scene', blendPath, engine);
    const invalid = validateScene(scene);
    if (invalid) {
      setError(invalid);
      return;
    }
    const next = [...scenes, scene];
    setScenes(next);
    persistScenes(next);
    setName('');
    setBlendPath('');
    setError('');
  }

  function updateStage(id, stage) {
    const next = scenes.map((scene) =>
      scene.id === id
        ? { ...scene, stage, updated: new Date().toISOString().slice(0, 10) }
        : scene
    );
    setScenes(next);
    persistScenes(next);
  }

  async function logScene(scene) {
    try {
      await backend.createNote(
        `Blender: ${scene.name}`,
        'Blender',
        sceneToNoteBody(scene)
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
            Blender studio
          </p>
          <h1 className={stylex.props(styles.headingTitle).className}>
            Blender Companion
          </h1>
          <p className={stylex.props(styles.headingText).className}>
            Track scenes, engines, and stages next to your mix notes.
          </p>
        </div>
        <span className={stylex.props(styles.mockBadge).className}>
          {scenes.length} scenes
        </span>
      </div>
      <div className={stylex.props(styles.toolPanel).className}>
        <form
          className={stylex.props(styles.notesListHeading).className}
          onSubmit={addScene}
        >
          <input
            className={stylex.props(styles.searchInput).className}
            value={name}
            onInput={(event) => setName(event.currentTarget.value)}
            placeholder="Scene name…"
            aria-label="Scene name"
          />
          <input
            className={stylex.props(styles.searchInput).className}
            value={blendPath}
            onInput={(event) => setBlendPath(event.currentTarget.value)}
            placeholder="/path/scene.blend"
            aria-label="Blend path"
          />
          <select
            className={stylex.props(styles.select).className}
            value={engine}
            onChange={(event) => setEngine(event.currentTarget.value)}
            aria-label="Render engine"
          >
            {BLENDER_ENGINES.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className={stylex.props(styles.newNoteButton).className}
          >
            + Scene
          </button>
        </form>
        {error && (
          <p className={stylex.props(styles.panelNote).className} role="alert">
            {error}
          </p>
        )}
        <ul className={stylex.props(styles.todoList).className}>
          {scenes.map((scene) => (
            <li key={scene.id}>
              <span>
                <strong>{scene.name}</strong> · {scene.engine} · {scene.stage}
              </span>{' '}
              <select
                className={stylex.props(styles.select).className}
                value={scene.stage}
                onChange={(event) =>
                  updateStage(scene.id, event.currentTarget.value)
                }
                aria-label={`Stage for ${scene.name}`}
              >
                {BLENDER_STAGES.map((stage) => (
                  <option key={stage} value={stage}>
                    {stage}
                  </option>
                ))}
              </select>{' '}
              <button
                type="button"
                className={stylex.props(styles.textButton).className}
                onClick={() => logScene(scene)}
              >
                Log
              </button>
            </li>
          ))}
        </ul>
        {scenes.length === 0 && (
          <p className={stylex.props(styles.panelNote).className}>
            No scenes yet. Add the .blend you are lighting or rendering, then
            log it to the Production Log when a look locks.
          </p>
        )}
      </div>
    </section>
  );
}
