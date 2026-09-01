module main

import os

const ui_build_path = os.join_path(@VMODROOT, 'ui', 'build')
const production_url = 'http://127.0.0.1:4321/'
const production_server = '127.0.0.1:4321'
const application_title = 'Webview App - Svelte + V'
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
