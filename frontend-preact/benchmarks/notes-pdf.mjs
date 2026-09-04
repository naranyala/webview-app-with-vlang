import { performance } from 'node:perf_hooks';
import htmlToPdfmake from 'html-to-pdfmake';
import { JSDOM } from 'jsdom';
import { jsPDF } from 'jspdf';
import pdfMake from 'pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts.js';

const RUNS = 5;
const note = {
  title: 'Scanner flow',
  question: 'How should a disk scan report progress?',
  answer:
    'Use a cancellable scan, stream progress without blocking the window, and surface the largest folders first.'
};

const dom = new JSDOM('');
const html = `
  <article>
    <h1>${note.title}</h1>
    <p>CHAIN NOTES / benchmark</p>
    <hr>
    <h2>Question</h2>
    <p>${note.question}</p>
    <h2>AI answer</h2>
    <p>${note.answer}</p>
    <pre><code>scan.start({ cancellable: true });</code></pre>
  </article>
`;

pdfMake.virtualfs.storage = Object.fromEntries(
  Object.entries(pdfFonts).map(([name, data]) => [
    name,
    Buffer.from(data, 'base64')
  ])
);
pdfMake.addFonts({
  Roboto: {
    normal: 'Roboto-Regular.ttf',
    bold: 'Roboto-Medium.ttf',
    italics: 'Roboto-Italic.ttf',
    bolditalics: 'Roboto-MediumItalic.ttf'
  }
});
pdfMake.setUrlAccessPolicy(() => false);
pdfMake.setLocalAccessPolicy(() => false);

function renderJsPdfText() {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  doc.setFontSize(18);
  doc.text(note.title, 52, 72);
  doc.setFontSize(11);
  doc.text(
    doc.splitTextToSize(`${note.question}\n\n${note.answer}`, 490),
    52,
    112
  );
  return doc.output('arraybuffer').byteLength;
}

async function renderPdfMakeHtml() {
  const content = htmlToPdfmake(html, { window: dom.window });
  const document = pdfMake.createPdf({
    content,
    defaultStyle: { font: 'Roboto' }
  });
  return (await document.getBuffer()).length;
}

const renderers = {
  'jsPDF text': renderJsPdfText,
  'html-to-pdfmake + pdfmake': renderPdfMakeHtml
};

function median(values) {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)];
}

console.log(`Note: ${note.title}; runs per renderer: ${RUNS}`);
console.log(
  'Browser-only renderers are benchmarked by Chain Notes > Benchmark.'
);
console.log('library\tmedian ms\toutput bytes');

for (const [name, render] of Object.entries(renderers)) {
  const timings = [];
  let outputBytes = 0;
  await render();
  for (let run = 0; run < RUNS; run += 1) {
    const startedAt = performance.now();
    outputBytes = await render();
    timings.push(performance.now() - startedAt);
  }
  console.log(`${name}\t${median(timings).toFixed(2)}\t${outputBytes}`);
}
