import os
import time
import net.http
import net.http.mime
import net.urllib
import ttytm.webview

const ui_build_path = os.join_path(@VMODROOT, 'ui', 'build')
const serve_port = ':4321'

struct App {
mut:
	window webview.Webview
}

fn main() {
	mut app := App{
		window: webview.create(debug: true)
	}
	app.bind()
	app.window.set_title('Webview App - Svelte + V')
	app.window.set_size(1024, 768, .@none)
	$if dev ? {
		println('Starting in DEV mode...')
		println('Make sure Svelte dev server is running: cd ui && npm run dev')
		app.window.navigate('http://localhost:5173')
	} $else {
		if !os.exists(ui_build_path) {
			eprintln('UI build not found. Run: cd ui && npm run build')
			exit(1)
		}
		spawn serve_ui()
		time.sleep(300 * time.millisecond)
		app.window.navigate('http://localhost${serve_port}')
	}
	app.window.run()
	app.window.destroy()
}

fn serve_ui() {
	mut server := &http.Server{
		handler:    StaticHttpHandler{}
		addr:       serve_port
		worker_num: 2
	}
	server.listen_and_serve()
}

struct StaticHttpHandler {}

fn (mut h StaticHttpHandler) handle(req http.Request) http.Response {
	mut res := http.new_response(body: '')
	mut url := urllib.query_unescape(req.url) or {
		res.set_status(.bad_request)
		res.body = 'Bad Request'
		return res
	}
	uri_path := url.all_after_first('/').all_before('?').trim_right('/')
	file_path := os.norm_path(os.real_path(os.join_path(ui_build_path, if uri_path == '' {
		'index.html'
	} else {
		uri_path
	})))

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
	res.header.add(.access_control_allow_origin, '*')
	return res
}

fn (mut app App) bind() {
	app.window.bind('greet_from_v', greet_from_v)
	app.window.bind('get_time', get_time)
}

fn greet_from_v(e &webview.Event) string {
	msg := e.get_arg[string](0) or { 'No message' }
	println('[V Backend] Received from JS: ${msg}')
	e.eval('console.log("V backend processed: ${msg}");')
	return 'V says: "${msg}" received at ${time.now().format()}'
}

fn get_time(_ &webview.Event) string {
	return time.now().format()
}
