module main

struct BackendPlugin {
	id       string
	name     string
	register fn (mut App) = unsafe { nil }
}

fn backend_plugins() []BackendPlugin {
	return [
		BackendPlugin{
			id:       'core-bridge'
			name:     'Core bridge'
			register: register_core_bridge
		}
	]
}

fn register_backend_plugins(mut app App) {
	for plugin in backend_plugins() {
		plugin.register(mut app)
	}
}

fn (mut app App) bind() {
	register_backend_plugins(mut app)
}
