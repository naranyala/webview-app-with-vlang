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
