<script lang="ts">
	let message = $state('Click the button to call V backend');
	let response = $state('');

	async function callV() {
		try {
			const res = await (window as any).greet_from_v('Hello from Svelte!');
			response = res;
		} catch (e) {
			response = 'Error: ' + e;
		}
	}

	async function getTime() {
		try {
			const res = await (window as any).get_time();
			response = 'Server time: ' + res;
		} catch (e) {
			response = 'Error: ' + e;
		}
	}
</script>

<main>
	<h1>Webview + Svelte + V</h1>
	<p>{message}</p>

	<div class="buttons">
		<button onclick={callV}>Call V Backend</button>
		<button onclick={getTime}>Get Server Time</button>
	</div>

	{#if response}
		<div class="response">
			<strong>Response:</strong> {response}
		</div>
	{/if}
</main>

<style>
	main {
		max-width: 600px;
		margin: 2rem auto;
		padding: 0 1rem;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
		text-align: center;
	}

	h1 {
		color: #1a1a2e;
		margin-bottom: 1rem;
	}

	.buttons {
		display: flex;
		gap: 1rem;
		justify-content: center;
		margin: 1.5rem 0;
	}

	button {
		padding: 0.75rem 1.5rem;
		font-size: 1rem;
		border: none;
		border-radius: 8px;
		background: #4a6cf7;
		color: white;
		cursor: pointer;
		transition: background 0.2s;
	}

	button:hover {
		background: #3a5ce5;
	}

	.response {
		margin-top: 1.5rem;
		padding: 1rem;
		background: #f0f4ff;
		border-radius: 8px;
		word-break: break-word;
	}
</style>
