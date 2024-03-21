#![cfg_attr(
	all(not(debug_assertions), target_os = "windows"),
	windows_subsystem = "windows"
)]

mod system_info;

use tauri::{generate_context, generate_handler, Builder, Manager};

const EVENT_SYSTEM_INFO: &str = "system-info-event";

fn main() {
	Builder::default()
		.setup(|app| {
			let main_window = app.get_window("main").unwrap();

			#[cfg(debug_assertions)]
			{
				main_window.open_devtools();
			}

			#[cfg(target_os = "macos")]
			window_vibrancy::apply_vibrancy(
				&main_window,
				window_vibrancy::NSVisualEffectMaterial::Sidebar,
				None,
				None,
			)
			.expect("Unsupported platform! 'apply_vibrancy' is only supported on macOS");

			#[cfg(target_os = "windows")]
			window_vibrancy::apply_acrylic(&main_window, None)
				.expect("Unsupported platform! 'apply_acrylic' is only supported on Windows");

			let handle = app.handle();
			tauri::async_runtime::spawn(async move {
				let mut receiver = system_info::subscribe_system_info_events();

				while let Some(message) = receiver.recv().await {
					handle.emit_all(EVENT_SYSTEM_INFO, message).unwrap_or(());
				}
			});

			Ok(())
		})
		.invoke_handler(generate_handler![system_info::get_system_info,])
		.run(generate_context!())
		.expect("error while running tauri application");
}

#[cfg(test)]
mod export_bindings {
	#[test]
	fn specta() {
		tauri_specta::ts::export(
			specta::collect_types![crate::system_info::get_system_info,],
			"../src/__generated__/bindings/commands.ts",
		)
		.unwrap();
	}
}
