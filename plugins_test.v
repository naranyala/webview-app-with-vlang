module main

fn test_backend_plugin_registry_contains_core_bridge() {
	plugins := backend_plugins()

	assert plugins.len == 1
	assert plugins[0].id == 'core-bridge'
	assert plugins[0].name == 'Core bridge'
}
