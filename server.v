module main

import os
import time
import net.http
import net.http.mime
import net.urllib

fn serve_frontend() {
	mut server := &http.Server{
		handler:    StaticHttpHandler{}
		addr:       production_server
		worker_num: 2
	}
	server.listen_and_serve()
}

fn frontend_is_ready() bool {
	_ := http.get(production_url) or { return false }
	return true
}

fn wait_for_frontend() bool {
	for _ in 0 .. 50 {
		if frontend_is_ready() {
			return true
		}
		time.sleep(20 * time.millisecond)
	}
	return false
}

struct StaticHttpHandler {}

fn (mut h StaticHttpHandler) handle(req http.Request) http.Response {
	mut response := h.response_for(req)
	response.header.add(.content_length, response.body.len.str())
	if req.method == .head {
		response.body = ''
	}
	return response
}

fn (mut h StaticHttpHandler) response_for(req http.Request) http.Response {
	mut res := http.new_response(body: '')
	if req.method != .get && req.method != .head {
		res.set_status(.method_not_allowed)
		res.body = 'Method Not Allowed'
		log_static_error(405, req)
		return res
	}
	url := urllib.path_unescape(req.url) or {
		res.set_status(.bad_request)
		res.body = 'Bad Request'
		log_static_error(400, req)
		return res
	}
	relative_path := url.all_before('?').trim_left('/').trim_right('/')

	// Reject traversal before resolving the requested path, including encoded
	// '..'.
	for segment in relative_path.split('/') {
		if segment == '..' {
			res.set_status(.forbidden)
			res.body = 'Forbidden'
			log_static_error(403, req)
			return res
		}
	}

	root_path := os.norm_path(os.real_path(frontend_build_path))
	requested_path := if relative_path == '' {
		'index.html'
	} else {
		relative_path
	}
	joined_path := os.join_path(root_path, requested_path)
	file_path := os.norm_path(os.real_path(joined_path))
	root_prefix := '${root_path}${os.path_separator}'
	if file_path != root_path && !file_path.starts_with(root_prefix) {
		res.set_status(.forbidden)
		res.body = 'Forbidden'
		log_static_error(403, req)
		return res
	}

	if os.is_dir(file_path) {
		res.set_status(.not_found)
		res.body = 'Not Found'
		log_static_error(404, req)
		return res
	}

	if !os.exists(file_path) {
		res.set_status(.not_found)
		res.body = 'Not Found'
		log_static_error(404, req)
		return res
	}

	ext := os.file_ext(file_path).all_after_first('.')
	mt := mime.get_mime_type(ext)
	content_type := mime.get_content_type(mt)

	body := os.read_file(file_path) or {
		res.set_status(.internal_server_error)
		res.body = 'Internal Server Error'
		log_static_error(500, req)
		return res
	}
	res.body = body
	res.header.add(.content_type, content_type)
	return res
}

fn log_static_error(status int, req http.Request) {
	eprintln('[server:error] ${status} ${req.method} ${req.url}')
}
