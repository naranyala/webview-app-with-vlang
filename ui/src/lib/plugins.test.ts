import { describe, expect, it } from 'vitest';
import { toolkitPlugins } from './plugins';

describe('toolkit plugin registry', () => {
	it('contains each enabled tool exactly once', () => {
		expect(toolkitPlugins.map((plugin) => plugin.id)).toEqual([
			'disk-scanner',
			'audio-equalizer',
			'chain-notes'
		]);
	});

	it('provides renderable metadata for every tool', () => {
		for (const plugin of toolkitPlugins) {
			expect(plugin.name).toBeTruthy();
			expect(plugin.description).toBeTruthy();
			expect(plugin.component).toBeTypeOf('function');
		}
	});
});
