import { jsPDF } from 'jspdf';

export function chainNoteFilename(title: string): string {
	const safeTitle = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
	return `${safeTitle || 'chain-note'}.pdf`;
}

export function createChainNotePdf(title: string, body: string, tag: string): jsPDF {
	const pdf = new jsPDF({ unit: 'mm', format: 'a4' });
	const lines = pdf.splitTextToSize(body.trim() || ' ', 170) as string[];

	pdf.setTextColor('#6d4b12');
	pdf.setFontSize(9);
	pdf.text('CHAIN NOTES', 20, 20);
	pdf.setTextColor('#171729');
	pdf.setFontSize(22);
	pdf.text(title.trim() || 'Untitled note', 20, 33);
	pdf.setTextColor('#686573');
	pdf.setFontSize(10);
	pdf.text(tag || 'Note', 20, 41);

	pdf.setTextColor('#292735');
	pdf.setFontSize(11);
	let y = 54;
	for (const line of lines) {
		if (y > 275) {
			pdf.addPage();
			y = 20;
		}
		pdf.text(line, 20, y);
		y += 6;
	}
	return pdf;
}

export function exportChainNotePdf(title: string, body: string, tag: string): string {
	const filename = chainNoteFilename(title);
	createChainNotePdf(title, body, tag).save(filename);
	return filename;
}
