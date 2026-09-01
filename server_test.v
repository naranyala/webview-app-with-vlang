module main

import net.http
import os

fn test_static_handler_rejects_path_traversal() {
	mut handler := StaticHttpHandler{}
	response := handler.handle(http.Request{url: '/../README.md'})

	assert response.status_code == 403
	assert response.body == 'Forbidden'
}

fn test_static_handler_rejects_encoded_path_traversal() {
	mut handler := StaticHttpHandler{}
	response := handler.handle(http.Request{url: '/%2e%2e/README.md'})

	assert response.status_code == 403
	assert response.body == 'Forbidden'
}

fn test_static_handler_rejects_malformed_url() {
	mut handler := StaticHttpHandler{}
	response := handler.handle(http.Request{url: '/%zz'})

	assert response.status_code == 400
	assert response.body == 'Bad Request'
}

fn test_static_handler_serves_built_index() {
	if !os.exists(ui_build_path) {
		return
	}

	mut handler := StaticHttpHandler{}
	response := handler.handle(http.Request{url: '/'})
	content_type := response.header.get(.content_type) or { '' }

	assert response.status_code == 200
	assert response.body.contains('<!doctype html>')
	assert content_type.contains('text/html')
}
