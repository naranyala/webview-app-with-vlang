declare global {
	interface Window {
		greet_from_v?: (message: string) => Promise<string>;
		get_time?: () => Promise<string>;
	}
}

export {};
