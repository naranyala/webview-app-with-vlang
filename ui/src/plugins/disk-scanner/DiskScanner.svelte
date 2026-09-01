<script lang="ts">
	const diskRows = [
		{ name: 'Applications', size: '18.4 GB', percent: 82, color: '#38bdf8' },
		{ name: 'Users', size: '42.1 GB', percent: 64, color: '#818cf8' },
		{ name: 'System', size: '11.8 GB', percent: 38, color: '#a78bfa' },
		{ name: 'Library', size: '6.3 GB', percent: 24, color: '#c084fc' }
	];
</script>

<div class="tool-toolbar">
	<div>
		<label for="drive-select">Scan location</label>
		<select id="drive-select">
			<option>System Drive (C:)</option>
			<option>External Drive (E:)</option>
		</select>
	</div>
	<button class="tool-button" disabled title="Filesystem backend pending">Scan drive</button>
</div>

<div class="disk-summary">
	<section class="card disk-total-card">
		<div class="card-label">Storage used</div>
		<strong class="disk-total">78.6 <small>GB</small></strong>
		<div class="storage-track"><span></span></div>
		<div class="storage-meta"><span>78.6 GB used</span><span>128 GB total</span></div>
	</section>
	<section class="card disk-stat-card">
		<div class="card-label">Last scan</div>
		<strong>Never</strong>
		<span class="pending-tag">Backend pending</span>
	</section>
</div>

<section class="card folder-card">
	<div class="card-header-row"><div><div class="card-label">Largest locations</div><h2>Folder overview</h2></div><span class="mock-tag">Mock data</span></div>
	<div class="folder-list">
		{#each diskRows as row}
			<div class="folder-row">
				<div class="folder-name"><span class="folder-dot" style={`--bar-color: ${row.color}`}></span><strong>{row.name}</strong></div>
				<div class="folder-bar"><span style={`width: ${row.percent}%; --bar-color: ${row.color}`}></span></div>
				<span class="folder-size">{row.size}</span>
			</div>
		{/each}
	</div>
</section>

<style>
	.tool-toolbar { display: flex; align-items: end; justify-content: space-between; gap: 1rem; margin-top: 1.1rem; padding: 0.7rem; border: 1px solid #dedbd4; border-radius: 8px; background: #ebe8e1; }
	.tool-toolbar label { display: block; margin-bottom: 0.3rem; color: #686573; font-size: 0.65rem; }
	.tool-toolbar select { min-width: 13rem; padding: 0.45rem 0.6rem; border: 1px solid #cbc7bf; border-radius: 5px; background: #f8f7f4; color: #292735; font-size: 0.7rem; }
	.tool-button { padding: 0.55rem 0.8rem; border: 0; border-radius: 6px; background: #b7a5e8; color: #2d2050; font-size: 0.7rem; font-weight: 700; cursor: not-allowed; opacity: 0.55; }
	.disk-summary { display: grid; grid-template-columns: 1.4fr 1fr; gap: 0.75rem; margin-top: 0.75rem; }
	.card { border-radius: 12px; }
	.disk-total-card, .disk-stat-card, .folder-card { padding: 1rem; background: #ebe8e1; }
	.disk-total-card { background: #201638; color: #f4f1ea; }
	.card-label { margin: 0 0 0.45rem; color: #8064d5; font-size: 0.62rem; font-weight: 800; letter-spacing: 0.14em; text-transform: uppercase; }
	.disk-total-card .card-label { color: #c4b5fd; }
	.disk-total { display: block; margin: 0.65rem 0 1rem; font-size: 2.2rem; font-weight: 500; letter-spacing: -0.08em; }
	.disk-total small { color: #c2bbd2; font-size: 0.8rem; letter-spacing: 0; }
	.storage-track, .folder-bar { overflow: hidden; border-radius: 999px; background: rgba(255, 255, 255, 0.13); }
	.storage-track { height: 0.4rem; }
	.storage-track span { display: block; width: 61.4%; height: 100%; border-radius: inherit; background: #a78bfa; }
	.storage-meta { display: flex; justify-content: space-between; margin-top: 0.55rem; color: #aaa0be; font-size: 0.62rem; }
	.disk-stat-card { display: flex; flex-direction: column; }
	.disk-stat-card strong { margin-top: auto; font-size: 1.4rem; font-weight: 500; letter-spacing: -0.05em; }
	.pending-tag, .mock-tag { display: inline-block; width: fit-content; padding: 0.25rem 0.4rem; border-radius: 4px; background: #ddd8ef; color: #6d5a9e; font-size: 0.58rem; font-weight: 700; }
	.disk-stat-card .pending-tag { margin-top: 0.7rem; }
	.folder-card { margin-top: 0.75rem; }
	.card-header-row { display: flex; align-items: start; justify-content: space-between; gap: 1rem; }
	.card-header-row .card-label { margin-bottom: 0.25rem; }
	.card-header-row h2 { margin: 0; font-size: 1rem; font-weight: 600; letter-spacing: -0.03em; }
	.folder-list { display: grid; gap: 0.8rem; margin-top: 1.2rem; }
	.folder-row { display: grid; grid-template-columns: 7rem 1fr 4rem; gap: 0.7rem; align-items: center; }
	.folder-name { display: flex; gap: 0.45rem; align-items: center; min-width: 0; }
	.folder-name strong, .folder-size { font-size: 0.68rem; }
	.folder-name strong { overflow: hidden; font-weight: 600; text-overflow: ellipsis; white-space: nowrap; }
	.folder-dot { width: 0.45rem; height: 0.45rem; flex: 0 0 auto; border-radius: 50%; background: var(--bar-color); }
	.folder-bar { height: 0.3rem; }
	.folder-bar span { display: block; height: 100%; border-radius: inherit; background: var(--bar-color); }
	.folder-size { color: #686573; text-align: right; }
	@media (max-width: 620px) { .disk-summary { grid-template-columns: 1fr; } .folder-row { grid-template-columns: 6rem 1fr 3.5rem; } }
	@media (max-width: 420px) { .folder-row { grid-template-columns: 1fr 3.5rem; } .folder-bar { grid-column: 1 / -1; grid-row: 2; } }
</style>
