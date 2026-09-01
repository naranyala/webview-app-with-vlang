module main

import os
import ttytm.webview

struct App {
mut:
	window webview.Webview
}

fn main() {
	config := default_app_config()
	mut app := App{
		window: webview.create(debug: config.debug)
	}
	app.bind()
	app.window.set_title(config.title)
	app.window.set_size(config.width, config.height, .@none)
	$if dev ? {
		println('Starting in DEV mode...')
		println('Make sure Svelte dev server is running: cd ui && npm run dev')
		println('Web Inspector: press Ctrl+Shift+I or right-click and choose Inspect Element')
		app.window.navigate('http://localhost:5173')
	} $else {
		if !os.exists(ui_build_path) {
			eprintln('UI build not found. Run: cd ui && npm run build')
			exit(1)
		}
		spawn serve_ui()
		if !wait_for_ui() {
			eprintln('UI server did not become ready at ${production_url}')
			exit(1)
		}
		app.window.navigate(production_url)
	}
	app.window.run()
	app.window.destroy()
}
