import type { Component } from 'svelte';
import AudioEqualizer from '../plugins/audio-equalizer/AudioEqualizer.svelte';
import ChainNotes from '../plugins/chain-notes/ChainNotes.svelte';
import DiskScanner from '../plugins/disk-scanner/DiskScanner.svelte';

export type PluginId = 'disk-scanner' | 'audio-equalizer' | 'chain-notes';

export type ToolkitPlugin = {
	id: PluginId;
	name: string;
	shortName: string;
	description: string;
	accent: string;
	component: Component;
};

export const toolkitPlugins: ToolkitPlugin[] = [
	{
		id: 'disk-scanner',
		name: 'Disk Scanner',
		shortName: 'DS',
		description: 'Inspect drives, folders, and storage usage.',
		accent: '#38bdf8',
		component: DiskScanner
	},
	{
		id: 'audio-equalizer',
		name: 'Audio Equalizer',
		shortName: 'EQ',
		description: 'Shape your sound with presets and frequency bands.',
		accent: '#f472b6',
		component: AudioEqualizer
	},
	{
		id: 'chain-notes',
		name: 'Chain Notes',
		shortName: 'CN',
		description: 'Collect connected notes and export them as documents.',
		accent: '#fbbf24',
		component: ChainNotes
	}
];
