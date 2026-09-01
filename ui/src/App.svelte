<script lang="ts">
	import { onMount } from 'svelte';
	import { isBridgeAvailable } from './lib/backend';
	import { toolkitPlugins, type PluginId } from './lib/plugins';

	let activeApp = $state<PluginId | null>(null);
	let error = $state('');
	let bridgeAvailable = $state(isBridgeAvailable());
	let browserFullscreen = $state(false);
	let activeItem = $derived(toolkitPlugins.find((plugin) => plugin.id === activeApp));

	onMount(() => {
		const syncFullscreenState = () => {
			browserFullscreen = Boolean(document.fullscreenElement);
		};

		document.addEventListener('fullscreenchange', syncFullscreenState);
		return () => document.removeEventListener('fullscreenchange', syncFullscreenState);
	});

	function openApp(plugin: (typeof toolkitPlugins)[number]) {
		activeApp = plugin.id;
		error = '';
	}

	async function closeApp() {
		if (document.fullscreenElement) {
			await document.exitFullscreen().catch(() => undefined);
		}
		activeApp = null;
		error = '';
	}

	async function toggleFullscreen() {
		try {
			if (document.fullscreenElement) {
				await document.exitFullscreen();
			} else {
				await document.documentElement.requestFullscreen();
			}
		} catch {
			error = 'Fullscreen is not available in this WebView';
		}
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape' && activeApp) {
			void closeApp();
		}
	}
</script>

<svelte:head>
	<title>Launchpad - Svelte + V</title>
	<link rel="icon" href="/favicon.svg" />
</svelte:head>

<svelte:window onkeydown={handleKeydown} />

{#if activeItem}
	{@const Tool = activeItem.component}
	<section class="workspace" aria-label={`${activeItem.name} workspace`}>
		<aside class="sidebar" aria-label="Workspace navigation">
			<button class="home-button" onclick={closeApp} aria-label="Return to home launcher">
				<span class="home-mark">LP</span>
				<span>Home</span>
			</button>
			<div class="sidebar-rule"></div>
			<p class="sidebar-label">Tools</p>
			<nav>
				{#each toolkitPlugins as plugin}
					<button
						class="sidebar-item"
						class:active={activeApp === plugin.id}
						onclick={() => openApp(plugin)}
						aria-current={activeApp === plugin.id ? 'page' : undefined}
						style={`--accent: ${plugin.accent}`}
					>
						<span class="sidebar-icon">{plugin.shortName}</span>
						<span class="sidebar-item-name">{plugin.name}</span>
					</button>
				{/each}
			</nav>
			<div class="sidebar-footer" class:offline={!bridgeAvailable}>
				<span class="state-dot"></span>
				<span>{bridgeAvailable ? 'Bridge online' : 'Bridge offline'}</span>
			</div>
		</aside>

		<div class="workspace-main">
			<header class="titlebar">
				<button class="titlebar-button back-button" onclick={closeApp} aria-label="Back to launcher">
					<span aria-hidden="true">←</span>
					<span>Back</span>
				</button>
				<div class="window-title">
					<span class="window-mark" style={`--accent: ${activeItem.accent}`}>{activeItem.shortName}</span>
					<strong>{activeItem.name}</strong>
				</div>
				<div class="titlebar-actions">
					<span class="window-state"><span class="state-dot"></span> Active</span>
					<button
						class="titlebar-button icon-button"
						onclick={toggleFullscreen}
						aria-label={browserFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
						title={browserFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
					>
						{browserFullscreen ? '↙' : '↗'}
					</button>
					<button class="titlebar-button icon-button close-button" onclick={closeApp} aria-label="Close workspace">×</button>
				</div>
			</header>

			<main class="workspace-body">
				<div class="workspace-heading">
					<p class="eyebrow">Workspace / {activeItem.shortName}</p>
					<h1>{activeItem.name}</h1>
					<p>{activeItem.description}</p>
				</div>

				<Tool />

				{#if error}
					<div class="error" role="alert">{error}</div>
				{/if}
			</main>
		</div>
	</section>
{:else}
	<main class="launcher">
		<header class="launcher-header">
			<div class="brand-lockup">
				<div class="brand-mark">LP</div>
				<div>
					<div class="brand-name">Launchpad</div>
					<div class="brand-subtitle">Personal desktop toolkit</div>
				</div>
			</div>
			<div class="connection-pill" class:offline={!bridgeAvailable}>
				<span class="state-dot"></span>
				{bridgeAvailable ? 'Bridge online' : 'Bridge offline'}
			</div>
		</header>

		<section class="launcher-intro">
			<div>
				<p class="eyebrow">Workspace 01</p>
				<h1>Launchpad</h1>
				<p>Choose a tool to get started.</p>
			</div>
			<strong>{toolkitPlugins.length} tools</strong>
		</section>

		<section aria-labelledby="menu-title">
			<div class="section-heading">
				<h2 id="menu-title">Available tools</h2>
				<span>Click to open</span>
			</div>
			<div class="menu-grid">
				{#each toolkitPlugins as plugin}
					<button class="menu-card" onclick={() => openApp(plugin)} style={`--accent: ${plugin.accent}`}>
						<div class="menu-card-top"><span class="menu-icon">{plugin.shortName}</span><span class="launch-arrow" aria-hidden="true">↗</span></div>
						<div class="menu-card-content"><h3>{plugin.name}</h3><p>{plugin.description}</p></div>
					</button>
				{/each}
			</div>
		</section>

		<footer class="launcher-footer">
			<span>Launchpad v0.1</span>
			<span>Escape closes a workspace</span>
		</footer>
	</main>
{/if}

<style>
	:global(*) { box-sizing: border-box; }
	:global(html), :global(body) { margin: 0; min-width: 320px; min-height: 100%; background: #11111c; color: #f4f1ea; font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
	:global(button) { font: inherit; }
	.launcher, .workspace { min-height: 100vh; }
	.launcher { max-width: 1080px; margin: 0 auto; padding: 1.25rem clamp(1rem, 4vw, 3rem) 1rem; }
	.launcher-header, .brand-lockup, .connection-pill, .launcher-intro, .section-heading, .menu-card-top, .launcher-footer, .titlebar, .titlebar-actions, .window-title { display: flex; align-items: center; }
	.launcher-header, .launcher-intro, .section-heading, .launcher-footer, .titlebar { justify-content: space-between; }
	.brand-lockup { gap: 0.65rem; }
	.brand-mark, .home-mark { display: grid; place-items: center; background: #f4f1ea; color: #171729; font-size: 0.62rem; font-weight: 800; letter-spacing: 0.08em; }
	.brand-mark { width: 2.1rem; height: 2.1rem; border-radius: 8px; }
	.brand-name { font-size: 0.85rem; font-weight: 700; }
	.brand-subtitle, .connection-pill, .launcher-intro > strong, .section-heading span, .launcher-footer, .window-state, .window-title span { color: #9391a0; font-size: 0.7rem; }
	.brand-subtitle { margin-top: 0.15rem; }
	.connection-pill { gap: 0.45rem; padding: 0.45rem 0.65rem; border: 1px solid rgba(72, 214, 143, 0.25); border-radius: 999px; background: rgba(72, 214, 143, 0.08); color: #76e2a6; }
	.connection-pill.offline { border-color: rgba(248, 113, 113, 0.3); background: rgba(248, 113, 113, 0.08); color: #fca5a5; }
	.state-dot { display: inline-block; width: 0.4rem; height: 0.4rem; border-radius: 50%; background: #48d68f; }
	.connection-pill.offline .state-dot, .sidebar-footer.offline .state-dot { background: #f87171; }
	.launcher-intro { margin: 2.75rem 0 2rem; padding-bottom: 1.25rem; border-bottom: 1px solid rgba(255, 255, 255, 0.1); }
	.eyebrow, .sidebar-label { margin: 0 0 0.45rem; color: #a78bfa; font-size: 0.62rem; font-weight: 800; letter-spacing: 0.14em; text-transform: uppercase; }
	.launcher-intro h1 { margin: 0; font-size: clamp(2.3rem, 6vw, 4.5rem); font-weight: 500; letter-spacing: -0.08em; line-height: 0.95; }
	.launcher-intro p:last-child { margin: 0.6rem 0 0; color: #9a98ab; font-size: 0.85rem; }
	.section-heading { margin-bottom: 0.8rem; }
	.section-heading h2 { margin: 0; font-size: 0.95rem; font-weight: 600; }
	.menu-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 0.65rem; }
	.menu-card { display: flex; min-height: 11rem; flex-direction: column; padding: 0.85rem; border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 10px; background: rgba(255, 255, 255, 0.05); color: #f4f1ea; text-align: left; cursor: pointer; transition: background 150ms ease, border-color 150ms ease, transform 150ms ease; }
	.menu-card:hover, .menu-card:focus-visible { border-color: var(--accent); background: rgba(255, 255, 255, 0.09); outline: none; transform: translateY(-0.2rem); }
	.menu-card-top { justify-content: space-between; }
	.menu-icon, .sidebar-icon, .window-mark { display: grid; place-items: center; border-radius: 7px; background: color-mix(in srgb, var(--accent) 18%, transparent); color: var(--accent); font-size: 0.6rem; font-weight: 800; letter-spacing: 0.06em; }
	.menu-icon { width: 2rem; height: 2rem; }
	.launch-arrow { color: var(--accent); font-size: 1rem; }
	.menu-card-content { margin-top: auto; }
	.menu-card h3 { margin: 0 0 0.35rem; font-size: 0.82rem; font-weight: 600; }
	.menu-card p, .workspace-heading p { margin: 0; color: #9997a5; font-size: 0.7rem; line-height: 1.45; }
	.launcher-footer { margin-top: 2rem; padding-top: 0.8rem; border-top: 1px solid rgba(255, 255, 255, 0.1); }
	.workspace { background: #f3f1ec; color: #171729; }
	.sidebar { position: fixed; inset: 0 auto 0 0; z-index: 3; display: flex; width: 12rem; flex-direction: column; padding: 0.85rem 0.65rem; background: #171729; color: #f4f1ea; }
	.workspace-main { min-height: 100vh; margin-left: 12rem; }
	.home-button, .sidebar-item, .titlebar-button { border: 0; background: transparent; cursor: pointer; }
	.home-button { display: flex; gap: 0.55rem; align-items: center; width: 100%; padding: 0.3rem; border-radius: 7px; color: #f4f1ea; font-size: 0.75rem; font-weight: 650; text-align: left; }
	.home-button:hover, .home-button:focus-visible, .sidebar-item:hover, .sidebar-item:focus-visible { background: rgba(255, 255, 255, 0.08); outline: none; }
	.home-mark { width: 1.9rem; height: 1.9rem; border-radius: 6px; }
	.sidebar-rule { height: 1px; margin: 0.9rem 0 0.8rem; background: rgba(255, 255, 255, 0.1); }
	.sidebar-label { margin-left: 0.4rem; color: #777586; }
	.sidebar nav { display: grid; gap: 0.15rem; }
	.sidebar-item { display: flex; gap: 0.55rem; align-items: center; width: 100%; padding: 0.35rem; border: 1px solid transparent; border-radius: 7px; color: #aaa8b6; text-align: left; }
	.sidebar-item.active { border-color: color-mix(in srgb, var(--accent) 45%, transparent); background: color-mix(in srgb, var(--accent) 13%, transparent); color: #f4f1ea; }
	.sidebar-icon { width: 1.8rem; height: 1.8rem; flex: 0 0 auto; }
	.sidebar-item-name { overflow: hidden; font-size: 0.7rem; text-overflow: ellipsis; white-space: nowrap; }
	.sidebar-footer { display: flex; gap: 0.45rem; align-items: center; margin-top: auto; padding: 0.7rem 0.35rem 0; border-top: 1px solid rgba(255, 255, 255, 0.1); color: #777586; font-size: 0.62rem; }
	.titlebar { position: sticky; top: 0; z-index: 2; min-height: 3.3rem; padding: 0.55rem 1.25rem; border-bottom: 1px solid #dedbd4; background: rgba(243, 241, 236, 0.95); backdrop-filter: blur(12px); }
	.titlebar-button { color: #686573; }
	.titlebar-button:hover, .titlebar-button:focus-visible { color: #171729; outline: none; }
	.back-button { display: flex; gap: 0.3rem; align-items: center; font-size: 0.72rem; }
	.back-button span:first-child { font-size: 1rem; }
	.window-title { gap: 0.5rem; }
	.window-title strong { font-size: 0.75rem; }
	.window-mark { width: 1.75rem; height: 1.75rem; }
	.titlebar-actions { gap: 0.5rem; }
	.window-state { display: flex; gap: 0.35rem; align-items: center; }
	.icon-button { width: 1.7rem; height: 1.7rem; font-size: 1rem; }
	.close-button { font-size: 1.25rem; }
	.workspace-body { max-width: 900px; margin: 0 auto; padding: 2.5rem clamp(1rem, 5vw, 3rem); }
	.workspace-heading { padding-bottom: 1.35rem; border-bottom: 1px solid #dedbd4; }
	.workspace-heading .eyebrow { color: #8064d5; }
	.workspace-heading h1 { margin: 0 0 0.4rem; font-size: clamp(2rem, 5vw, 3.5rem); font-weight: 500; letter-spacing: -0.07em; }
	.workspace-heading p:last-child { max-width: 30rem; color: #686573; font-size: 0.8rem; }
	.error { margin-top: 0.75rem; padding: 0.75rem; border: 1px solid #f5b5b5; border-radius: 6px; background: #fff0f0; color: #ad3d3d; font-size: 0.7rem; }
	@media (max-width: 850px) { .menu-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); } }
	@media (max-width: 620px) {
		.menu-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
		.sidebar { width: 4rem; padding-right: 0.45rem; padding-left: 0.45rem; }
		.workspace-main { margin-left: 4rem; }
		.home-button { justify-content: center; }
		.home-button > span:last-child, .sidebar-label, .sidebar-item-name, .sidebar-footer > span:last-child { display: none; }
		.sidebar-item, .sidebar-footer { justify-content: center; }
		.window-state { display: none; }
		.workspace-body { padding-top: 2rem; }
	}
	@media (max-width: 420px) { .menu-grid { grid-template-columns: 1fr; } .menu-card { min-height: 8rem; } .launcher-footer { align-items: flex-start; flex-direction: column; gap: 0.35rem; } .back-button span:last-child { display: none; } }
</style>
