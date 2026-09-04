import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { generateNotePdfLibBytes } from './pdf-lib-export.mjs';

describe('note PDF generation', () => {
  it('generates a valid PDF with the dependency-free text path', async () => {
    const bytes = await generateNotePdfLibBytes({
      title: 'Research note',
      question: 'What is local-first software?',
      answer: 'A design that keeps the local copy useful and owned.'
    });
    assert.equal(new TextDecoder().decode(bytes.slice(0, 5)), '%PDF-');
    assert.ok(bytes.length > 500);
  });
});
