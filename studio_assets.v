module main

import json
import os
import ttytm.webview

struct StudioVolume {
	id   string
	name string
	path string
	kind string
}

struct AssetScanJob {
	id            string
	volume_id     string
	state         string
	scanned_files int
	scanned_bytes i64
}

fn studio_volumes() []StudioVolume {
	home := os.home_dir()
	return [
		StudioVolume{
			id:   'projects'
			name: 'Blender Projects'
			path: os.join_path(home, 'projects')
			kind: 'blender'
		},
		StudioVolume{
			id:   'samples'
			name: 'Sample Library'
			path: os.join_path(home, 'samples')
			kind: 'audio'
		},
		StudioVolume{
			id:   'renders'
			name: 'Renders'
			path: os.join_path(home, 'renders')
			kind: 'render'
		},
	]
}

fn validate_scan_path(path string) !string {
	clean := path.trim_space()
	if clean.len == 0 {
		return error('Scan path is required')
	}
	if clean.len > 4096 {
		return error('Scan path is too long')
	}
	return clean
}

fn (mut app App) list_volumes(_ &webview.Event) string {
	return bridge_success(json.encode(studio_volumes()))
}

fn (mut app App) start_asset_scan(e &webview.Event) string {
	path := e.get_arg[string](0) or {
		return bridge_failure_code('InvalidArgument', 'Scan path is required')
	}
	clean := validate_scan_path(path) or {
		log_bridge_error('start_asset_scan', err.msg())
		return bridge_failure_code('InvalidArgument', err.msg())
	}
	job := AssetScanJob{
		id:            'scan-local'
		volume_id:     clean
		state:         'queued'
		scanned_files: 0
		scanned_bytes: 0
	}
	return bridge_success(json.encode(job))
}

fn (mut app App) get_asset_scan_status(e &webview.Event) string {
	job_id := e.get_arg[string](0) or {
		return bridge_failure_code('InvalidArgument', 'Scan job id is required')
	}
	if job_id.trim_space().len == 0 {
		return bridge_failure_code('InvalidArgument', 'Scan job id is required')
	}
	job := AssetScanJob{
		id:            job_id
		volume_id:     'projects'
		state:         'completed'
		scanned_files: 0
		scanned_bytes: 0
	}
	return bridge_success(json.encode(job))
}

fn (mut app App) cancel_asset_scan(e &webview.Event) string {
	job_id := e.get_arg[string](0) or {
		return bridge_failure_code('InvalidArgument', 'Scan job id is required')
	}
	if job_id.trim_space().len == 0 {
		return bridge_failure_code('InvalidArgument', 'Scan job id is required')
	}
	return bridge_success('Scan cancelled')
}
