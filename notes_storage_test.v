module main

import os
import time

fn test_note_store_crud_and_reload() {
	path := os.join_path(os.temp_dir(), 'webview-notes-test-${time.now().unix()}.json')
	mut store := NoteStore{path: path}
	created := store.create(NoteInput{
		title: 'First note'
		tag:   'Research'
		body:  'Question:\nWhat?\n\nAnswer:\nThis.'
	}) or {
		assert false, err.msg()
		return
	}
	assert created.id.starts_with('note-')
	assert store.list()!.len == 1

	updated := store.update(UpdateNoteInput{
		id:    created.id
		title: 'Updated note'
		tag:   'Draft'
		body:  'Question:\nWhy?\n\nAnswer:\nBecause.'
	}) or {
		assert false, err.msg()
		return
	}
	assert updated.title == 'Updated note'

	mut reloaded := init_note_store(path) or {
		assert false, err.msg()
		return
	}
	assert reloaded.list()!.len == 1
	assert reloaded.list()![0].body.contains('Because')
	reloaded.delete(created.id) or {
		assert false, err.msg()
		return
	}
	assert reloaded.list()!.len == 0
	reloaded.persist() or {}
	reloaded_path := reloaded.path
	reloaded = NoteStore{}
	os.rm(reloaded_path) or {}
}

fn test_note_store_rejects_invalid_input() {
	mut store := NoteStore{path: os.join_path(os.temp_dir(), 'webview-invalid-notes.json')}
	if _ := store.create(NoteInput{title: '', tag: '', body: ''}) {
		assert false, 'empty note title should fail validation'
	} else {
		assert err.msg() == 'Note title is required'
	}
}
