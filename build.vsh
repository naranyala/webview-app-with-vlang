#!/usr/bin/env -S v

import os
import cli

const frontend_dir = os.join_path(@VMODROOT, 'frontend-preact')

fn shell_quote(value string) string {
	return "'" + value.replace("'", '\'"\'"\'') + "'"
}

fn install_frontend() ! {
	println('Installing frontend dependencies from package-lock.json...')
	res := os.execute('npm ci --no-bin-links --prefix ${shell_quote(frontend_dir)}')
	if res.exit_code != 0 {
		eprintln('Frontend dependency installation failed:\n${res.output}')
		exit(1)
	}
}

fn build_frontend() ! {
	println('Building Preact frontend...')
	install_frontend()!
	res := os.execute('npm run build --prefix ${shell_quote(frontend_dir)}')
	if res.exit_code != 0 {
		eprintln('Frontend build failed:\n${res.output}')
		exit(1)
	}
	println('Frontend built successfully.')
}

fn build_app() ! {
	println('Building V application...')
	res := os.execute('v -o webview-app .')
	if res.exit_code != 0 {
		eprintln('V build failed:\n${res.output}')
		exit(1)
	}
	println('Application built: webview-app')
}

fn run_app(dev bool) ! {
	cmd := if dev { 'v -d dev run .' } else { shell_quote(os.join_path(@VMODROOT, 'webview-app')) }
	res := os.execute(cmd)
	if res.exit_code != 0 {
		eprintln('Run failed:\n${res.output}')
		exit(1)
	}
}

fn test_all() ! {
	install_frontend()!
	println('Running frontend checks...')
	frontend := os.execute('npm run check --prefix ${shell_quote(frontend_dir)}')
	if frontend.exit_code != 0 {
		eprintln('Frontend checks failed:\n${frontend.output}')
		exit(1)
	}
	print(frontend.output)
	bindings := os.execute('npm run check:bindings --prefix ${shell_quote(frontend_dir)}')
	if bindings.exit_code != 0 {
		eprintln('Frontend binding checks failed:\n${bindings.output}')
		exit(1)
	}
	print(bindings.output)

	println('Running frontend tests...')
	frontend_tests := os.execute('npm test --prefix ${shell_quote(frontend_dir)}')
	if frontend_tests.exit_code != 0 {
		eprintln('Frontend tests failed:\n${frontend_tests.output}')
		exit(1)
	}
	print(frontend_tests.output)

	println('Running backend tests...')
	for test_file in ['bridge_test.v', 'plugins_test.v', 'server_test.v', 'quiz_storage_test.v',
		'notes_storage_test.v', 'storage_paths_test.v', 'studio_test.v', 'log_test.v'] {
		backend := os.execute('v test ${test_file}')
		if backend.exit_code != 0 {
			eprintln('Backend tests failed in ${test_file}:\n${backend.output}')
			exit(1)
		}
		print(backend.output)
	}
}

mut cmd := cli.Command{
	name:          'build.vsh'
	description:   'Build script for webview app'
	posix_mode:    true
	required_args: 0
	execute:       fn (c cli.Command) ! {
		build_frontend()!
		build_app()!
		println('\nDone! Run with: ./webview-app')
	}
	commands:      [
		cli.Command{
			name:        'dev'
			description: 'Run in development mode (requires Preact dev server)'
			execute:     fn (_ cli.Command) ! {
				println('Starting in dev mode...')
				println('Make sure to run: cd frontend-preact && npm run dev\n')
				run_app(true)!
			}
		},
		cli.Command{
			name:        'ui'
			description: 'Build only the frontend'
			execute:     fn (_ cli.Command) ! {
				build_frontend()!
			}
		},
		cli.Command{
			name:        'run'
			description: 'Run the compiled application'
			execute:     fn (_ cli.Command) ! {
				run_app(false)!
			}
		},
		cli.Command{
			name:        'test'
			description: 'Run frontend and backend tests'
			execute:     fn (_ cli.Command) ! {
				test_all()!
			}
		},
	]
}
cmd.parse(os.args)
