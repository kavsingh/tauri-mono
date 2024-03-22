#![cfg_attr(
	all(not(debug_assertions), target_os = "windows"),
	windows_subsystem = "windows"
)]

mod system_info;

use system_info::{get_system_info, receive_system_info_events, SystemInfoEvent};
use tauri::{generate_context, generate_handler, Builder, Manager};
use tauri_specta::Event;

fn main() {
	let specta_builder = {
		let specta_builder = tauri_specta::ts::builder()
			.events(tauri_specta::collect_events![SystemInfoEvent])
			.commands(tauri_specta::collect_commands![get_system_info]);

		#[cfg(debug_assertions)]
		let specta_builder = specta_builder.path("../src/__generated__/bindings.ts");

		specta_builder.into_plugin()
	};

	Builder::default()
		.plugin(specta_builder)
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
				let mut receiver = receive_system_info_events();

				while let Some(event) = receiver.recv().await {
					event.emit_all(&handle).unwrap_or(());
				}
			});

			Ok(())
		})
		.invoke_handler(generate_handler![get_system_info])
		.run(generate_context!())
		.expect("error while running tauri application");
}
