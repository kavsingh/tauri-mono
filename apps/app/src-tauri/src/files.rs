use tauri_plugin_opener::OpenerExt;

#[tauri::command]
#[specta::specta]
#[allow(clippy::needless_pass_by_value)]
pub fn open_user_dir(app_handle: tauri::AppHandle) -> Result<(), String> {
	app_handle
		.opener()
		.open_path("/Users/", None::<&str>)
		.map_err(|_| "failed".to_string())
}
