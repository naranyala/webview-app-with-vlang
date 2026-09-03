module main

import os

const frontend_dir = os.join_path(@VMODROOT, 'frontend-preact')
const frontend_build_path = os.join_path(frontend_dir, 'dist')
const frontend_dev_url = 'http://localhost:3000'
const production_url = 'http://127.0.0.1:4321/'
const production_server = '127.0.0.1:4321'
const application_title = 'Webview App - Preact + V'
const application_width = 1024
const application_height = 768

struct AppConfig {
	title  string
	width  int
	height int
	debug  bool
}

fn default_app_config() AppConfig {
	return AppConfig{
		title:  application_title
		width:  application_width
		height: application_height
		debug:  is_debug_build()
	}
}

fn is_debug_build() bool {
	$if dev ? {
		return true
	}
	return false
}
