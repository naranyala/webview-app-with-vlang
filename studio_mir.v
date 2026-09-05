module main

import json
import ttytm.webview

const allowed_audio_exts = ['.wav', '.flac', '.mp3', '.ogg', '.mid', '.midi']

struct AudioMetadata {
	path         string
	format       string
	duration_sec f64
	sample_rate  int
	channels     int
}

struct AudioFeatures {
	tempo              f64
	key                string
	loudness_db        f64
	duration_sec       f64
	chroma             []f64
	spectral_centroid  f64 @[json: 'spectralCentroidHz']
	mfcc_summary       []f64 @[json: 'mfccSummary']
}

fn validate_audio_path(path string) !string {
	clean := path.trim_space()
	if clean.len == 0 {
		return error('Audio path is required')
	}
	if clean.len > 4096 {
		return error('Audio path is too long')
	}
	lower := clean.to_lower()
	for ext in allowed_audio_exts {
		if lower.ends_with(ext) {
			return clean
		}
	}
	return error('Unsupported audio format')
}

fn placeholder_audio_metadata(path string) AudioMetadata {
	return AudioMetadata{
		path:         path
		format:       path.all_after_last('.').to_lower()
		duration_sec: 142
		sample_rate:  48000
		channels:     2
	}
}

fn placeholder_audio_features() AudioFeatures {
	return AudioFeatures{
		tempo:             124
		key:               'A minor'
		loudness_db:       -9.5
		duration_sec:      142
		chroma:            [f64(0.8), 0.2, 0.4, 0.1, 0.6, 0.3, 0.5, 0.7, 0.2, 0.4, 0.6, 0.3]
		spectral_centroid: 2450
		mfcc_summary:      [f64(12.4), -3.1, 5.6, 1.2, -0.8]
	}
}

struct MirAnalyzeRequest {
	samples     []f32
	sample_rate u32
}

const max_mir_payload_bytes = 8 * 1024 * 1024

fn (mut app App) mir_analyze(e &webview.Event) string {
	payload := e.get_arg[string](0) or {
		return bridge_failure_code('InvalidArgument', 'MIR payload is required')
	}
	if payload.len > max_mir_payload_bytes {
		return bridge_failure_code('InvalidArgument', 'MIR payload is too large')
	}
	request := json.decode(MirAnalyzeRequest, payload) or {
		log_bridge_error('mir_analyze', 'MIR payload is invalid')
		return bridge_failure_code('InvalidArgument', 'MIR payload is invalid')
	}
	features := mir_analyze_samples(request.samples, request.sample_rate) or {
		log_bridge_error('mir_analyze', err.msg())
		return bridge_failure_code(mir_error_code(err.msg()), err.msg())
	}
	return bridge_success(json.encode(features))
}

fn (mut app App) get_audio_metadata(e &webview.Event) string {
	path := e.get_arg[string](0) or {
		return bridge_failure_code('InvalidArgument', 'Audio path is required')
	}
	clean := validate_audio_path(path) or {
		log_bridge_error('get_audio_metadata', err.msg())
		return bridge_failure_code('InvalidArgument', err.msg())
	}
	return bridge_success(json.encode(placeholder_audio_metadata(clean)))
}

fn (mut app App) analyze_audio(e &webview.Event) string {
	path := e.get_arg[string](0) or {
		return bridge_failure_code('InvalidArgument', 'Audio path is required')
	}
	clean := validate_audio_path(path) or {
		log_bridge_error('analyze_audio', err.msg())
		return bridge_failure_code('InvalidArgument', err.msg())
	}
	_ = clean
	return bridge_success(json.encode(placeholder_audio_features()))
}
