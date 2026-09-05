module main

// Leveled backend logging. `debug` messages are dropped unless the binary was
// built with `-d dev`; all other levels always emit. Mirrors the Zig
// sibling's `src/backend/log.zig` so both shells share one log discipline.
pub enum LogLevel {
	debug
	info
	warn
	err
}

pub fn should_log(level LogLevel, debug_enabled bool) bool {
	return match level {
		.debug { debug_enabled }
		else { true }
	}
}

pub fn log_message(level LogLevel, context string, message string) {
	match level {
		.debug {
			if is_debug_build() {
				eprintln('[debug] ${context}: ${message}')
			}
		}
		.info {
			println('[info] ${context}: ${message}')
		}
		.warn {
			eprintln('[warn] ${context}: ${message}')
		}
		.err {
			eprintln('[error] ${context}: ${message}')
		}
	}
}
