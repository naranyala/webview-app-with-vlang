export interface BridgeResponse<T> {
	ok: boolean;
	data?: T;
	error?: string;
}

export function parseBridgeResponse<T>(raw: string): T {
	let response: BridgeResponse<T>;

	try {
		response = JSON.parse(raw) as BridgeResponse<T>;
	} catch {
		throw new Error('The V backend returned an invalid response');
	}

	if (!response.ok) {
		throw new Error(response.error || 'The V backend reported an error');
	}
	if (response.data === undefined) {
		throw new Error('The V backend returned no data');
	}
	return response.data;
}

export function isBridgeAvailable(): boolean {
	return (
		typeof window !== 'undefined' &&
		typeof window.greet_from_v === 'function' &&
		typeof window.get_time === 'function'
	);
}

export async function greetFromV(message: string): Promise<string> {
	if (typeof window === 'undefined' || typeof window.greet_from_v !== 'function') {
		throw new Error('The V backend bridge is unavailable');
	}
	return parseBridgeResponse(await window.greet_from_v(message));
}

export async function getServerTime(): Promise<string> {
	if (typeof window === 'undefined' || typeof window.get_time !== 'function') {
		throw new Error('The V backend bridge is unavailable');
	}
	return parseBridgeResponse(await window.get_time());
}
