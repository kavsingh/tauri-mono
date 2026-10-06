mod preferences;
mod system_info;
mod system_stats;
mod theme;

use std::thread::spawn;

use system_info::get_system_info;
use system_stats::{
	ManagedSystemStatsState, SystemStatsEvent, get_system_stats,
};
use tauri::{Builder, Manager};
use tauri_specta::Event;

use crate::preferences::{
	get_stored_theme_preference, get_theme_preference, set_theme_preference,
};

/// # Panics
/// This function will panic if the Tauri application fails to run.
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
	#[cfg(not(feature = "e2e"))]
	#[allow(clippy::expect_used)]
	specta_builder
		.export(
			specta_typescript::Typescript::default(),
			"../src/tauri-bindings.gen.ts",
		)
		.expect("Failed to export typescript bindings");

	// register the log plugin first so it claims the global `log` crate
	// logger before the webdriver plugins get a chance to install their own
	let builder = Builder::default().plugin(get_log_builder().build());

	#[cfg(feature = "e2e")]
	let builder = builder
		.plugin(tauri_plugin_wdio::init())
		.plugin(tauri_plugin_wdio_webdriver::init());

	#[allow(clippy::expect_used, clippy::exit)]
	builder
		.plugin(tauri_plugin_dialog::init())
		.plugin(tauri_plugin_store::Builder::default().build())
		.manage(ManagedSystemStatsState::default())
		.invoke_handler(specta_builder.invoke_handler())
		.setup(move |app| {
			specta_builder.mount_events(app);

			let main_window = app
				.get_webview_window("main")
				.expect("no main window available");
			let theme = get_stored_theme_preference(app.handle());

			app.set_theme(theme.clone().into());

			if theme.ne(&main_window.theme().ok()) {
				main_window.set_theme(theme.into()).unwrap_or(());
			}

			#[cfg(debug_assertions)]
			#[cfg(not(feature = "e2e"))]
			{
				main_window.open_devtools();
			}

			log::info!("subscribing to stats events");

			if let Some(stats_state) =
				app.try_state::<ManagedSystemStatsState>()
			{
				let handle = app.handle().clone();

				if let Ok((_, receiver)) = stats_state.subscribe() {
					spawn(move || {
						while let Ok(event) = receiver.recv() {
							if let Err(message) = event.emit(&handle) {
								log::error!(
									"could not emit stats event: {message}"
								);
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
			tauri_plugin_log::Target::new(
				tauri_plugin_log::TargetKind::Webview,
			),
		])
	} else {
		builder.level(::log::LevelFilter::Debug).targets([
			tauri_plugin_log::Target::new(
				tauri_plugin_log::TargetKind::LogDir { file_name: None },
			),
		])
	}
}
