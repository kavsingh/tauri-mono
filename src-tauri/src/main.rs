#![cfg_attr(
	all(not(debug_assertions), target_os = "windows"),
	windows_subsystem = "windows"
)]

mod app_commands;

use tauri::{Builder, Manager};

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
		.invoke_handler(tauri::generate_handler![
			app_commands::sys_info::get_sys_info,
			app_commands::heartbeat::init_heartbeat
		])
		.run(tauri::generate_context!())
		.expect("error while running tauri application");
}
