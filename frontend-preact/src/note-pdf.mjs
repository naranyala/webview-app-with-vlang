import html2pdf from 'html2pdf.js';
import { jsPDF } from 'jspdf';

const PDF_OPTIONS = {
  margin: [40, 48, 40, 48],
  image: { type: 'jpeg', quality: 0.98 },
  html2canvas: {
    backgroundColor: '#ffffff',
    scale: 2,
    useCORS: false
  },
  jsPDF: { unit: 'pt', format: 'a4', orientation: 'portrait' },
  pagebreak: { mode: ['css', 'legacy'] }
};

const NOTE_DOCUMENT_CSS = `
  .chain-note-document,
  .chain-note-document * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
    border: 0;
    font: inherit;
    vertical-align: baseline;
  }

  .chain-note-document {
    color: #232428;
    font-family: Arial, sans-serif;
    font-size: 12pt;
    line-height: 1.6;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  .chain-note-document h1 {
    margin-bottom: 8px;
    font-size: 25pt;
    font-weight: 700;
    line-height: 1.1;
  }

  .chain-note-document .chain-note-meta {
    margin-bottom: 24px;
    color: #6e7078;
    font-size: 9pt;
    letter-spacing: 0.08em;
  }

  .chain-note-document .chain-note-rule {
    margin-bottom: 24px;
    border-top: 1px solid #dcdde0;
  }

  .chain-note-document .chain-note-section {
    break-inside: auto;
  }

  .chain-note-document .chain-note-section + .chain-note-section {
    margin-top: 24px;
  }

  .chain-note-document .chain-note-label {
    margin-bottom: 6px;
    color: #896b20;
    font-size: 10pt;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    break-after: avoid;
  }

  .chain-note-document .chain-note-rich-text > p {
    margin-bottom: 12px;
    overflow-wrap: anywhere;
    white-space: pre-wrap;
  }

  .chain-note-document .chain-note-rich-text > p:last-child {
    margin-bottom: 0;
  }

  .chain-note-document .chain-note-code {
    margin: 12px 0;
    border: 1px solid #d8dbe0;
    border-radius: 5px;
    background: #f3f4f6;
    break-inside: avoid;
    page-break-inside: avoid;
  }

  .chain-note-document .chain-note-code-label {
    padding: 5px 9px;
    border-bottom: 1px solid #d8dbe0;
    color: #626873;
    font-family: monospace;
    font-size: 8pt;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .chain-note-document .chain-note-code pre {
    padding: 10px;
    overflow-wrap: anywhere;
    white-space: pre-wrap;
  }

  .chain-note-document .chain-note-code code {
    color: #20242b;
    font-family: "SFMono-Regular", Consolas, monospace;
    font-size: 9pt;
    line-height: 1.5;
  }
`;

function safeFileName(title) {
  return (
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') || 'chain-note'
  );
}

function addTextElement(parent, tagName, text, style = {}) {
  const element = document.createElement(tagName);
  element.textContent = text;
  Object.assign(element.style, style);
  parent.append(element);
  return element;
}

function addRichText(parent, text) {
  const normalizedText = (text || '').replace(/\r\n/g, '\n');
  const fencePattern = /```([^\n]*)\n([\s\S]*?)```/g;
  let cursor = 0;

  function addParagraphs(value) {
    for (const paragraph of value.split(/\n{2,}/)) {
      if (paragraph.trim()) addTextElement(parent, 'p', paragraph);
    }
  }

  for (const match of normalizedText.matchAll(fencePattern)) {
    const [fullMatch, language, code] = match;
    const matchIndex = match.index ?? 0;
    addParagraphs(normalizedText.slice(cursor, matchIndex));

    const codeBlock = document.createElement('div');
    codeBlock.className = 'chain-note-code';
    const languageName = language.trim() || 'code';
    const languageLabel = addTextElement(codeBlock, 'div', languageName);
    languageLabel.className = 'chain-note-code-label';
    const pre = document.createElement('pre');
    const codeElement = document.createElement('code');
    codeElement.textContent = code.replace(/^\n|\n$/g, '');
    pre.append(codeElement);
    codeBlock.append(pre);
    parent.append(codeBlock);
    cursor = matchIndex + fullMatch.length;
  }

  addParagraphs(normalizedText.slice(cursor));
}

export function createNotePdfElement({ title, question, answer }) {
  const root = document.createElement('article');
  root.className = 'chain-note-document';
  Object.assign(root.style, {
    position: 'fixed',
    left: '-10000px',
    top: '0',
    width: '680px',
    padding: '42px 48px',
    background: '#ffffff',
    color: '#232428',
    fontFamily: 'Arial, sans-serif',
    fontSize: '12pt',
    lineHeight: '1.6'
  });

  const style = document.createElement('style');
  style.textContent = NOTE_DOCUMENT_CSS;
  root.append(style);

  addTextElement(root, 'h1', title || 'Untitled Q&A');
  const meta = addTextElement(
    root,
    'p',
    `CHAIN NOTES  /  ${new Date().toLocaleDateString()}`
  );
  meta.className = 'chain-note-meta';

  const divider = document.createElement('hr');
  divider.className = 'chain-note-rule';
  root.append(divider);

  for (const [label, value] of [
    ['Question', question || 'Empty question.'],
    ['AI answer', answer || 'Empty answer.']
  ]) {
    const section = document.createElement('section');
    section.className = 'chain-note-section';
    const heading = addTextElement(section, 'h2', label);
    heading.className = 'chain-note-label';
    const content = document.createElement('div');
    content.className = 'chain-note-rich-text';
    addRichText(content, value);
    section.append(content);
    root.append(section);
  }

  return root;
}

export async function exportHtmlNoteAsPdf(note) {
  const element = createNotePdfElement(note);
  document.body.append(element);
  try {
    await html2pdf()
      .set({ ...PDF_OPTIONS, filename: `${safeFileName(note.title)}.pdf` })
      .from(element)
      .save();
  } finally {
    element.remove();
  }
}

export function printNoteInSystemDialog(note) {
  const element = createNotePdfElement(note);
  element.className = 'chain-note-print';
  Object.assign(element.style, {
    position: 'static',
    left: 'auto',
    width: '100%',
    maxWidth: '680px',
    margin: '0 auto'
  });
  document.body.append(element);

  let cleanupTimer;
  const cleanup = () => {
    window.removeEventListener('afterprint', cleanup);
    clearTimeout(cleanupTimer);
    element.remove();
  };
  window.addEventListener('afterprint', cleanup, { once: true });
  cleanupTimer = setTimeout(cleanup, 60000);
  window.print();
}

function renderTextPdf(note) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const margin = 52;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let y = 72;
  doc.setTextColor(35, 36, 40);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(25);
  doc.text(note.title || 'Untitled Q&A', margin, y);
  y += 24;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(110, 112, 120);
  doc.text(`CHAIN NOTES  /  ${new Date().toLocaleDateString()}`, margin, y);
  y += 28;
  doc.setDrawColor(220, 221, 224);
  doc.line(margin, y, pageWidth - margin, y);
  y += 28;
  doc.setTextColor(55, 56, 62);
  doc.setFontSize(11);

  const lines = doc.splitTextToSize(
    `QUESTION\n${note.question || 'Empty question.'}\n\nANSWER\n${note.answer || 'Empty answer.'}`,
    pageWidth - margin * 2
  );
  for (const line of lines) {
    if (y > pageHeight - margin) {
      doc.addPage();
      y = margin;
    }
    doc.text(line, margin, y);
    y += 17;
  }
  return doc;
}

async function renderJsPdfHtml(element) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  await doc.html(element, {
    autoPaging: 'text',
    margin: [40, 48, 40, 48],
    width: 500,
    windowWidth: 680
  });
  doc.output('arraybuffer');
}

async function renderHtml2Pdf(element) {
  await html2pdf().set(PDF_OPTIONS).from(element).toPdf().output('arraybuffer');
}

export async function benchmarkNotePdf(note, runs = 3) {
  const element = createNotePdfElement(note);
  document.body.append(element);
  try {
    const renderers = {
      'jsPDF text': () => renderTextPdf(note).output('arraybuffer'),
      'jsPDF.html': () => renderJsPdfHtml(element),
      'html2pdf.js': () => renderHtml2Pdf(element)
    };
    const timings = {};

    for (const [name, render] of Object.entries(renderers)) {
      await render();
      const startedAt = performance.now();
      for (let run = 0; run < runs; run += 1) await render();
      timings[name] = (performance.now() - startedAt) / runs;
    }
    return { runs, timings };
  } finally {
    element.remove();
  }
}
