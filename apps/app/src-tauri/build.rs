fn main() -> Result<(), Box<dyn std::error::Error>> {
	let app_manifest = tauri_build::AppManifest::new().commands(&[
		"get_system_info",
		"get_system_stats",
		"get_theme_preference",
		"set_theme_preference",
		"open_user_dir",
		"connect_remote",
		"remote_ready",
	]);
	tauri_build::try_build(
		tauri_build::Attributes::new().app_manifest(app_manifest),
	)?;
	Ok(())
}
