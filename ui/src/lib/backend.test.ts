import { afterEach, describe, expect, it, vi } from 'vitest';
import { greetFromV, isBridgeAvailable, parseBridgeResponse } from './backend';

describe('backend bridge client', () => {
	afterEach(() => vi.unstubAllGlobals());

	it('parses a successful bridge response', () => {
		expect(parseBridgeResponse<string>('{"ok":true,"data":"hello"}')).toBe('hello');
	});

	it('throws the backend error from a failed response', () => {
		expect(() => parseBridgeResponse('{"ok":false,"error":"not ready"}')).toThrow('not ready');
	});

	it('rejects malformed bridge responses', () => {
		expect(() => parseBridgeResponse('not json')).toThrow('invalid response');
	});

	it('detects when the native bridge is unavailable', async () => {
		vi.stubGlobal('window', {});

		expect(isBridgeAvailable()).toBe(false);
		await expect(greetFromV('hello')).rejects.toThrow('bridge is unavailable');
	});
});
