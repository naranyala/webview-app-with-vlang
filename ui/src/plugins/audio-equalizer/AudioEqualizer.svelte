<script lang="ts">
	const equalizerBands = [
		{ frequency: '60', level: 62 }, { frequency: '150', level: 44 }, { frequency: '400', level: 56 },
		{ frequency: '1k', level: 68 }, { frequency: '2.4k', level: 51 }, { frequency: '6k', level: 72 }, { frequency: '15k', level: 60 }
	];
	const equalizerPresets = ['Flat', 'Vocal', 'Bass boost', 'Electronic'];
</script>

<div class="equalizer-layout">
	<section class="card player-card">
		<div class="player-art">EQ</div>
		<div class="player-copy"><div class="card-label">Now playing</div><h2>No track selected</h2><p>Audio engine connection pending</p></div>
		<button class="play-button" disabled aria-label="Play track">▶</button>
	</section>
	<section class="card preset-card">
		<div class="card-header-row"><div class="card-label">Presets</div><span class="mock-tag">Mock</span></div>
		<div class="preset-list">
			{#each equalizerPresets as preset, index}
				<button class:chosen={index === 0} disabled={index !== 0}>{preset}<span>{index === 0 ? 'Active' : 'Soon'}</span></button>
			{/each}
		</div>
	</section>
</div>

<section class="card equalizer-card">
	<div class="card-header-row"><div><div class="card-label">7-band equalizer</div><h2>Shape your sound</h2></div><span class="pending-tag">Audio backend pending</span></div>
	<div class="equalizer-bands">
		{#each equalizerBands as band}
			<div class="band"><div class="band-value">+{Math.round((band.level - 50) / 5)} dB</div><div class="band-track"><span style={`height: ${band.level}%;`}></span></div><small>{band.frequency}</small></div>
		{/each}
	</div>
	<div class="equalizer-footer"><span>Preamp</span><input type="range" min="0" max="100" value="50" disabled aria-label="Preamp" /><span>0 dB</span></div>
</section>

<style>
	.equalizer-layout { display: grid; grid-template-columns: 1.4fr 1fr; gap: 0.75rem; margin-top: 1.1rem; }
	.card { border-radius: 12px; }
	.player-card, .preset-card, .equalizer-card { padding: 1rem; background: #ebe8e1; }
	.player-card { display: flex; gap: 0.8rem; align-items: center; min-height: 7.2rem; background: #271737; color: #f4f1ea; }
	.player-art { display: grid; width: 4.2rem; height: 4.2rem; flex: 0 0 auto; place-items: center; border-radius: 8px; background: linear-gradient(135deg, #f472b6, #8b5cf6); color: #fff; font-size: 0.8rem; font-weight: 800; letter-spacing: 0.08em; }
	.player-copy { min-width: 0; flex: 1; }
	.card-label { margin: 0 0 0.45rem; color: #8064d5; font-size: 0.62rem; font-weight: 800; letter-spacing: 0.14em; text-transform: uppercase; }
	.player-copy .card-label { color: #f9a8d4; }
	.player-copy h2 { overflow: hidden; margin: 0 0 0.25rem; font-size: 0.95rem; font-weight: 600; text-overflow: ellipsis; white-space: nowrap; }
	.player-copy p { margin: 0; color: #c5b5c9; font-size: 0.65rem; }
	.play-button { width: 2rem; height: 2rem; flex: 0 0 auto; border: 0; border-radius: 6px; background: #b7a5e8; color: #2d2050; cursor: not-allowed; opacity: 0.55; }
	.preset-card { min-height: 7.2rem; }
	.card-header-row { display: flex; align-items: start; justify-content: space-between; gap: 1rem; }
	.mock-tag, .pending-tag { display: inline-block; width: fit-content; padding: 0.25rem 0.4rem; border-radius: 4px; background: #ddd8ef; color: #6d5a9e; font-size: 0.58rem; font-weight: 700; }
	.preset-list { display: flex; flex-wrap: wrap; gap: 0.35rem; margin-top: 0.7rem; }
	.preset-list button { padding: 0.4rem 0.5rem; border: 1px solid #d1cdc5; border-radius: 5px; background: transparent; color: #686573; font-size: 0.62rem; }
	.preset-list button.chosen { border-color: #c5a8e9; background: #e4d9f2; color: #5a3a80; }
	.preset-list button:not(.chosen) { cursor: not-allowed; opacity: 0.55; }
	.preset-list button span { display: block; margin-top: 0.15rem; font-size: 0.5rem; }
	.equalizer-card { margin-top: 0.75rem; }
	.equalizer-card h2 { margin: 0; font-size: 1rem; font-weight: 600; letter-spacing: -0.03em; }
	.equalizer-bands { display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); gap: 0.65rem; align-items: end; height: 10rem; margin-top: 1.2rem; padding: 0 0.4rem; border-bottom: 1px solid #d1cdc5; }
	.band { display: flex; height: 100%; flex-direction: column; align-items: center; justify-content: end; gap: 0.4rem; }
	.band-value { color: #9363b8; font-size: 0.55rem; white-space: nowrap; }
	.band-track { position: relative; width: 0.45rem; height: 7rem; border-radius: 999px; background: #d9d3de; }
	.band-track span { position: absolute; bottom: 0; width: 100%; border-radius: inherit; background: linear-gradient(to top, #8b5cf6, #f472b6); }
	.band small { color: #686573; font-size: 0.55rem; }
	.equalizer-footer { display: flex; gap: 0.5rem; align-items: center; margin-top: 0.8rem; color: #686573; font-size: 0.62rem; }
	.equalizer-footer input { width: 8rem; accent-color: #8b5cf6; }
	@media (max-width: 620px) { .equalizer-layout { grid-template-columns: 1fr; } }
</style>
