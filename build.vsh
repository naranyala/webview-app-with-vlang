#!/usr/bin/env -S v

import os
import cli

const ui_dir = os.join_path(@VMODROOT, 'ui')

fn build_ui() ! {
	println('Building Svelte UI...')
	res := os.execute('npm run build --prefix ${ui_dir}')
	if res.exit_code != 0 {
		eprintln('UI build failed:\n${res.output}')
		exit(1)
	}
	println('UI built successfully.')
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
	cmd := if dev { 'v -d dev run .' } else { 'v run .' }
	res := os.execute(cmd)
	if res.exit_code != 0 {
		eprintln('Run failed:\n${res.output}')
		exit(1)
	}
}

fn test_all() ! {
	println('Running frontend tests...')
	frontend := os.execute('npm test --prefix ${ui_dir}')
	if frontend.exit_code != 0 {
		eprintln('Frontend tests failed:\n${frontend.output}')
		exit(1)
	}
	print(frontend.output)

	println('Running backend tests...')
	for test_file in ['bridge_test.v', 'plugins_test.v', 'server_test.v'] {
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
		build_ui()!
		build_app()!
		println('\nDone! Run with: ./webview-app')
	}
	commands:      [
		cli.Command{
			name:        'dev'
			description: 'Run in development mode (requires Svelte dev server)'
			execute:     fn (_ cli.Command) ! {
				println('Starting in dev mode...')
				println('Make sure to run: cd ui && npm run dev\n')
				run_app(true)!
			}
		},
		cli.Command{
			name:        'ui'
			description: 'Build only the Svelte UI'
			execute:     fn (_ cli.Command) ! {
				build_ui()!
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
