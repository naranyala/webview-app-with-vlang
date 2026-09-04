import html2pdf from 'html2pdf.js';

const PDF_OPTIONS = {
  margin: [36, 40, 40, 40],
  image: { type: 'jpeg', quality: 0.98 },
  html2canvas: {
    backgroundColor: '#ffffff',
    scale: 2,
    useCORS: false
  },
  jsPDF: { unit: 'pt', format: 'a4', orientation: 'portrait' },
  pagebreak: { mode: ['css', 'legacy'] }
};

const PAPER_DOCUMENT_CSS = `
  .academic-paper-document,
  .academic-paper-document * {
    box-sizing: border-box;
  }

  .academic-paper-document {
    color: #26272b;
    font-family: Arial, sans-serif;
    font-size: 10.5pt;
    line-height: 1.55;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  .academic-paper-document .paper-pdf-header {
    margin-bottom: 22px;
    text-align: center;
  }

  .academic-paper-document .paper-pdf-kicker {
    margin-bottom: 12px;
    color: #80651f;
    font-size: 8pt;
    font-weight: 700;
    letter-spacing: 0.14em;
    text-transform: uppercase;
  }

  .academic-paper-document h1 {
    margin: 0 auto 8px;
    max-width: 640px;
    font-family: Georgia, serif;
    font-size: 25pt;
    font-weight: 700;
    line-height: 1.08;
  }

  .academic-paper-document .paper-pdf-subtitle {
    margin: 0 0 12px;
    color: #626873;
    font-family: Georgia, serif;
    font-size: 12pt;
    font-style: italic;
  }

  .academic-paper-document .paper-pdf-byline {
    margin: 0;
    font-size: 9pt;
  }

  .academic-paper-document .paper-pdf-venue {
    margin: 3px 0 0;
    color: #626873;
    font-size: 8pt;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .academic-paper-document .paper-pdf-abstract {
    margin-bottom: 20px;
    padding: 12px 14px;
    border-top: 2px solid #26272b;
    border-bottom: 1px solid #c9cbd0;
    font-size: 9.5pt;
  }

  .academic-paper-document .paper-pdf-abstract strong {
    margin-right: 5px;
    font-size: 8.5pt;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .academic-paper-document .paper-pdf-keywords {
    margin-top: 8px;
    color: #626873;
    font-size: 8.5pt;
  }

  .academic-paper-document .paper-pdf-columns {
    column-count: 2;
    column-gap: 28px;
    column-fill: balance;
  }

  .academic-paper-document .paper-pdf-section {
    break-inside: auto;
  }

  .academic-paper-document .paper-pdf-section h2 {
    margin: 0 0 7px;
    font-family: Georgia, serif;
    font-size: 12pt;
    line-height: 1.2;
    break-after: avoid;
  }

  .academic-paper-document .paper-pdf-section + .paper-pdf-section {
    margin-top: 16px;
  }

  .academic-paper-document p {
    margin: 0 0 9px;
    overflow-wrap: anywhere;
    text-align: justify;
  }

  .academic-paper-document blockquote {
    margin: 12px 0;
    padding: 4px 0 4px 12px;
    border-left: 2px solid #c49b42;
    color: #4c4e54;
    font-family: Georgia, serif;
    font-style: italic;
  }

  .academic-paper-document ul {
    margin: 0 0 10px;
    padding-left: 17px;
  }

  .academic-paper-document li {
    margin-bottom: 4px;
  }

  .academic-paper-document .paper-pdf-code {
    margin: 11px 0;
    border: 1px solid #d7d9dd;
    border-radius: 4px;
    background: #f2f3f5;
    break-inside: avoid;
    page-break-inside: avoid;
  }

  .academic-paper-document .paper-pdf-code-label {
    padding: 4px 8px;
    border-bottom: 1px solid #d7d9dd;
    color: #626873;
    font-family: monospace;
    font-size: 7.5pt;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .academic-paper-document pre {
    margin: 0;
    padding: 8px;
    overflow-wrap: anywhere;
    white-space: pre-wrap;
  }

  .academic-paper-document code {
    font-family: "SFMono-Regular", Consolas, monospace;
    font-size: 7.5pt;
    line-height: 1.45;
  }

  .academic-paper-document .paper-pdf-references {
    margin-top: 19px;
    padding-top: 9px;
    border-top: 1px solid #c9cbd0;
    column-span: all;
  }

  .academic-paper-document .paper-pdf-references h2 {
    margin: 0 0 7px;
    font-family: Georgia, serif;
    font-size: 12pt;
  }

  .academic-paper-document .paper-pdf-reference {
    display: grid;
    grid-template-columns: 24px 1fr;
    gap: 4px;
    margin-bottom: 5px;
    font-size: 8.5pt;
  }
`;

function safeFileName(title) {
  return (
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') || 'academic-paper'
  );
}

export function academicPaperPdfFileName(title) {
  return `${safeFileName(title)}.pdf`;
}

function addTextElement(parent, tagName, text, className) {
  const element = document.createElement(tagName);
  element.textContent = text;
  if (className) element.className = className;
  parent.append(element);
  return element;
}

function appendBlock(parent, block) {
  if (block.type === 'paragraph') addTextElement(parent, 'p', block.text);
  if (block.type === 'quote') addTextElement(parent, 'blockquote', block.text);
  if (block.type === 'list') {
    const list = document.createElement('ul');
    for (const item of block.items) addTextElement(list, 'li', item);
    parent.append(list);
  }
  if (block.type === 'code') {
    const codeBlock = document.createElement('div');
    codeBlock.className = 'paper-pdf-code';
    addTextElement(codeBlock, 'div', block.language, 'paper-pdf-code-label');
    const pre = document.createElement('pre');
    addTextElement(pre, 'code', block.code);
    codeBlock.append(pre);
    parent.append(codeBlock);
  }
}

export function createAcademicPaperPdfElement(paper) {
  const root = document.createElement('article');
  root.className = 'academic-paper-document';
  Object.assign(root.style, {
    position: 'fixed',
    left: '-10000px',
    top: '0',
    width: '760px',
    padding: '38px 44px',
    background: '#ffffff',
    color: '#26272b'
  });

  const style = document.createElement('style');
  style.textContent = PAPER_DOCUMENT_CSS;
  root.append(style);

  const header = document.createElement('header');
  header.className = 'paper-pdf-header';
  addTextElement(
    header,
    'div',
    paper.venue || 'Academic paper',
    'paper-pdf-kicker'
  );
  addTextElement(header, 'h1', paper.title);
  if (paper.subtitle)
    addTextElement(header, 'p', paper.subtitle, 'paper-pdf-subtitle');
  addTextElement(
    header,
    'p',
    paper.authors.map((author) => author.name).join(', ') || 'Anonymous author',
    'paper-pdf-byline'
  );
  if (paper.year) addTextElement(header, 'p', paper.year, 'paper-pdf-venue');
  root.append(header);

  const abstract = document.createElement('section');
  abstract.className = 'paper-pdf-abstract';
  const abstractText = document.createElement('div');
  addTextElement(abstractText, 'strong', 'Abstract');
  abstractText.append(document.createTextNode(` ${paper.abstract}`));
  abstract.append(abstractText);
  if (paper.keywords.length) {
    addTextElement(
      abstract,
      'div',
      `Keywords: ${paper.keywords.join(', ')}`,
      'paper-pdf-keywords'
    );
  }
  root.append(abstract);

  const columns = document.createElement('div');
  columns.className = 'paper-pdf-columns';
  for (const sectionData of paper.sections) {
    const section = document.createElement('section');
    section.className = 'paper-pdf-section';
    addTextElement(section, 'h2', sectionData.heading);
    for (const block of sectionData.blocks) appendBlock(section, block);
    columns.append(section);
  }

  if (paper.references.length) {
    const references = document.createElement('section');
    references.className = 'paper-pdf-references';
    addTextElement(references, 'h2', 'References');
    for (const reference of paper.references) {
      const row = document.createElement('div');
      row.className = 'paper-pdf-reference';
      addTextElement(row, 'span', reference.label);
      addTextElement(row, 'span', reference.text);
      references.append(row);
    }
    columns.append(references);
  }
  root.append(columns);
  return root;
}

export async function exportAcademicPaperAsPdf(paper) {
  const element = createAcademicPaperPdfElement(paper);
  document.body.append(element);
  try {
    await html2pdf()
      .set({ ...PDF_OPTIONS, filename: `${safeFileName(paper.title)}.pdf` })
      .from(element)
      .save();
  } finally {
    element.remove();
  }
}

export async function generateAcademicPaperPdfBytes(paper) {
  const element = createAcademicPaperPdfElement(paper);
  document.body.append(element);
  try {
    return await html2pdf()
      .set(PDF_OPTIONS)
      .from(element)
      .toPdf()
      .output('arraybuffer');
  } finally {
    element.remove();
  }
}

export function printAcademicPaperInSystemDialog(paper) {
  const element = createAcademicPaperPdfElement(paper);
  element.classList.add('academic-paper-print');
  Object.assign(element.style, {
    position: 'static',
    left: 'auto',
    width: '100%',
    maxWidth: '760px',
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
