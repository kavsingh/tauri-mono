#![cfg_attr(
	all(not(debug_assertions), target_os = "windows"),
	windows_subsystem = "windows"
)]

mod app_commands;

use tauri::{generate_context, generate_handler, Builder, Manager};

fn main() {
	Builder::default()
		.setup(|app| {
			#[cfg(debug_assertions)]
			{
				let window = app.get_window("main").unwrap();
				window.open_devtools();
				window.close_devtools();
			}

			Ok(())
		})
		.invoke_handler(generate_handler![
			app_commands::sys_info::get_sys_info,
			app_commands::heartbeat::init_heartbeat
		])
		.run(generate_context!())
		.expect("error while running tauri application");
}

#[cfg(test)]
mod export_bindings {
	#[test]
	fn specta() {
		tauri_specta::ts::export(
			specta::collect_types![
				crate::app_commands::sys_info::get_sys_info,
				crate::app_commands::heartbeat::init_heartbeat
			],
			"../src/__generated__/bindings/commands.ts",
		)
		.unwrap();
	}
}
