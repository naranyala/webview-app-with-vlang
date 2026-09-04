// Deliberately small, dependency-free Markdown subset for imported AI chats.
export function parseInline(text) {
  const spans = [];
  const push = (raw, bold = false, italic = false, code = false) => {
    if (!raw) return;
    const clean = code ? raw : raw.replace(/\s+/g, ' ');
    if (!clean) return;
    const span = { t: clean };
    if (bold) span.b = true;
    if (italic) span.i = true;
    if (code) span.c = true;
    spans.push(span);
  };

  const pushStyled = (raw) => {
    const pattern = /(\*\*[^*]+\*\*|__[^_]+__|\*[^*]+\*|_[^_]+_)/g;
    let last = 0;
    let match = pattern.exec(raw);
    while (match !== null) {
      push(raw.slice(last, match.index));
      const token = match[0];
      if (token.startsWith('**') || token.startsWith('__')) {
        push(token.slice(2, -2), true);
      } else {
        push(token.slice(1, -1), false, true);
      }
      last = match.index + token.length;
      match = pattern.exec(raw);
    }
    push(raw.slice(last));
  };

  for (const part of String(text).split(/(`[^`]*`)/g)) {
    if (!part) continue;
    if (part.length >= 2 && part.startsWith('`') && part.endsWith('`')) {
      push(part.slice(1, -1), false, false, true);
    } else {
      pushStyled(part);
    }
  }
  return spans.length > 0 ? spans : [{ t: '' }];
}

export function parseMarkdown(text) {
  const lines = String(text || '')
    .replace(/\r\n?/g, '\n')
    .split('\n');
  const blocks = [];
  let paragraph = [];
  const flush = () => {
    if (paragraph.length > 0) {
      blocks.push({ type: 'para', spans: parseInline(paragraph.join('\n')) });
      paragraph = [];
    }
  };

  let index = 0;
  while (index < lines.length) {
    const line = lines[index];
    const fence = line.match(/^\s*```(\w*)\s*$/);
    if (fence) {
      flush();
      const code = [];
      index += 1;
      while (index < lines.length && !/^\s*```/.test(lines[index])) {
        code.push(lines[index]);
        index += 1;
      }
      if (index < lines.length) index += 1;
      blocks.push({
        type: 'code',
        lang: fence[1] || '',
        text: code.join('\n')
      });
      continue;
    }
    const heading = line.match(/^(#{1,4})\s+(.*)$/);
    if (heading) {
      flush();
      blocks.push({
        type: 'heading',
        level: heading[1].length,
        text: heading[2].trim()
      });
      index += 1;
      continue;
    }
    if (/^\s*(---|\*\*\*|___)\s*$/.test(line)) {
      flush();
      blocks.push({ type: 'rule' });
      index += 1;
      continue;
    }
    const quote = line.match(/^\s*>\s?(.*)$/);
    if (quote) {
      flush();
      const quoted = [quote[1]];
      index += 1;
      while (index < lines.length) {
        const next = lines[index].match(/^\s*>\s?(.*)$/);
        if (!next) break;
        quoted.push(next[1]);
        index += 1;
      }
      blocks.push({ type: 'quote', spans: parseInline(quoted.join('\n')) });
      continue;
    }
    const unordered = line.match(/^\s*[-*+]\s+(.*)$/);
    const ordered = line.match(/^\s*\d+[.)]\s+(.*)$/);
    if (unordered || ordered) {
      flush();
      const isOrdered = Boolean(ordered);
      const items = [];
      while (index < lines.length) {
        const item = isOrdered
          ? lines[index].match(/^\s*\d+[.)]\s+(.*)$/)
          : lines[index].match(/^\s*[-*+]\s+(.*)$/);
        if (!item) break;
        items.push(parseInline(item[1]));
        index += 1;
      }
      blocks.push({ type: 'list', ordered: isOrdered, items });
      continue;
    }
    if (/^\s*$/.test(line)) {
      flush();
      index += 1;
      continue;
    }
    paragraph.push(line.trim());
    index += 1;
  }
  flush();
  return blocks;
}

export function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function spansToHtml(spans) {
  return spans
    .map((span) => {
      let html = escapeHtml(span.t);
      if (span.c) return `<code>${html}</code>`;
      if (span.b) html = `<strong>${html}</strong>`;
      if (span.i) html = `<em>${html}</em>`;
      return html;
    })
    .join('');
}

export function blocksToHtml(blocks) {
  return blocks
    .map((block) => {
      switch (block.type) {
        case 'heading': {
          const level = Math.min(Math.max(block.level || 2, 1), 4);
          return `<h${level}>${escapeHtml(block.text)}</h${level}>`;
        }
        case 'code':
          return `<pre><code>${escapeHtml(block.text) || '<br>'}</code></pre>`;
        case 'list': {
          const tag = block.ordered ? 'ol' : 'ul';
          return `<${tag}>${block.items
            .map((spans) => `<li>${spansToHtml(spans)}</li>`)
            .join('')}</${tag}>`;
        }
        case 'quote':
          return `<blockquote>${spansToHtml(block.spans)}</blockquote>`;
        case 'rule':
          return '<hr>';
        default:
          return `<p>${spansToHtml(block.spans || [])}</p>`;
      }
    })
    .join('');
}

export const PRINT_CSS_RESET =
  '@page{margin:15mm}' +
  '@media screen{#chain-print-root{display:none}}' +
  '@media print{' +
  '#app{display:none!important}' +
  '#chain-print-root,#chain-print-root *{margin:0;padding:0;box-sizing:border-box;color:#000!important;background:transparent!important;box-shadow:none!important;text-shadow:none!important}' +
  '#chain-print-root{display:block!important;font:11pt/1.5 -apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif}' +
  '#chain-print-root h1{font-size:24pt;line-height:1.2;margin:0 0 4pt}' +
  '#chain-print-root h2{font-size:14pt;line-height:1.3;margin:16pt 0 6pt;break-after:avoid}' +
  '#chain-print-root p{margin:0 0 6pt;overflow-wrap:break-word}' +
  '#chain-print-root ul,#chain-print-root ol{margin:0 0 6pt 18pt;padding:0}' +
  '#chain-print-root blockquote{border-left:2pt solid #888;padding-left:8pt;margin:0 0 6pt}' +
  '#chain-print-root pre{background:#f2f3f5!important;border:1pt solid #d5d7db;padding:8pt;margin:0 0 8pt;white-space:pre-wrap;overflow-wrap:anywhere}' +
  '}';
