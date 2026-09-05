module main

fn test_log_debug_gated_on_debug_flag() {
	assert should_log(.debug, false) == false
	assert should_log(.debug, true) == true
	assert should_log(.info, false) == true
	assert should_log(.warn, false) == true
	assert should_log(.err, false) == true
}
