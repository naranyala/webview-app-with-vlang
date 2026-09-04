import { performance } from 'node:perf_hooks';
import { Searcher } from 'fast-fuzzy';
import Fuse from 'fuse.js';
import fuzzysort from 'fuzzysort';
import {
  createNoteSearcher,
  FAST_FUZZY_NOTE_OPTIONS,
  FUSE_NOTE_SEARCH_OPTIONS
} from '../src/notes-search.mjs';

const NOTE_COUNT = 2000;
const ITERATIONS = 20;
const ROUNDS = 3;
const queries = [
  'toolkit focused',
  'scannr progress',
  'equalizr scope',
  'generated answr',
  'cancellable folder'
];

const seeds = [
  [
    'Toolkit direction',
    'How should the toolkit stay focused?',
    'Build small local tools with a calm shared launcher.'
  ],
  [
    'Scanner flow',
    'How should a disk scan report progress?',
    'Use a cancellable scan and surface the largest folders first.'
  ],
  [
    'Audio notes',
    'What is the right scope for an equalizer?',
    'Keep the first equalizer app-local before adding system-wide routing.'
  ],
  [
    'Bridge design',
    'How should the native bridge handle requests?',
    'Keep calls bounded, typed, and safe to retry from the frontend.'
  ],
  [
    'Research log',
    'What makes a useful answer worth saving?',
    'Save the question, the generated answer, and enough context to find it later.'
  ]
];

const notes = Array.from({ length: NOTE_COUNT }, (_, index) => {
  const [title, question, answer] = seeds[index % seeds.length];
  return {
    id: `note-${index}`,
    title: `${title} ${index + 1}`,
    tag: index % 2 === 0 ? 'Research' : 'Planning',
    question,
    answer
  };
});

function exactSearch(query) {
  const terms = query.toLowerCase().split(/\s+/);
  return notes.filter((note) =>
    terms.every((term) =>
      `${note.title} ${note.tag} ${note.question} ${note.answer}`
        .toLowerCase()
        .includes(term)
    )
  );
}

const fuse = new Fuse(notes, FUSE_NOTE_SEARCH_OPTIONS);
const fastFuzzySearcher = new Searcher(notes, FAST_FUZZY_NOTE_OPTIONS);
const runners = {
  exact: exactSearch,
  fuse: (query) => fuse.search(query).map((result) => result.item),
  fuzzysort: (query) =>
    fuzzysort
      .go(query, notes, {
        key: (note) =>
          `${note.title} ${note.tag} ${note.question} ${note.answer}`,
        limit: 0,
        threshold: 0.5
      })
      .map((result) => result.obj),
  'fast-fuzzy': (query) => fastFuzzySearcher.search(query)
};

function run(runner) {
  let matches = 0;
  const startedAt = performance.now();
  for (let iteration = 0; iteration < ITERATIONS; iteration += 1) {
    for (const query of queries) matches += runner(query).length;
  }
  return { elapsed: performance.now() - startedAt, matches };
}

function median(values) {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)];
}

for (const runner of Object.values(runners)) {
  for (let index = 0; index < 10; index += 1)
    runner(queries[index % queries.length]);
}

console.log(
  `Notes: ${NOTE_COUNT.toLocaleString()}, queries: ${queries.length}, searches per round: ${ITERATIONS * queries.length}`
);
console.log(
  `Results are median wall-clock time across ${ROUNDS} rounds; lower is faster.`
);
console.log('library\tmedian ms\taverage us/search\tmatches');

for (const [name, runner] of Object.entries(runners)) {
  const measurements = [];
  let matches = 0;
  for (let round = 0; round < ROUNDS; round += 1) {
    const result = run(runner);
    measurements.push(result.elapsed);
    matches = result.matches;
  }
  const elapsed = median(measurements);
  const searches = ITERATIONS * queries.length;
  console.log(
    `${name}\t${elapsed.toFixed(2)}\t${((elapsed / searches) * 1000).toFixed(2)}\t${matches / ITERATIONS}`
  );
}

const appSearcher = createNoteSearcher(notes);
console.log(
  `Fast-fuzzy app query example: ${appSearcher.search('scannr progress').length} matches for "scannr progress"`
);
