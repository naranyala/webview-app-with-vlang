module main

import os
import ttytm.webview

@[heap]
struct App {
mut:
	window  webview.Webview
	counter CounterState
	quiz    QuizStore
}

fn main() {
	config := default_app_config()
	quiz_store := new_quiz_store() or {
		eprintln('Quiz storage initialization failed: ${err}')
		return
	}
	mut app := App{
		window: webview.create(debug: config.debug)
		quiz:   quiz_store
	}
	app.bind()
	app.window.set_title(config.title)
	app.window.set_size(config.width, config.height, .@none)
	$if dev ? {
		println('Starting in DEV mode...')
		println('Make sure Preact dev server is running:')
		println('  cd frontend-preact && npm run dev')
		println('Web Inspector: press Ctrl+Shift+I or right-click and choose')
		println('  Inspect Element')
		app.window.navigate(frontend_dev_url)
	} $else {
		if !os.exists(frontend_build_path) {
			eprintln('Frontend build not found.')
			eprintln('Run: cd frontend-preact && npm run build')
			exit(1)
		}
		spawn serve_frontend()
		if !wait_for_frontend() {
			eprintln('Frontend server did not become ready at ${production_url}')
			exit(1)
		}
		app.window.navigate(production_url)
	}
	app.window.run()
	app.window.destroy()
}
