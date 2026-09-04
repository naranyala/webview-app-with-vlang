export const ACADEMIC_PAPERS_STORAGE_KEY = 'webview-app.academic-papers';

export const starterPapers = [
  {
    id: 'local-first-notes',
    title: 'A Local-First Architecture for AI Research Notes',
    subtitle: 'Designing durable knowledge capture at the edge',
    authors: [
      { name: 'WebView Research Group', affiliation: 'Independent Systems Lab' }
    ],
    venue: 'Working Paper 01',
    year: '2026',
    abstract:
      'AI-assisted research creates a new capture problem: useful answers arrive quickly, but their context is easily separated from the final insight. This paper presents a local-first model for storing question-and-answer exchanges as durable, searchable research objects. The design prioritizes ownership, recoverability, and a reading surface that can move from raw conversation to publishable document.',
    keywords: [
      'local-first',
      'AI-assisted research',
      'knowledge capture',
      'Q&A'
    ],
    sections: [
      {
        id: 'introduction',
        heading: '1. Introduction',
        blocks: [
          {
            type: 'paragraph',
            text: 'Research workflows increasingly include external generative systems. A researcher asks a question, receives a provisional answer, and then decides whether that exchange deserves a permanent place in the working record. The important unit is not the answer alone; it is the relationship between prompt, response, interpretation, and later retrieval.'
          },
          {
            type: 'paragraph',
            text: 'This paper treats a captured exchange as a first-class local document. The approach avoids coupling storage to a particular model provider and keeps the researcher in control of the source material. It also separates capture from presentation, allowing the same record to support search, focused reading, and print-quality export.'
          },
          {
            type: 'quote',
            text: 'The durable artifact is the question together with the answer, not an isolated completion.'
          }
        ]
      },
      {
        id: 'model',
        heading: '2. Document Model',
        blocks: [
          {
            type: 'paragraph',
            text: 'The document model uses explicit semantic fields. Metadata describes provenance and identity, while ordered content blocks preserve the structure needed for a readable paper. Typed blocks are intentionally small: paragraphs carry prose, quotes preserve emphasis, lists preserve procedure, and code blocks preserve executable examples.'
          },
          {
            type: 'code',
            language: 'javascript',
            code: 'const exchange = {\n  question: prompt,\n  answer: response,\n  capturedAt: new Date().toISOString()\n};'
          },
          {
            type: 'list',
            items: [
              'Capture the question and generated answer together.',
              'Keep the stored representation independent of the provider.',
              'Render the same semantic record for screen and print.'
            ]
          }
        ]
      },
      {
        id: 'reading-surface',
        heading: '3. Reading Surface',
        blocks: [
          {
            type: 'paragraph',
            text: 'A two-column layout reduces line length without forcing the reader into a separate application. The left rail provides orientation, while the paper itself retains familiar scholarly cues: title hierarchy, abstract, keywords, numbered sections, quotations, code examples, and references.'
          },
          {
            type: 'paragraph',
            text: 'Responsive behavior is part of the document design. Columns collapse at narrow widths, controls remain available above the paper, and print styles restore a controlled page surface. This ensures that reading on a small display and saving a final document do not require separate content pipelines.'
          }
        ]
      },
      {
        id: 'discussion',
        heading: '4. Discussion',
        blocks: [
          {
            type: 'paragraph',
            text: 'The local-first approach does not claim that generated answers are authoritative. Instead, it makes uncertainty visible and reviewable. A saved exchange can be corrected, annotated, or cited later without depending on the continued availability of a remote chat history.'
          },
          {
            type: 'paragraph',
            text: 'The main trade-off is responsibility: local ownership transfers backup and organization duties to the user. That trade-off is acceptable for research notes when the system provides predictable export, transparent storage, and a model that can grow from a single exchange into a connected paper.'
          }
        ]
      },
      {
        id: 'conclusion',
        heading: '5. Conclusion',
        blocks: [
          {
            type: 'paragraph',
            text: 'Question-and-answer capture is a useful bridge between exploration and final writing. By modeling the exchange explicitly and presenting it through a paper-oriented reader, a local application can preserve both the speed of AI assistance and the discipline of a durable research record.'
          }
        ]
      }
    ],
    references: [
      {
        id: 'ref-local-first',
        label: '[1]',
        authors: 'Bonnie, K.',
        year: '2025',
        title:
          'Local-first software: ownership and resilience in personal knowledge systems',
        type: 'Working notes',
        text: 'Bonnie, K. Local-first software: ownership and resilience in personal knowledge systems. Working notes, 2025.'
      },
      {
        id: 'ref-human-loop',
        label: '[2]',
        authors: 'Huang, R.',
        year: '2026',
        title: 'Human review patterns for generated research assistance',
        type: 'Report',
        text: 'Huang, R. Human review patterns for generated research assistance. Independent Systems Lab, 2026.'
      }
    ],
    assets: []
  }
];

function isString(value) {
  return typeof value === 'string';
}

function normalizeBlock(block) {
  if (!block || !isString(block.type)) return null;
  if (block.type === 'list' && Array.isArray(block.items)) {
    return {
      type: 'list',
      items: block.items.filter(isString)
    };
  }
  if (['paragraph', 'quote'].includes(block.type) && isString(block.text)) {
    return { type: block.type, text: block.text };
  }
  if (block.type === 'code' && isString(block.code)) {
    return {
      type: 'code',
      language: isString(block.language) ? block.language : 'code',
      code: block.code
    };
  }
  return null;
}

export function normalizeAcademicPaper(value) {
  if (!value || !isString(value.id) || !isString(value.title)) return null;
  const sections = Array.isArray(value.sections)
    ? value.sections
        .filter(
          (section) =>
            section && isString(section.id) && isString(section.heading)
        )
        .map((section) => ({
          id: section.id,
          heading: section.heading,
          blocks: Array.isArray(section.blocks)
            ? section.blocks.map(normalizeBlock).filter(Boolean)
            : []
        }))
    : [];

  return {
    id: value.id,
    title: value.title,
    subtitle: isString(value.subtitle) ? value.subtitle : '',
    authors: Array.isArray(value.authors)
      ? value.authors.filter((author) => author && isString(author.name))
      : [],
    venue: isString(value.venue) ? value.venue : '',
    year: isString(value.year) ? value.year : '',
    abstract: isString(value.abstract) ? value.abstract : '',
    keywords: Array.isArray(value.keywords)
      ? value.keywords.filter(isString)
      : [],
    sections,
    references: Array.isArray(value.references)
      ? value.references
          .filter(
            (reference) =>
              reference && isString(reference.label) && isString(reference.text)
          )
          .map((reference) => ({
            id: reference.id || reference.label,
            label: reference.label,
            authors: isString(reference.authors) ? reference.authors : '',
            year: isString(reference.year) ? reference.year : '',
            title: isString(reference.title) ? reference.title : '',
            type: isString(reference.type) ? reference.type : 'Other',
            doi: isString(reference.doi) ? reference.doi : '',
            url: isString(reference.url) ? reference.url : '',
            text: reference.text
          }))
      : [],
    assets: Array.isArray(value.assets)
      ? value.assets
          .filter(
            (asset) =>
              asset &&
              isString(asset.id) &&
              isString(asset.name) &&
              isString(asset.src)
          )
          .map((asset) => ({
            id: asset.id,
            name: asset.name,
            type: isString(asset.type) ? asset.type : 'image',
            src: asset.src,
            alt: isString(asset.alt) ? asset.alt : asset.name,
            caption: isString(asset.caption) ? asset.caption : ''
          }))
      : []
  };
}

export function loadAcademicPapers() {
  if (typeof window === 'undefined') return starterPapers;
  try {
    const stored = JSON.parse(
      window.localStorage.getItem(ACADEMIC_PAPERS_STORAGE_KEY)
    );
    if (!Array.isArray(stored)) return starterPapers;
    return stored.map(normalizeAcademicPaper).filter(Boolean);
  } catch {
    return starterPapers;
  }
}

export function saveAcademicPapers(papers) {
  if (typeof window === 'undefined') return false;
  try {
    const normalized = papers.map(normalizeAcademicPaper).filter(Boolean);
    window.localStorage.setItem(
      ACADEMIC_PAPERS_STORAGE_KEY,
      JSON.stringify(normalized)
    );
    return true;
  } catch {
    return false;
  }
}
