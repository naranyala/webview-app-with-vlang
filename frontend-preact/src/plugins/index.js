import { AcademicPaper } from './academic-paper.jsx';
import { AudioEqualizer } from './audio-equalizer.jsx';
import { BlenderCompanion } from './blender-companion.jsx';
import { ChainNotes } from './chain-notes.jsx';
import { defineFrontendPlugin } from './contract.js';
import { DiskScanner } from './disk-scanner.jsx';
import { MirLab } from './mir-lab.jsx';
import { Quiz } from './quiz.jsx';
import { TodoApp } from './todo.jsx';

export const diskScannerPlugin = defineFrontendPlugin({
  id: 'disk',
  index: '01',
  title: 'Asset Scanner',
  description: 'Index Blender projects, renders, and sample folders locally.',
  tone: 'coral',
  symbol: 'STORAGE',
  component: DiskScanner
});

export const audioEqualizerPlugin = defineFrontendPlugin({
  id: 'equalizer',
  index: '02',
  title: 'MIR Workbench',
  description:
    'Audition samples and inspect tempo, key, and spectral features.',
  tone: 'blue',
  symbol: 'SIGNAL',
  component: AudioEqualizer
});

export const chainNotesPlugin = defineFrontendPlugin({
  id: 'notes',
  index: '03',
  title: 'Production Log',
  description: 'Capture Blender shots, listening notes, and AI research Q&A.',
  tone: 'gold',
  symbol: 'WRITING',
  component: ChainNotes
});

export const todoPlugin = defineFrontendPlugin({
  id: 'todos',
  index: '04',
  title: 'Shots & Tasks',
  description: 'Track shots, mixes, and releases with dates and calendar.',
  tone: 'gold',
  symbol: 'TODO',
  component: TodoApp
});

export const quizPlugin = defineFrontendPlugin({
  id: 'quiz',
  index: '05',
  title: 'Drills',
  description: 'Drill Blender, DSP, and music-theory fundamentals.',
  tone: 'coral',
  symbol: 'LEARN',
  component: Quiz
});

export const academicPaperPlugin = defineFrontendPlugin({
  id: 'paper',
  index: '06',
  title: 'Research Desk',
  description: 'Read MIR and 3D papers with references and figures.',
  tone: 'blue',
  symbol: 'PAPER',
  component: AcademicPaper
});

export const mirLabPlugin = defineFrontendPlugin({
  id: 'mir',
  index: '07',
  title: 'MIR Lab',
  description: 'Offline loudness, peak, and brightness analysis.',
  tone: 'cyan',
  symbol: 'WAVE',
  component: MirLab
});

export const blenderPlugin = defineFrontendPlugin({
  id: 'blender',
  index: '08',
  title: 'Blender Studio',
  description: 'Scenes, engines, stages, and render notes.',
  tone: 'violet',
  symbol: 'MESH',
  component: BlenderCompanion
});

const registeredPlugins = [
  diskScannerPlugin,
  audioEqualizerPlugin,
  chainNotesPlugin,
  todoPlugin,
  quizPlugin,
  academicPaperPlugin,
  mirLabPlugin,
  blenderPlugin
];
const pluginIds = new Set();

for (const plugin of registeredPlugins) {
  if (pluginIds.has(plugin.id))
    throw new Error(`Duplicate frontend plugin id: ${plugin.id}`);
  pluginIds.add(plugin.id);
}

export const frontendPlugins = Object.freeze(registeredPlugins);

export function getFrontendPlugin(id) {
  return frontendPlugins.find((plugin) => plugin.id === id);
}
