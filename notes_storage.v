module main

import json
import os
import sync
import time

const notes_schema_version = 1
const max_notes = 10000
const max_note_title_len = 200
const max_note_id_len = 200
const max_note_tag_len = 64
const max_note_body_len = 512 * 1024

struct Note {
mut:
	id      string
	title   string
	tag     string
	updated string
	body    string
}

struct NotesDatabase {
	version int
	counter u64
	notes   []Note
}

struct NoteInput {
	title string
	tag   string
	body  string
}

struct UpdateNoteInput {
	id    string
	title string
	tag   string
	body  string
}

struct NoteStore {
mut:
	path  string
	notes []Note
	counter u64
	mutex sync.Mutex
}

fn new_note_store() !NoteStore {
	mut base_dir := os.getenv('WEBVIEW_APP_DATA_DIR')
	if base_dir.len == 0 {
		base_dir = os.config_dir()!
	}
	storage_dir := os.join_path(base_dir, 'webview-app')
	os.mkdir_all(storage_dir)!
	return init_note_store(os.join_path(storage_dir, 'notes.json'))
}

fn init_note_store(path string) !NoteStore {
	mut store := NoteStore{path: path}
	if !os.exists(path) {
		return store
	}
	raw := os.read_file(path) or { return error('Note storage could not be read') }
	database := json.decode(NotesDatabase, raw) or {
		return error('Note storage is corrupt')
	}
	if database.version != notes_schema_version {
		return error('Note storage uses an unsupported schema')
	}
	if database.notes.len > max_notes {
		return error('Note storage contains too many notes')
	}
	store.counter = database.counter
	for note in database.notes {
		store.notes << validate_note(note)!
	}
	return store
}

fn validate_note(note Note) !Note {
	mut normalized := note
	normalized.id = normalized.id.trim_space()
	normalized.title = normalized.title.trim_space()
	normalized.tag = normalized.tag.trim_space()
	if normalized.id.len == 0 {
		return error('Note id is required')
	}
	if normalized.id.len > max_note_id_len {
		return error('Note id is too long')
	}
	if normalized.title.len == 0 {
		return error('Note title is required')
	}
	if normalized.title.len > max_note_title_len {
		return error('Note title is too long')
	}
	if normalized.tag.len > max_note_tag_len {
		return error('Note tag is too long')
	}
	if normalized.body.len > max_note_body_len {
		return error('Note body is too long')
	}
	return normalized
}

fn validate_note_input(input NoteInput) ! {
	if input.title.trim_space().len == 0 {
		return error('Note title is required')
	}
	if input.title.len > max_note_title_len {
		return error('Note title is too long')
	}
	if input.tag.len > max_note_tag_len {
		return error('Note tag is too long')
	}
	if input.body.len > max_note_body_len {
		return error('Note body is too long')
	}
}

fn (mut store NoteStore) persist() ! {
	database := NotesDatabase{
		version: notes_schema_version
		counter: store.counter
		notes:   store.notes
	}
	temporary_path := '${store.path}.tmp'
	os.write_file(temporary_path, json.encode(database)) or { return err }
	os.rename(temporary_path, store.path) or {
		os.rm(temporary_path) or {}
		return err
	}
}

fn (mut store NoteStore) list() ![]Note {
	store.mutex.lock()
	defer { store.mutex.unlock() }
	return store.notes.clone()
}

fn (mut store NoteStore) create(input NoteInput) !Note {
	validate_note_input(input)!
	store.mutex.lock()
	defer { store.mutex.unlock() }
	if store.notes.len >= max_notes {
		return error('Note storage limit reached')
	}
	previous_counter := store.counter
	store.counter++
	note := Note{
		id:      'note-${time.now().unix()}-${previous_counter}'
		title:   input.title.trim_space()
		tag:     if input.tag.trim_space().len > 0 { input.tag.trim_space() } else { 'Draft' }
		updated: 'Just now'
		body:    input.body
	}
	store.notes << note
	store.persist() or {
		store.notes.delete_last()
		store.counter = previous_counter
		return err
	}
	return note
}

fn (mut store NoteStore) update(input UpdateNoteInput) !Note {
	validate_note_input(NoteInput{ title: input.title, tag: input.tag, body: input.body })!
	if input.id.trim_space().len == 0 {
		return error('Note id is required')
	}
	store.mutex.lock()
	defer { store.mutex.unlock() }
	index := store.note_index(input.id)
	if index < 0 {
		return error('Note not found')
	}
	previous := store.notes[index]
	replacement := Note{
		id:      previous.id
		title:   input.title.trim_space()
		tag:     if input.tag.trim_space().len > 0 { input.tag.trim_space() } else { 'Draft' }
		updated: 'Just now'
		body:    input.body
	}
	store.notes[index] = replacement
	store.persist() or {
		store.notes[index] = previous
		return err
	}
	return replacement
}

fn (mut store NoteStore) delete(id string) ! {
	if id.trim_space().len == 0 {
		return error('Note id is required')
	}
	store.mutex.lock()
	defer { store.mutex.unlock() }
	index := store.note_index(id)
	if index < 0 {
		return error('Note not found')
	}
	removed := store.notes[index]
	store.notes.delete(index)
	store.persist() or {
		store.notes.insert(index, removed)
		return err
	}
}

fn (store NoteStore) note_index(id string) int {
	for index, note in store.notes {
		if note.id == id {
			return index
		}
	}
	return -1
}
