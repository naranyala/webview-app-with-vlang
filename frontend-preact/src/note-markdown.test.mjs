import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { blocksToHtml, parseInline, parseMarkdown } from './note-markdown.mjs';

describe('note Markdown subset', () => {
  it('parses headings, lists, quotes, and fenced code', () => {
    const blocks = parseMarkdown(
      '# Title\n\n- one\n- two\n\n> quoted\n\n```v\nprintln(1)\n```'
    );
    assert.deepEqual(
      blocks.map((block) => block.type),
      ['heading', 'list', 'quote', 'code']
    );
    assert.equal(blocks[3].text, 'println(1)');
  });

  it('escapes generated HTML and preserves inline styles', () => {
    assert.deepEqual(parseInline('**bold** and `code`'), [
      { t: 'bold', b: true },
      { t: ' and ' },
      { t: 'code', c: true }
    ]);
    assert.equal(
      blocksToHtml(parseMarkdown('<script>alert(1)</script>')),
      '<p>&lt;script&gt;alert(1)&lt;/script&gt;</p>'
    );
  });
});
