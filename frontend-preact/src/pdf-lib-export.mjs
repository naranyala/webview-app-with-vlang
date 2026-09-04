import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

export async function generateNotePdfLibBytes(note) {
  const document = await PDFDocument.create();
  const font = await document.embedFont(StandardFonts.Helvetica);
  const boldFont = await document.embedFont(StandardFonts.HelveticaBold);
  const fontSize = 11;
  const lineHeight = 16;
  const margin = 52;
  let page = document.addPage();
  let y = page.getHeight() - 72;

  const addPageIfNeeded = () => {
    if (y > margin) return;
    page = document.addPage();
    y = page.getHeight() - margin;
  };
  const drawLines = (value, selectedFont = font) => {
    const lines = String(value || '').split(/\r?\n/);
    for (const line of lines) {
      const words = line.split(/\s+/).filter(Boolean);
      let current = '';
      for (const word of words) {
        const next = current ? `${current} ${word}` : word;
        if (
          selectedFont.widthOfTextAtSize(next, fontSize) >
          page.getWidth() - margin * 2
        ) {
          addPageIfNeeded();
          page.drawText(current, {
            x: margin,
            y,
            size: fontSize,
            font: selectedFont,
            color: rgb(0.22, 0.22, 0.25)
          });
          y -= lineHeight;
          current = word;
        } else {
          current = next;
        }
      }
      addPageIfNeeded();
      page.drawText(current, {
        x: margin,
        y,
        size: fontSize,
        font: selectedFont,
        color: rgb(0.22, 0.22, 0.25)
      });
      y -= lineHeight;
    }
  };

  page.drawText(note.title || 'Untitled Q&A', {
    x: margin,
    y,
    size: 22,
    font: boldFont,
    color: rgb(0.14, 0.14, 0.16)
  });
  y -= 30;
  drawLines(
    `QUESTION\n${note.question || 'Empty question.'}\n\nANSWER\n${note.answer || 'Empty answer.'}`
  );
  return document.save();
}
