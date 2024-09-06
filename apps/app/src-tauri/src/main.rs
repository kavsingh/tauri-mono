#![cfg_attr(
	all(not(debug_assertions), target_os = "windows"),
	windows_subsystem = "windows"
)]

mod system_info;
mod system_stats;

use std::thread::spawn;

use system_info::get_system_info;
use system_stats::{get_system_stats, ManagedSystemStatsState, SystemStatsEvent};
use tauri::{generate_handler, Builder, Manager};
use tauri_plugin_theme::ThemePlugin;
use tauri_specta::Event;

fn main() {
	let mut ctx = tauri::generate_context!();
	let specta_builder = {
		let specta_builder = tauri_specta::ts::builder()
			.events(tauri_specta::collect_events![SystemStatsEvent])
			.commands(tauri_specta::collect_commands![
				get_system_info,
				get_system_stats
			]);

		#[cfg(debug_assertions)]
		let specta_builder = specta_builder.path("../src/__generated__/bindings.ts");

		specta_builder.into_plugin()
	};

	Builder::default()
		.manage(ManagedSystemStatsState::default())
		.plugin(specta_builder)
		.plugin(ThemePlugin::init(ctx.config_mut()))
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

			if let Some(stats_state) = app.try_state::<ManagedSystemStatsState>() {
				let handle = app.handle();

				if let Ok((_, receiver)) = stats_state.subscribe() {
					spawn(move || {
						while let Ok(event) = receiver.recv() {
							event.emit_all(&handle).unwrap_or(());
						}
					});
				} else {
					eprintln!("could not subscribe to stats events");
				}
			}

			Ok(())
		})
		.invoke_handler(generate_handler![get_system_info])
		.run(ctx)
		.expect("error while running tauri application");
}
