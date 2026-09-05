import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  BLENDER_ENGINES,
  BLENDER_STAGES,
  createScene,
  loadScenes,
  persistScenes,
  STORAGE_KEY,
  sceneToNoteBody,
  validateScene
} from './blender.mjs';

class MemoryStorage {
  values = new Map();
  getItem(key) {
    return this.values.has(key) ? this.values.get(key) : null;
  }
  setItem(key, value) {
    this.values.set(key, String(value));
  }
}

describe('blender scene contracts', () => {
  it('creates scenes with safe defaults', () => {
    const scene = createScene('  Hero shot  ', '/work/hero.blend', 'Cycles');
    assert.equal(scene.name, 'Hero shot');
    assert.equal(scene.engine, 'Cycles');
    assert.equal(scene.stage, 'modeling');
    assert.ok(scene.id.startsWith('scene-'));
    assert.equal(createScene('X', '', 'Nope').engine, 'Eevee');
  });

  it('validates scene shapes', () => {
    assert.equal(validateScene(createScene('Shot', '', 'Eevee')), null);
    assert.equal(validateScene({ name: '' }), 'scene name is required');
    assert.equal(
      validateScene({ ...createScene('S'), engine: 'Nope' }),
      'render engine is invalid'
    );
    assert.equal(
      validateScene({ ...createScene('S'), stage: 'Nope' }),
      'stage is invalid'
    );
    assert.ok(BLENDER_ENGINES.includes('Cycles'));
    assert.ok(BLENDER_STAGES.includes('composite'));
  });

  it('round-trips scenes through the storage adapter', () => {
    globalThis.window = { localStorage: new MemoryStorage() };
    try {
      assert.deepEqual(loadScenes(), []);
      const scenes = [createScene('Hero', '/work/hero.blend', 'Cycles')];
      persistScenes(scenes);
      assert.deepEqual(loadScenes(), scenes);
      globalThis.window.localStorage.setItem(STORAGE_KEY, '{bad json');
      assert.deepEqual(loadScenes(), []);
      globalThis.window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify([{ id: 'x' }])
      );
      assert.deepEqual(loadScenes(), []);
    } finally {
      delete globalThis.window;
    }
  });

  it('exports a scene body for production-log notes', () => {
    const body = sceneToNoteBody(createScene('Hero', '', 'Eevee'));
    assert.ok(body.includes('Blender scene: Hero'));
    assert.ok(body.includes('Engine: Eevee'));
  });
});
