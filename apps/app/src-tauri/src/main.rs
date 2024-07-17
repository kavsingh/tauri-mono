// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(
	all(not(debug_assertions), target_os = "windows"),
	windows_subsystem = "windows"
)]

mod system_info;

use system_info::{
	get_system_info, get_system_stats, receive_system_stats_events, SystemStatsEvent,
};
use tauri::{Builder, Manager};
use tauri_specta::Event;

fn main() {
	let mut ctx = tauri::generate_context!();
	let (invoke_handler, register_events) = {
		let specta_builder = tauri_specta::ts::builder()
			.events(tauri_specta::collect_events![SystemStatsEvent])
			.commands(tauri_specta::collect_commands![
				get_system_info,
				get_system_stats
			]);

		#[cfg(debug_assertions)]
		let specta_builder = specta_builder.path("../src/__generated__/bindings.ts");

		specta_builder.build().unwrap()
	};

	Builder::default()
		.plugin(tauri_plugin_dialog::init())
		.plugin(tauri_plugin_theme::init(ctx.config_mut()))
		.invoke_handler(invoke_handler)
		.setup(|app| {
			register_events(app);

			let main_window = app.get_webview_window("main").unwrap();

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
				let mut receiver = receive_system_stats_events(Duration::from_secs(1));

				while let Some(event) = receiver.recv().await {
					event.emit(&handle).unwrap_or(());
				}
			});

			Ok(())
		})
		.run(ctx)
		.expect("error while running tauri application");
}
