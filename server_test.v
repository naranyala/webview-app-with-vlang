module main

import net.http
import os

fn test_head_omits_error_body() {
	mut handler := StaticHttpHandler{}
	response := handler.handle(http.Request{ method: .head, url: '/../README.md' })
	assert response.status_code == 403
	assert response.body == ''
}

fn test_head_matches_get_headers_without_body() {
	if !os.exists(os.join_path(frontend_build_path, 'index.html')) {
		return
	}
	mut handler := StaticHttpHandler{}
	get := handler.handle(http.Request{ url: '/' })
	head := handler.handle(http.Request{ method: .head, url: '/' })
	get_content_type := get.header.get(.content_type) or { '' }
	head_content_type := head.header.get(.content_type) or { '' }
	head_content_length := head.header.get(.content_length) or { '' }
	assert head.status_code == get.status_code
	assert head_content_type == get_content_type
	assert head_content_length == get.body.len.str()
	assert head.body == ''
}

fn test_static_handler_rejects_path_traversal() {
	mut handler := StaticHttpHandler{}
	response := handler.handle(http.Request{ url: '/../README.md' })

	assert response.status_code == 403
	assert response.body == 'Forbidden'
}

fn test_static_handler_rejects_encoded_path_traversal() {
	mut handler := StaticHttpHandler{}
	response := handler.handle(http.Request{ url: '/%2e%2e/README.md' })

	assert response.status_code == 403
	assert response.body == 'Forbidden'
}

fn test_static_handler_rejects_malformed_url() {
	mut handler := StaticHttpHandler{}
	response := handler.handle(http.Request{ url: '/%zz' })

	assert response.status_code == 400
	assert response.body == 'Bad Request'
}

fn test_static_handler_rejects_non_get_method() {
	mut handler := StaticHttpHandler{}
	response := handler.handle(http.Request{ method: .post, url: '/' })

	assert response.status_code == 405
	assert response.body == 'Method Not Allowed'
}

fn test_static_handler_returns_not_found_for_missing_file() {
	mut handler := StaticHttpHandler{}
	response := handler.handle(http.Request{ url: '/missing-file-xyz.html' })

	assert response.status_code == 404
	assert response.body == 'Not Found'
}

fn test_static_handler_strips_query_string() {
	if !os.exists(frontend_build_path) {
		return
	}

	mut handler := StaticHttpHandler{}
	response := handler.handle(http.Request{ url: '/?v=1' })

	assert response.status_code == 200
	assert response.body.contains('<!doctype html>')
}

fn test_static_handler_serves_built_index() {
	if !os.exists(frontend_build_path) {
		return
	}

	mut handler := StaticHttpHandler{}
	response := handler.handle(http.Request{ url: '/' })
	content_type := response.header.get(.content_type) or { '' }

	assert response.status_code == 200
	assert response.body.contains('<!doctype html>')
	assert content_type.contains('text/html')
}
