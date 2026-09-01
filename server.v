module main

import os
import time
import net.http
import net.http.mime
import net.urllib

fn serve_ui() {
	mut server := &http.Server{
		handler:    StaticHttpHandler{}
		addr:       production_server
		worker_num: 2
	}
	server.listen_and_serve()
}

fn ui_is_ready() bool {
	_ := http.get(production_url) or { return false }
	return true
}

fn wait_for_ui() bool {
	for _ in 0 .. 50 {
		if ui_is_ready() {
			return true
		}
		time.sleep(20 * time.millisecond)
	}
	return false
}

struct StaticHttpHandler {}

fn (mut h StaticHttpHandler) handle(req http.Request) http.Response {
	mut res := http.new_response(body: '')
	url := urllib.path_unescape(req.url) or {
		res.set_status(.bad_request)
		res.body = 'Bad Request'
		return res
	}
	relative_path := url.all_before('?').trim_left('/').trim_right('/')

	// Reject traversal before resolving the requested path, including encoded '..'.
	for segment in relative_path.split('/') {
		if segment == '..' {
			res.set_status(.forbidden)
			res.body = 'Forbidden'
			return res
		}
	}

	root_path := os.norm_path(os.real_path(ui_build_path))
	requested_path := if relative_path == '' { 'index.html' } else { relative_path }
	file_path := os.norm_path(os.real_path(os.join_path(root_path, requested_path)))
	root_prefix := '${root_path}${os.path_separator}'
	if file_path != root_path && !file_path.starts_with(root_prefix) {
		res.set_status(.forbidden)
		res.body = 'Forbidden'
		return res
	}

	if !os.exists(file_path) {
		res.set_status(.not_found)
		res.body = 'Not Found'
		return res
	}

	ext := os.file_ext(file_path).all_after_first('.')
	mt := mime.get_mime_type(ext)
	content_type := mime.get_content_type(mt)

	body := os.read_file(file_path) or {
		res.set_status(.not_found)
		'Not Found'
	}
	res.body = body
	res.header.add(.content_type, content_type)
	return res
}
