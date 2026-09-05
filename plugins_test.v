module main

fn test_backend_plugin_registry_contains_core_bridge() {
	plugins := backend_plugins()

	assert plugins.len == 1
	assert plugins[0].id == 'core-bridge'
	assert plugins[0].name == 'Core bridge'
	assert plugins[0].enabled == true
	validate_backend_plugins(plugins)!
}

fn test_backend_plugin_registry_rejects_duplicate_ids() {
	plugins := [
		BackendPlugin{
			id:   'core-bridge'
			name: 'Core bridge'
		},
		BackendPlugin{
			id:   'core-bridge'
			name: 'Duplicate bridge'
		},
	]
	if _ := validate_backend_plugins(plugins) {
		assert false, 'duplicate plugin ids should fail validation'
	} else {
		assert err.msg() == 'Duplicate backend plugin: core-bridge'
	}
}
