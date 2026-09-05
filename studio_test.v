module main

fn test_studio_volumes_cover_blender_and_audio() {
	volumes := studio_volumes()
	assert volumes.len == 3
	assert volumes[0].kind == 'blender'
	assert volumes[1].kind == 'audio'
	assert volumes[2].kind == 'render'
}

fn test_validate_scan_path_rejects_empty() {
	if _ := validate_scan_path('   ') {
		assert false, 'empty scan path should fail'
	} else {
		assert err.msg() == 'Scan path is required'
	}
}

fn test_validate_audio_path_rejects_unsupported_format() {
	assert validate_audio_path('  mix.wav  ')! == 'mix.wav'
	if _ := validate_audio_path('document.pdf') {
		assert false, 'unsupported audio format should fail'
	} else {
		assert err.msg() == 'Unsupported audio format'
	}
}

fn test_placeholder_audio_features_match_frontend_contract() {
	features := placeholder_audio_features()
	assert features.tempo == 124
	assert features.key == 'A minor'
	assert features.chroma.len == 12
	assert features.mfcc_summary.len == 5
}

fn test_mir_core_silence_analyzes_to_zeros() {
	samples := []f32{len: 8}
	features := mir_analyze_samples(samples, 48000)!
	assert features.rms == 0
	assert features.peak == 0
	assert features.zcr == 0
	assert features.sample_count == 8
}

fn test_mir_core_dc_offset_maps_to_rms_and_peak() {
	samples := [f32(0.5), 0.5, 0.5, 0.5]
	features := mir_analyze_samples(samples, 44100)!
	assert features.rms > 0.499999 && features.rms < 0.500001
	assert features.peak > 0.499999 && features.peak < 0.500001
	assert features.zcr == 0
}

fn test_mir_core_alternating_polarity_maximizes_zero_crossings() {
	samples := [f32(1), -1, 1, -1]
	features := mir_analyze_samples(samples, 48000)!
	assert features.rms > 0.999999 && features.rms < 1.000001
	assert features.zcr > 0.999999 && features.zcr < 1.000001
}

fn test_mir_core_rejects_empty_windows_and_bad_rates() {
	samples := [f32(0.1)]
	if _ := mir_analyze_samples([]f32{}, 48000) {
		assert false, 'empty window should fail'
	} else {
		assert err.msg() == 'no audio samples were provided'
		assert mir_error_code(err.msg()) == 'MirNoSamples'
	}
	if _ := mir_analyze_samples(samples, 0) {
		assert false, 'bad rate should fail'
	} else {
		assert err.msg() == 'sample rate is invalid'
		assert mir_error_code(err.msg()) == 'MirBadSampleRate'
	}
	if _ := mir_analyze_samples([]f32{len: max_mir_samples + 1}, 48000) {
		assert false, 'oversize window should fail'
	} else {
		assert mir_error_code(err.msg()) == 'MirTooManySamples'
	}
}
