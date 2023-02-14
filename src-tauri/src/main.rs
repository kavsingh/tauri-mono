#![cfg_attr(
	all(not(debug_assertions), target_os = "windows"),
	windows_subsystem = "windows"
)]

use serde::Serialize;
use std::option::Option;
use sysinfo::{System, SystemExt};
use tauri::{command, generate_context, generate_handler, Builder};
use ts_rs::TS;

fn main() {
	Builder::default()
		.invoke_handler(generate_handler![get_sys_info])
		.setup(|app| {
			#[cfg(debug_assertions)] // only include this code on debug builds
			{
				let window = app.get_window("main").unwrap();
				window.open_devtools();
				window.close_devtools();
			}

			Ok(())
		})
		.run(generate_context!())
		.expect("error while running tauri application");
}

#[derive(Serialize, TS)]
#[serde(rename_all = "camelCase")]
#[ts(export, export_to = "../src/bridge/__generated__/sys-info-response.ts")]
struct SysInfoResponse {
	name: Option<String>,
	os_version: Option<String>,
	host_name: Option<String>,
}

// https://tauri.studio/en/docs/usage/howtos/command#complete-example
#[command]
fn get_sys_info() -> SysInfoResponse {
	let sys = System::new();

	SysInfoResponse {
		name: sys.name(),
		os_version: sys.os_version(),
		host_name: sys.host_name(),
	}
}
