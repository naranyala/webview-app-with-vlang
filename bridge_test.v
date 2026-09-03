module main

import json

fn test_bridge_success_serializes_data() {
	response := json.decode(BridgeResponse, bridge_success('hello')) or {
		assert false
		return
	}

	assert response.ok
	assert response.data == 'hello'
	assert response.error == ''
}

fn test_bridge_failure_serializes_error() {
	response := json.decode(BridgeResponse, bridge_failure('invalid request')) or {
		assert false
		return
	}

	assert !response.ok
	assert response.data == ''
	assert response.error == 'invalid request'
}

fn test_system_name_matches_build_platform() {
	name := system_name()

	assert name.len > 0
	$if linux {
		assert name == 'Linux'
	} $else $if macos {
		assert name == 'macOS'
	} $else $if windows {
		assert name == 'Windows'
	}
}

fn test_counter_state_increments_and_resets() {
	mut counter := CounterState{}

	assert counter.increment(3) == 3
	assert counter.increment(-1) == 2
	assert counter.reset() == 0
	assert counter.increment(1) == 1
}

fn test_validate_greet_message_accepts_text() {
	assert validate_greet_message('hello')! == 'hello'
}

fn test_validate_greet_message_rejects_empty() {
	if _ := validate_greet_message('') {
		assert false, 'empty message should fail validation'
	} else {
		assert err.msg() == 'A message is required'
	}
}

fn test_validate_greet_message_rejects_oversize() {
	oversize := 'x'.repeat(max_greet_len + 1)
	if _ := validate_greet_message(oversize) {
		assert false, 'oversize message should fail validation'
	} else {
		assert err.msg() == 'Message must be 1000 characters or fewer'
	}
}

fn test_validate_delta_accepts_boundaries() {
	assert validate_delta(0)! == 0
	assert validate_delta(max_delta_abs)! == max_delta_abs
	assert validate_delta(-max_delta_abs)! == -max_delta_abs
}

fn test_validate_delta_rejects_out_of_range() {
	if _ := validate_delta(max_delta_abs + 1) {
		assert false, 'oversize delta should fail validation'
	} else {
		assert err.msg() == 'Delta must be between -1000000 and 1000000'
	}
	if _ := validate_delta(-max_delta_abs - 1) {
		assert false, 'undersize delta should fail validation'
	} else {
		assert err.msg() == 'Delta must be between -1000000 and 1000000'
	}
}
