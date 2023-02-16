#![cfg_attr(
	all(not(debug_assertions), target_os = "windows"),
	windows_subsystem = "windows"
)]

use serde;
use std::time::{Duration, SystemTime};
use std::{option, thread};
use sysinfo::{System, SystemExt};
use tauri::{Builder, Manager, Window};
use ts_rs;

#[derive(serde::Serialize, ts_rs::TS)]
#[serde(rename_all = "camelCase")]
#[ts(export, export_to = "../src/bridge/__generated__/sys-info-response.ts")]
struct SysInfoResponse {
	name: option::Option<String>,
	os_version: option::Option<String>,
	host_name: option::Option<String>,
}

// https://tauri.studio/en/docs/usage/howtos/command#complete-example
#[tauri::command]
fn get_sys_info() -> SysInfoResponse {
	let sys = System::new();

	SysInfoResponse {
		name: sys.name(),
		os_version: sys.os_version(),
		host_name: sys.host_name(),
	}
}

#[derive(Clone, serde::Serialize, ts_rs::TS)]
#[serde(rename_all = "camelCase")]
#[ts(export, export_to = "../src/bridge/__generated__/heartbeat-event.ts")]
struct HeartbeatEvent {
	message: String,
	timestamp: u128,
}

// init a background process on the command, and emit periodic events only to the window that used the command
#[tauri::command]
fn init_heartbeat(window: Window) -> Result<(), String> {
	let interval = Duration::new(3, 0);

	std::thread::spawn(move || loop {
		let since_epoch = SystemTime::now()
			.duration_since(SystemTime::UNIX_EPOCH)
			.unwrap();

		window
			.emit(
				"heartbeat",
				HeartbeatEvent {
					message: "OK".into(),
					timestamp: since_epoch.as_millis(),
				},
			)
			.unwrap();

		thread::sleep(interval);
	});

	Ok(())
}

fn main() {
	Builder::default()
		.setup(|app| {
			#[cfg(debug_assertions)] // only include this code on debug builds
			{
				let window = app.get_window("main").unwrap();
				window.open_devtools();
				window.close_devtools();
			}

			Ok(())
		})
		.invoke_handler(tauri::generate_handler![get_sys_info, init_heartbeat])
		.run(tauri::generate_context!())
		.expect("error while running tauri application");
}
