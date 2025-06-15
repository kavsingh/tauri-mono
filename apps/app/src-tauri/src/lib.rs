mod preferences;
mod system_info;
mod system_stats;
mod theme;

use std::thread::spawn;

use system_info::get_system_info;
use system_stats::{ManagedSystemStatsState, SystemStatsEvent, get_system_stats};
use tauri::{Builder, Manager};
use tauri_specta::Event;

use crate::preferences::{get_stored_theme_preference, get_theme_preference, set_theme_preference};

pub fn run() {
	let specta_builder = tauri_specta::Builder::<tauri::Wry>::new()
		.events(tauri_specta::collect_events![SystemStatsEvent])
		.commands(tauri_specta::collect_commands![
			get_system_info,
			get_system_stats,
			get_theme_preference,
			set_theme_preference
		]);

	#[cfg(debug_assertions)]
	specta_builder
		.export(
			specta_typescript::Typescript::default(),
			"../src/__generated__/bindings.ts",
		)
		.expect("Failed to export typescript bindings");

	Builder::default()
		.plugin(get_log_builder().build())
		.plugin(tauri_plugin_dialog::init())
		.plugin(tauri_plugin_store::Builder::default().build())
		.manage(ManagedSystemStatsState::default())
		.invoke_handler(specta_builder.invoke_handler())
		.setup(move |app| {
			specta_builder.mount_events(app);

			let main_window = app.get_webview_window("main").unwrap();
			let theme = get_stored_theme_preference(app.handle());

			app.set_theme(theme.clone().into());

			if theme.ne(&main_window.theme().ok()) {
				main_window.set_theme(theme.clone().into()).unwrap_or(())
			}

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
		.run(tauri::generate_context!())
		.expect("error while running tauri application");
}

fn get_log_builder() -> tauri_plugin_log::Builder {
	let builder = tauri_plugin_log::Builder::default();

	if cfg!(debug_assertions) {
		builder.level(::log::LevelFilter::Trace).targets([
			tauri_plugin_log::Target::new(tauri_plugin_log::TargetKind::Webview),
			tauri_plugin_log::Target::new(tauri_plugin_log::TargetKind::Stdout),
		])
	} else {
		builder
			.level(::log::LevelFilter::Debug)
			.targets([tauri_plugin_log::Target::new(
				tauri_plugin_log::TargetKind::LogDir { file_name: None },
			)])
	}
}
