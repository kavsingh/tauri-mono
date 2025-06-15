use tauri::AppHandle;
use tauri_plugin_store::StoreExt;

use crate::theme::ThemePreference;

const PREFERENCES_STORE: &str = "preferences.json";
const THEME_KEY: &str = "theme";

pub fn get_stored_theme_preference(app: &AppHandle) -> ThemePreference {
	let stored = app
		.store(PREFERENCES_STORE)
		.ok()
		.and_then(|store| store.get(THEME_KEY));

	if let Some(serde_json::Value::String(value)) = stored {
		match value {
			_ if value == ThemePreference::Dark.value() => ThemePreference::Dark,
			_ if value == ThemePreference::Light.value() => ThemePreference::Light,
			_ => ThemePreference::System,
		}
	} else {
		ThemePreference::System
	}
}

fn store_theme_preference(preference: &ThemePreference, app: &tauri::AppHandle) {
	if let Ok(store) = app.store(PREFERENCES_STORE) {
		store.set(
			THEME_KEY,
			serde_json::Value::String(preference.value().to_string()),
		);
	};
}

#[tauri::command]
#[specta::specta]
pub fn get_theme_preference(app_handle: tauri::AppHandle) -> ThemePreference {
	get_stored_theme_preference(&app_handle)
}

#[tauri::command]
#[specta::specta]
pub fn set_theme_preference(
	preference: ThemePreference,
	app_handle: tauri::AppHandle,
	window: tauri::Window,
) {
	store_theme_preference(&preference, &app_handle);

	app_handle.set_theme(preference.clone().into());

	if preference.ne(&window.theme().ok()) {
		window.set_theme(preference.clone().into()).unwrap_or(())
	}
}
