module main

import os

// Preserve existing default locations while allowing isolated development data.
fn application_storage_dir() !string {
	mut base_dir := os.getenv('WEBVIEW_APP_DATA_DIR')
	if base_dir.len == 0 {
		base_dir = os.config_dir()!
	}
	storage_dir := os.join_path(base_dir, 'webview-app')
	os.mkdir_all(storage_dir)!
	return storage_dir
}
