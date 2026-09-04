<script lang="ts">
	import { exportChainNotePdf } from '../../lib/chain-notes';

	type ChainNote = { id: string; title: string; tag: string; updated: string; body: string };
	const chainNotes: ChainNote[] = [
		{ id: 'toolkit-direction', title: 'Toolkit direction', tag: 'Planning', updated: 'Today, 09:42', body: 'Build a focused collection of small desktop tools. Each tool should feel independent while sharing one calm launcher and one reliable native bridge.' },
		{ id: 'disk-scanner-idea', title: 'Disk scanner idea', tag: 'Product', updated: 'Yesterday', body: 'Start with a safe directory scan, show progress, and make large folders easy to understand at a glance.' },
		{ id: 'audio-notes', title: 'Audio notes', tag: 'Research', updated: 'Mon, 14:10', body: 'Local playback first. Keep system-wide audio routing as a later milestone after the equalizer pipeline is stable.' }
	];

	let selectedNoteId = $state(chainNotes[0].id);
	let noteTitle = $state(chainNotes[0].title);
	let noteBody = $state(chainNotes[0].body);
	let exportStatus = $state('');
	let selectedNote = $derived(chainNotes.find((note) => note.id === selectedNoteId));

	function selectNote(note: ChainNote) {
		selectedNoteId = note.id;
		noteTitle = note.title;
		noteBody = note.body;
		exportStatus = '';
	}

	function exportNoteAsPdf() {
		try {
			exportChainNotePdf(noteTitle, noteBody, selectedNote?.tag || 'Note');
			exportStatus = 'PDF exported';
		} catch {
			exportStatus = 'Export failed';
		}
	}
</script>

<div class="notes-layout">
	<aside class="notes-list card" aria-label="Notes list">
		<div class="notes-list-header"><div class="card-label">Your chain</div><button class="small-action" disabled title="Note creation backend pending">+ New</button></div>
		{#each chainNotes as note}
			<button class="note-list-item" class:chosen={selectedNoteId === note.id} onclick={() => selectNote(note)}>
				<strong>{note.title}</strong><span>{note.tag} / {note.updated}</span>
			</button>
		{/each}
	</aside>

	<section class="note-editor card">
		<div class="editor-toolbar"><span class="mock-tag">Local draft</span><button class="export-button" onclick={exportNoteAsPdf}>Export PDF</button></div>
		<input class="note-title-input" bind:value={noteTitle} aria-label="Note title" />
		<div class="note-meta"><span>{selectedNote?.tag || 'Note'}</span><span>Last edited {selectedNote?.updated || 'just now'}</span></div>
		<textarea bind:value={noteBody} aria-label="Note body" spellcheck="true"></textarea>
		<div class="editor-footer"><span>{noteBody.length} characters</span><span>{exportStatus || 'Edits stay in this session'}</span></div>
	</section>
</div>

<style>
	.card { border-radius: 12px; }
	.notes-layout { display: grid; grid-template-columns: 13rem 1fr; gap: 0.75rem; margin-top: 1.1rem; }
	.notes-list, .note-editor { padding: 1rem; background: #ebe8e1; }
	.notes-list { align-self: start; }
	.notes-list-header, .editor-toolbar, .note-meta, .editor-footer { display: flex; align-items: center; justify-content: space-between; }
	.card-label { margin: 0 0 0.45rem; color: #8064d5; font-size: 0.62rem; font-weight: 800; letter-spacing: 0.14em; text-transform: uppercase; }
	.notes-list-header .card-label { margin: 0; }
	.small-action, .export-button { padding: 0.35rem 0.5rem; border-radius: 5px; font-size: 0.62rem; }
	.small-action { border: 1px solid #cbc7bf; background: transparent; color: #686573; cursor: not-allowed; opacity: 0.55; }
	.export-button { border: 1px solid #c79722; background: #f5ca5d; color: #503b0b; font-weight: 750; cursor: pointer; }
	.export-button:hover, .export-button:focus-visible { background: #f8d77f; outline: none; }
	.note-list-item { display: block; width: 100%; margin-top: 0.4rem; padding: 0.65rem; border: 1px solid transparent; border-radius: 6px; background: transparent; color: #292735; text-align: left; cursor: pointer; }
	.note-list-item:hover, .note-list-item:focus-visible { background: #e2ded6; outline: none; }
	.note-list-item.chosen { border-color: #e0b74f; background: #f7e7b7; }
	.note-list-item strong, .note-list-item span { display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
	.note-list-item strong { font-size: 0.7rem; font-weight: 650; }
	.note-list-item span { margin-top: 0.25rem; color: #85818d; font-size: 0.58rem; }
	.editor-toolbar { padding-bottom: 0.8rem; border-bottom: 1px solid #d8d3ca; }
	.mock-tag { display: inline-block; width: fit-content; padding: 0.25rem 0.4rem; border-radius: 4px; background: #ddd8ef; color: #6d5a9e; font-size: 0.58rem; font-weight: 700; }
	.note-title-input, .note-editor textarea { width: 100%; border: 0; background: transparent; color: #292735; font: inherit; }
	.note-title-input { margin-top: 1.2rem; font-size: 1.5rem; font-weight: 600; letter-spacing: -0.05em; outline: none; }
	.note-meta, .editor-footer { justify-content: start; gap: 0.75rem; color: #85818d; font-size: 0.6rem; }
	.note-meta { margin-top: 0.35rem; }
	.note-meta span:first-child { color: #896b20; font-weight: 700; }
	.note-editor textarea { min-height: 15rem; margin-top: 1.25rem; resize: vertical; font-size: 0.85rem; line-height: 1.7; outline: none; }
	.editor-footer { justify-content: space-between; padding-top: 0.7rem; border-top: 1px solid #d8d3ca; }
	@media (max-width: 620px) { .notes-layout { grid-template-columns: 1fr; } }
</style>
