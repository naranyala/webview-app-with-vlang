import { describe, expect, it } from 'vitest';
import { chainNoteFilename, createChainNotePdf } from './chain-notes';

describe('Chain Notes PDF export', () => {
	it('creates a safe filename from a note title', () => {
		expect(chainNoteFilename('Toolkit Direction: v1!')).toBe('toolkit-direction-v1.pdf');
		expect(chainNoteFilename('')).toBe('chain-note.pdf');
	});

	it('generates a valid PDF document', () => {
		const pdf = createChainNotePdf('Toolkit Direction', 'A short note for the toolkit.', 'Planning');
		const header = new TextDecoder().decode(new Uint8Array(pdf.output('arraybuffer')).slice(0, 5));

		expect(header).toBe('%PDF-');
		expect(pdf.getNumberOfPages()).toBe(1);
	});

	it('creates additional pages for long notes', () => {
		const longNote = Array.from({ length: 100 }, (_, index) => `Line ${index + 1}: toolkit planning detail.`).join('\n');
		const pdf = createChainNotePdf('Long note', longNote, 'Research');

		expect(pdf.getNumberOfPages()).toBeGreaterThan(1);
	});
});
