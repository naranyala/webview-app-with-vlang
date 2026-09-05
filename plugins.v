module main

struct BackendPlugin {
	id          string
	name        string
	version     string = '0.1.0'
	description string
	enabled     bool   = true
	register    fn (mut App) = unsafe { nil }
}

fn validate_backend_plugins(plugins []BackendPlugin) ! {
	for index, plugin in plugins {
		for previous in plugins[..index] {
			if plugin.id == previous.id {
				return error('Duplicate backend plugin: ${plugin.id}')
			}
		}
	}
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
	plugins := backend_plugins()
	validate_backend_plugins(plugins) or {
		eprintln('[plugins:error] ${err.msg()}')
		return
	}
	for plugin in plugins {
		if !plugin.enabled {
			continue
		}
		if plugin.register == unsafe { nil } {
			eprintln('[plugins:error] Skipping plugin without register fn: ${plugin.id}')
			continue
		}
		plugin.register(mut app)
	}
}

fn (mut app App) bind() {
	register_backend_plugins(mut app)
}
