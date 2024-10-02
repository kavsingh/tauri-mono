// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(
	all(not(debug_assertions), target_os = "windows"),
	windows_subsystem = "windows"
)]

mod system_info;
mod system_stats;

use std::thread::spawn;

use tauri::{Builder, Manager};
use tauri_specta::Event;

use system_info::get_system_info;
use system_stats::{get_system_stats, ManagedSystemStatsState, SystemStatsEvent};

fn main() {
	let mut ctx = tauri::generate_context!();
	let specta_builder = tauri_specta::Builder::<tauri::Wry>::new()
		.events(tauri_specta::collect_events![SystemStatsEvent])
		.commands(tauri_specta::collect_commands![
			get_system_info,
			get_system_stats
		]);

	#[cfg(debug_assertions)]
	specta_builder
		.export(
			specta_typescript::Typescript::default(),
			"../src/__generated__/bindings.ts",
		)
		.expect("Failed to export typescript bindings");

	Builder::default()
		.plugin(tauri_plugin_log::Builder::default().build())
		.plugin(tauri_plugin_dialog::init())
		.plugin(tauri_plugin_theme::init(ctx.config_mut()))
		.manage(ManagedSystemStatsState::default())
		.invoke_handler(specta_builder.invoke_handler())
		.setup(move |app| {
			specta_builder.mount_events(app);

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

			log::info!("subscribing to stats events");

			if let Some(stats_state) = app.try_state::<ManagedSystemStatsState>() {
				let handle = app.handle().clone();

				if let Ok((_, receiver)) = stats_state.subscribe() {
					spawn(move || {
						while let Ok(event) = receiver.recv() {
							match event.emit(&handle) {
								Ok(_) => (),
								Err(e) => {
									log::error!("could not emit stats event: {:?}", e);
								}
							}
						}
					});
				} else {
					log::error!("could not subscribe to stats events");
				}
			}

			Ok(())
		})
		.run(ctx)
		.expect("error while running tauri application");
}
