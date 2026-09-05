import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  advanceAssetScanJob,
  classifyAsset,
  createAssetScanJob,
  parseAssetRecords,
  summarizeAssets
} from './assets.mjs';

describe('studio asset contracts', () => {
  it('classifies blender, audio, and render files', () => {
    assert.equal(classifyAsset('shot.blend'), 'blender');
    assert.equal(classifyAsset('kick.wav'), 'audio');
    assert.equal(classifyAsset('frame.exr'), 'render');
    assert.equal(classifyAsset('notes.txt'), 'other');
  });

  it('parses and summarizes scan batches', () => {
    const records = parseAssetRecords([
      { path: '/projects/shot.blend', size: 10 },
      { path: '/samples/kick.wav', size: 5 },
      { path: '' }
    ]);
    assert.equal(records.length, 2);
    const summary = summarizeAssets(records);
    assert.equal(summary.blender, 1);
    assert.equal(summary.audio, 1);
    assert.equal(summary.bytes, 15);
  });

  it('advances a scan job without losing large entries', () => {
    let job = createAssetScanJob('samples');
    job = advanceAssetScanJob(job, [{ path: 'a.wav', size: 3 }]);
    job = advanceAssetScanJob(job, [{ path: 'b.wav', size: 9 }]);
    assert.equal(job.scannedFiles, 2);
    assert.equal(job.topEntries[0].path, 'b.wav');
  });
});
