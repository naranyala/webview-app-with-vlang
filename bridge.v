module main

import json
import encoding.base64
import os
import sync
import time
import ttytm.webview

$if linux {
	#pkgconfig gtk+-3.0
	#include <gtk/gtk.h>

	fn C.gtk_window_iconify(window voidptr)
	fn C.gtk_window_maximize(window voidptr)
	fn C.gtk_window_unmaximize(window voidptr)
}

struct BridgeResponse {
	ok    bool
	data  string
	error string
	code  string
}

const max_greet_len = 1000
const max_delta_abs = 1000000

fn bridge_success(data string) string {
	return json.encode(BridgeResponse{
		ok:   true
		data: data
	})
}

fn bridge_failure(message string) string {
	return bridge_failure_code('BackendError', message)
}

fn bridge_failure_code(code string, message string) string {
	return json.encode(BridgeResponse{
		ok:    false
		error: message
		code:  code
	})
}

struct CounterState {
mut:
	count i64
	mutex sync.Mutex
}

fn (mut state CounterState) increment(delta int) i64 {
	state.mutex.lock()
	state.count += delta
	result := state.count
	state.mutex.unlock()
	return result
}

fn (mut state CounterState) reset() i64 {
	state.mutex.lock()
	state.count = 0
	state.mutex.unlock()
	return 0
}

fn register_core_bridge(mut app App) {
	app.window.bind('greet_from_v', greet_from_v)
	app.window.bind('get_time', get_time)
	app.window.bind('get_system_info', get_system_info)
	app.window.bind('get_status', get_status)
	app.window.bind('get_notes', app.get_notes)
	app.window.bind('create_note', app.create_note)
	app.window.bind('update_note', app.update_note)
	app.window.bind('delete_note', app.delete_note)
	app.window.bind('save_pdf', save_pdf)
	app.window.bind('increment', app.increment)
	app.window.bind('reset', app.reset)
	app.window.bind('minimize_window', app.minimize_window)
	app.window.bind('maximize_window', app.maximize_window)
	app.window.bind('restore_window', app.restore_window)
	app.window.bind('close_window', app.close_window)
	app.window.bind('quiz_list', app.quiz_list)
	app.window.bind('quiz_create_collection', app.quiz_create_collection)
	app.window.bind('quiz_update_collection', app.quiz_update_collection)
	app.window.bind('quiz_delete_collection', app.quiz_delete_collection)
	app.window.bind('quiz_create_question', app.quiz_create_question)
	app.window.bind('quiz_update_question', app.quiz_update_question)
	app.window.bind('quiz_delete_question', app.quiz_delete_question)
	app.window.bind('list_volumes', app.list_volumes)
	app.window.bind('start_asset_scan', app.start_asset_scan)
	app.window.bind('get_asset_scan_status', app.get_asset_scan_status)
	app.window.bind('cancel_asset_scan', app.cancel_asset_scan)
	app.window.bind('get_audio_metadata', app.get_audio_metadata)
	app.window.bind('analyze_audio', app.analyze_audio)
	app.window.bind('mir_analyze', app.mir_analyze)
}

fn (mut app App) get_notes(_ &webview.Event) string {
	notes := app.notes.list() or {
		log_bridge_error('get_notes', err.msg())
		return bridge_failure_code('StorageReadFailed', err.msg())
	}
	return bridge_success(json.encode(notes))
}

fn (mut app App) create_note(e &webview.Event) string {
	title := e.get_arg[string](0) or { return bridge_failure_code('InvalidArgument', 'Note title is required') }
	tag := e.get_arg[string](1) or { return bridge_failure_code('InvalidArgument', 'Note tag is required') }
	body := e.get_arg[string](2) or { return bridge_failure_code('InvalidArgument', 'Note body is required') }
	note := app.notes.create(NoteInput{title: title, tag: tag, body: body}) or {
		log_bridge_error('create_note', err.msg())
		return bridge_failure_code('StorageWriteFailed', err.msg())
	}
	return bridge_success(json.encode(note))
}

fn (mut app App) update_note(e &webview.Event) string {
	id := e.get_arg[string](0) or { return bridge_failure_code('InvalidArgument', 'Note id is required') }
	title := e.get_arg[string](1) or { return bridge_failure_code('InvalidArgument', 'Note title is required') }
	tag := e.get_arg[string](2) or { return bridge_failure_code('InvalidArgument', 'Note tag is required') }
	body := e.get_arg[string](3) or { return bridge_failure_code('InvalidArgument', 'Note body is required') }
	note := app.notes.update(UpdateNoteInput{id: id, title: title, tag: tag, body: body}) or {
		log_bridge_error('update_note', err.msg())
		return bridge_failure_code('StorageWriteFailed', err.msg())
	}
	return bridge_success(json.encode(note))
}

fn (mut app App) delete_note(e &webview.Event) string {
	id := e.get_arg[string](0) or { return bridge_failure_code('InvalidArgument', 'Note id is required') }
	app.notes.delete(id) or {
		log_bridge_error('delete_note', err.msg())
		return bridge_failure_code('StorageWriteFailed', err.msg())
	}
	return bridge_success('Note deleted')
}

const max_pdf_filename_len = 100
const max_pdf_base64_len = 22_400_000
const max_pdf_bytes = 16 * 1024 * 1024

fn valid_pdf_filename(name string) bool {
	if name.len < 5 || name.len > max_pdf_filename_len || !name.ends_with('.pdf') {
		return false
	}
	for index, character in name.bytes() {
		if index == 0 && !character.is_alnum() {
			return false
		}
		if !character.is_alnum() && character != `.` && character != `_` && character != `-` {
			return false
		}
	}
	return true
}

fn documents_dir() !string {
	home := if os.user_os() == 'windows' { os.getenv('USERPROFILE') } else { os.getenv('HOME') }
	if home.len == 0 {
		return error('Documents folder is unavailable')
	}
	return os.join_path(home, 'Documents')
}

fn save_pdf(e &webview.Event) string {
	filename := e.get_arg[string](0) or { return bridge_failure_code('InvalidArgument', 'PDF filename is required') }
	content := e.get_arg[string](1) or { return bridge_failure_code('InvalidArgument', 'PDF content is required') }
	if !valid_pdf_filename(filename) {
		return bridge_failure_code('InvalidPdfName', 'PDF filename is invalid')
	}
	if content.len == 0 || content.len > max_pdf_base64_len {
		return bridge_failure_code('PdfTooLarge', 'PDF is too large')
	}
	decoded := base64.decode(content)
	if decoded.len == 0 || decoded.len > max_pdf_bytes {
		return bridge_failure_code('PdfDecodeFailed', 'PDF data could not be decoded')
	}
	dir := documents_dir() or { return bridge_failure_code('DocumentsUnavailable', err.msg()) }
	os.mkdir_all(dir) or { return bridge_failure_code('DocumentsUnavailable', err.msg()) }
	mut path := os.join_path(dir, filename)
	mut suffix := 2
	for os.exists(path) && suffix <= 1000 {
		stem := filename[..filename.len - 4]
		path = os.join_path(dir, '${stem}-${suffix}.pdf')
		suffix++
	}
	if os.exists(path) {
		return bridge_failure_code('PdfWriteFailed', 'Could not choose a PDF filename')
	}
	temporary_path := '${path}.tmp'
	os.write_file(temporary_path, decoded.bytestr()) or {
		return bridge_failure_code('PdfWriteFailed', 'PDF could not be written')
	}
	os.rename(temporary_path, path) or {
		os.rm(temporary_path) or {}
		return bridge_failure_code('PdfWriteFailed', 'PDF could not be written')
	}
	return bridge_success(json.encode({'path': path}))
}

fn (mut app App) quiz_list(_ &webview.Event) string {
	collections := app.quiz.list() or {
		log_bridge_error('quiz_list', err.msg())
		return bridge_failure(err.msg())
	}
	return bridge_success(json.encode(collections))
}

fn (mut app App) quiz_create_collection(e &webview.Event) string {
	payload := e.get_arg[string](0) or {
		return bridge_failure('Quiz collection payload is required')
	}
	collection := app.quiz.create_collection(payload) or {
		log_bridge_error('quiz_create_collection', err.msg())
		return bridge_failure(err.msg())
	}
	return bridge_success(json.encode(collection))
}

fn (mut app App) quiz_update_collection(e &webview.Event) string {
	payload := e.get_arg[string](0) or {
		return bridge_failure('Quiz collection payload is required')
	}
	collection := app.quiz.update_collection(payload) or {
		log_bridge_error('quiz_update_collection', err.msg())
		return bridge_failure(err.msg())
	}
	return bridge_success(json.encode(collection))
}

fn (mut app App) quiz_delete_collection(e &webview.Event) string {
	id := e.get_arg[string](0) or { return bridge_failure('Quiz collection id is required') }
	app.quiz.delete_collection(id) or {
		log_bridge_error('quiz_delete_collection', err.msg())
		return bridge_failure(err.msg())
	}
	return bridge_success('Quiz collection deleted')
}

fn (mut app App) quiz_create_question(e &webview.Event) string {
	payload := e.get_arg[string](0) or {
		return bridge_failure('Quiz question payload is required')
	}
	collection := app.quiz.create_question(payload) or {
		log_bridge_error('quiz_create_question', err.msg())
		return bridge_failure(err.msg())
	}
	return bridge_success(json.encode(collection))
}

fn (mut app App) quiz_update_question(e &webview.Event) string {
	payload := e.get_arg[string](0) or {
		return bridge_failure('Quiz question payload is required')
	}
	collection := app.quiz.update_question(payload) or {
		log_bridge_error('quiz_update_question', err.msg())
		return bridge_failure(err.msg())
	}
	return bridge_success(json.encode(collection))
}

fn (mut app App) quiz_delete_question(e &webview.Event) string {
	payload := e.get_arg[string](0) or {
		return bridge_failure('Quiz question payload is required')
	}
	collection := app.quiz.delete_question(payload) or {
		log_bridge_error('quiz_delete_question', err.msg())
		return bridge_failure(err.msg())
	}
	return bridge_success(json.encode(collection))
}

fn greet_from_v(e &webview.Event) string {
	msg := e.get_arg[string](0) or {
		log_bridge_error('greet_from_v', 'missing message argument')
		return missing_message_error()
	}
	if validated := validate_greet_message(msg) {
		timestamp := time.now().format()
		response := 'V says: "${validated}" received at ${timestamp}'
		return bridge_success(response)
	} else {
		log_bridge_error('greet_from_v', err.msg())
		return bridge_failure(err.msg())
	}
}

fn validate_greet_message(msg string) !string {
	if msg.len == 0 {
		return error('A message is required')
	}
	if msg.len > max_greet_len {
		return error('Message must be 1000 characters or fewer')
	}
	return msg
}

fn log_bridge_error(context string, message string) {
	eprintln('[bridge:error] ${context}: ${message}')
}

fn missing_message_error() string {
	return bridge_failure('A message is required')
}

fn get_time(_ &webview.Event) string {
	return bridge_success(time.now().format())
}

fn get_system_info(_ &webview.Event) string {
	return bridge_success(system_name())
}

fn get_status(_ &webview.Event) string {
	return bridge_success('V backend online (${system_name()})')
}

fn (mut app App) increment(e &webview.Event) string {
	delta := e.get_arg[int](0) or {
		log_bridge_error('increment', 'invalid integer delta argument')
		return invalid_delta_error()
	}
	if valid := validate_delta(delta) {
		return bridge_success(app.counter.increment(valid).str())
	} else {
		log_bridge_error('increment', err.msg())
		return bridge_failure(err.msg())
	}
}

fn validate_delta(delta int) !int {
	if delta < -max_delta_abs || delta > max_delta_abs {
		return error('Delta must be between -1000000 and 1000000')
	}
	return delta
}

fn invalid_delta_error() string {
	return bridge_failure('An integer delta is required')
}

fn (mut app App) reset(_ &webview.Event) string {
	return bridge_success(app.counter.reset().str())
}

fn system_name() string {
	$if linux {
		return 'Linux'
	} $else $if macos {
		return 'macOS'
	} $else $if windows {
		return 'Windows'
	} $else {
		return os.user_os()
	}
}

fn native_window_available(app &App) bool {
	return app.window.get_window() != unsafe { nil }
}

fn window_unavailable_error(action string) string {
	log_bridge_error(action, 'native window handle is unavailable')
	return bridge_failure('Native window is unavailable')
}

fn unsupported_window_action(action string) string {
	message := 'Window ${action} is not implemented on this platform'
	log_bridge_error(action, message)
	return bridge_failure(message)
}

fn (app &App) minimize_window(_ &webview.Event) string {
	$if linux {
		if !native_window_available(app) {
			return window_unavailable_error('minimize_window')
		}
		window := app.window.get_window()
		app.window.dispatch(fn [window] () {
			C.gtk_window_iconify(window)
		})
		return bridge_success('Window minimized')
	} $else {
		return unsupported_window_action('minimize')
	}
}

fn (app &App) maximize_window(_ &webview.Event) string {
	$if linux {
		if !native_window_available(app) {
			return window_unavailable_error('maximize_window')
		}
		window := app.window.get_window()
		app.window.dispatch(fn [window] () {
			C.gtk_window_maximize(window)
		})
		return bridge_success('Window maximized')
	} $else {
		return unsupported_window_action('maximize')
	}
}

fn (app &App) restore_window(_ &webview.Event) string {
	$if linux {
		if !native_window_available(app) {
			return window_unavailable_error('restore_window')
		}
		window := app.window.get_window()
		app.window.dispatch(fn [window] () {
			C.gtk_window_unmaximize(window)
		})
		return bridge_success('Window restored')
	} $else {
		return unsupported_window_action('restore')
	}
}

fn (app &App) close_window(_ &webview.Event) string {
	app.window.terminate()
	return bridge_success('Window closed')
}
