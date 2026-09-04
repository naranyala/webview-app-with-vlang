import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { paperStats, resolvePaperCitations } from './paper-tools.mjs';

describe('paper tools', () => {
  it('numbers citations by first appearance and reports missing keys', () => {
    const result = resolvePaperCitations({
      title: 'Paper',
      abstract: 'Intro [@second].',
      sections: [
        {
          heading: 'Methods',
          blocks: [
            { type: 'paragraph', text: 'Prior work [@first] and [@missing].' }
          ]
        }
      ],
      references: [
        { id: 'first', label: '[1]', text: 'First source.' },
        { id: 'second', label: '[2]', text: 'Second source.' }
      ],
      assets: []
    });
    assert.equal(result.paper.abstract, 'Intro [1].');
    assert.equal(
      result.paper.sections[0].blocks[0].text,
      'Prior work [2] and [3].'
    );
    assert.deepEqual(
      result.references.map((reference) => reference.id),
      ['second', 'first', 'missing-missing']
    );
    assert.deepEqual(result.missing, ['missing']);
  });

  it('calculates reading statistics across typed blocks', () => {
    const stats = paperStats({
      title: 'A title',
      subtitle: '',
      abstract: 'An abstract',
      sections: [
        {
          heading: 'One',
          blocks: [{ type: 'list', items: ['first', 'second'] }]
        }
      ],
      references: [{ id: 'ref' }],
      assets: [{ id: 'asset' }]
    });
    assert.equal(stats.words, 7);
    assert.equal(stats.sections, 1);
    assert.equal(stats.references, 1);
    assert.equal(stats.figures, 1);
  });
});
