module main

import os
import time

fn test_native_stores_share_overridden_directory() {
	previous := os.getenv('WEBVIEW_APP_DATA_DIR')
	base := os.join_path(os.temp_dir(), 'webview-paths-${time.now().unix_nano()}')
	os.setenv('WEBVIEW_APP_DATA_DIR', base, true)
	defer {
		if previous.len == 0 {
			os.unsetenv('WEBVIEW_APP_DATA_DIR')
		} else {
			os.setenv('WEBVIEW_APP_DATA_DIR', previous, true)
		}
		os.rmdir_all(base) or {}
	}
	notes := new_note_store()!
	quiz := new_quiz_store()!
	assert notes.path == os.join_path(base, 'webview-app', 'notes.json')
	assert quiz.path == os.join_path(base, 'webview-app', 'quizzes.json')
	assert os.exists(quiz.path)
}
