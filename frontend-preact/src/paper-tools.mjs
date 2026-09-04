export const CITATION_PATTERN = /\[@([\w-]+)\]/g;

function referenceKey(reference) {
  return reference.key || reference.id || reference.label;
}

function replaceCitations(text, order) {
  return String(text || '').replace(CITATION_PATTERN, (_, key) => {
    let index = order.indexOf(key);
    if (index < 0) {
      order.push(key);
      index = order.length - 1;
    }
    return `[${index + 1}]`;
  });
}

function resolveBlock(block, order) {
  if (block.type === 'list') {
    return {
      ...block,
      items: block.items.map((item) => replaceCitations(item, order))
    };
  }
  if (typeof block.text === 'string') {
    return { ...block, text: replaceCitations(block.text, order) };
  }
  return block;
}

export function citedKeys(paper) {
  const order = [];
  replaceCitations(paper.abstract, order);
  for (const section of paper.sections || []) {
    for (const block of section.blocks || []) resolveBlock(block, order);
  }
  return order;
}

export function resolvePaperCitations(paper) {
  const order = [];
  const resolvedPaper = {
    ...paper,
    abstract: replaceCitations(paper.abstract, order),
    sections: (paper.sections || []).map((section) => ({
      ...section,
      blocks: (section.blocks || []).map((block) => resolveBlock(block, order))
    }))
  };
  const referencesByKey = new Map(
    (paper.references || []).map((reference) => [
      referenceKey(reference),
      reference
    ])
  );
  const citedReferences = order.map((key, index) => ({
    ...(referencesByKey.get(key) || {
      id: `missing-${key}`,
      text: 'Missing reference.'
    }),
    label: `[${index + 1}]`,
    key
  }));
  const cited = new Set(order);
  const uncitedReferences = (paper.references || [])
    .filter((reference) => !cited.has(referenceKey(reference)))
    .map((reference) => ({ ...reference, key: referenceKey(reference) }));

  return {
    paper: resolvedPaper,
    references: [...citedReferences, ...uncitedReferences],
    missing: order.filter((key) => !referencesByKey.has(key))
  };
}

export function paperStats(paper) {
  const text = [paper.title, paper.subtitle, paper.abstract];
  for (const section of paper.sections || []) {
    text.push(section.heading);
    for (const block of section.blocks || []) {
      if (block.type === 'list') text.push(...block.items);
      else text.push(block.text || block.code || '');
    }
  }
  const words = text.join(' ').trim().split(/\s+/).filter(Boolean).length;
  return {
    words,
    sections: (paper.sections || []).length,
    references: (paper.references || []).length,
    figures: (paper.assets || []).length,
    readingMinutes: Math.max(1, Math.ceil(words / 200))
  };
}
