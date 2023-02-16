#![cfg_attr(
	all(not(debug_assertions), target_os = "windows"),
	windows_subsystem = "windows"
)]

use serde;
use std::option::Option;
use sysinfo::{System, SystemExt};
use tauri::{Builder, Manager};
use ts_rs;

#[derive(serde::Serialize, ts_rs::TS)]
#[serde(rename_all = "camelCase")]
#[ts(export, export_to = "../src/bridge/__generated__/sys-info-response.ts")]
struct SysInfoResponse {
	name: Option<String>,
	os_version: Option<String>,
	host_name: Option<String>,
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
		.invoke_handler(tauri::generate_handler![get_sys_info])
		.run(tauri::generate_context!())
		.expect("error while running tauri application");
}
