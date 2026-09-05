module main

import math

// Pure offline time-domain MIR core.
//
// Deliberately dependency-free (no FFT) and allocation-free in the analysis
// path so it stays suitable for the WebView RPC thread. The frontend
// downsamples long buffers to a bounded window before calling `mir_analyze`.
// Frequency-domain features (centroid, chroma, tempo) remain a later step and
// are currently served by the placeholder `analyze_audio` contract.
//
// Layout mirrors the Zig sibling's `src/backend/mir.zig` so a future shared
// C library can replace both implementations behind these same shapes.
pub const max_mir_samples = 262144
pub const max_mir_sample_rate = u32(192000)

pub struct MirFeatures {
	rms              f32
	peak             f32
	zcr              f32
	sample_count     int
	sample_rate      u32
	duration_seconds f32
}

pub fn mir_root_mean_square(samples []f32) f32 {
	if samples.len == 0 {
		return 0
	}
	mut acc := f64(0)
	for s in samples {
		acc += f64(s) * f64(s)
	}
	return f32(math.sqrt(acc / f64(samples.len)))
}

pub fn mir_peak_amplitude(samples []f32) f32 {
	mut peak := f32(0)
	for s in samples {
		mag := if s < 0 { -s } else { s }
		if mag > peak {
			peak = mag
		}
	}
	return peak
}

// Zero-crossing rate in [0, 1]: sign changes / (n - 1). Cheap
// brightness/noisiness cue before an FFT exists.
pub fn mir_zero_crossing_rate(samples []f32) f32 {
	if samples.len < 2 {
		return 0
	}
	mut crossings := 0
	mut prev_positive := samples[0] >= 0
	for s in samples[1..] {
		positive := s >= 0
		if positive != prev_positive {
			crossings++
		}
		prev_positive = positive
	}
	return f32(crossings) / f32(samples.len - 1)
}

pub fn mir_analyze_samples(samples []f32, sample_rate u32) !MirFeatures {
	if samples.len == 0 {
		return error('no audio samples were provided')
	}
	if samples.len > max_mir_samples {
		return error('too many audio samples for one analysis window')
	}
	if sample_rate == 0 || sample_rate > max_mir_sample_rate {
		return error('sample rate is invalid')
	}
	return MirFeatures{
		rms:              mir_root_mean_square(samples)
		peak:             mir_peak_amplitude(samples)
		zcr:              mir_zero_crossing_rate(samples)
		sample_count:     samples.len
		sample_rate:      sample_rate
		duration_seconds: f32(samples.len) / f32(sample_rate)
	}
}

pub fn mir_error_code(message string) string {
	return match message {
		'no audio samples were provided' { 'MirNoSamples' }
		'too many audio samples for one analysis window' { 'MirTooManySamples' }
		'sample rate is invalid' { 'MirBadSampleRate' }
		else { 'MirError' }
	}
}
