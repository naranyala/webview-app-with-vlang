import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  normalizeAcademicPaper,
  starterPapers
} from './academic-paper-model.mjs';

describe('normalizeAcademicPaper', () => {
  it('keeps the semantic paper structure and removes invalid blocks', () => {
    const paper = normalizeAcademicPaper({
      ...starterPapers[0],
      sections: [
        {
          id: 'methods',
          heading: 'Methods',
          blocks: [
            { type: 'paragraph', text: 'A valid paragraph.' },
            { type: 'code', language: 'vlang', code: 'println(1)' },
            { type: 'unsupported', text: 'Remove me' }
          ]
        }
      ]
    });

    assert.equal(paper.sections.length, 1);
    assert.deepEqual(
      paper.sections[0].blocks.map((block) => block.type),
      ['paragraph', 'code']
    );
    assert.equal(paper.sections[0].blocks[1].language, 'vlang');
  });

  it('rejects values without a stable id and title', () => {
    assert.equal(normalizeAcademicPaper({ title: 'Missing id' }), null);
    assert.equal(normalizeAcademicPaper({ id: 'missing-title' }), null);
  });
});
