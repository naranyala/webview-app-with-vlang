module main

import time
import ttytm.webview
import json

struct BridgeResponse {
	ok    bool
	data  string
	error string
}

fn bridge_success(data string) string {
	return json.encode(BridgeResponse{
		ok:   true
		data: data
	})
}

fn bridge_failure(message string) string {
	return json.encode(BridgeResponse{
		ok:    false
		error: message
	})
}

fn register_core_bridge(mut app App) {
	app.window.bind('greet_from_v', greet_from_v)
	app.window.bind('get_time', get_time)
}

fn greet_from_v(e &webview.Event) string {
	msg := e.get_arg[string](0) or { return bridge_failure('A message is required') }
	if msg.len > 1000 {
		return bridge_failure('Message must be 1000 characters or fewer')
	}
	println('[V Backend] Received from JS: ${msg}')
	return bridge_success('V says: "${msg}" received at ${time.now().format()}')
}

fn get_time(_ &webview.Event) string {
	return bridge_success(time.now().format())
}
