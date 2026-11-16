fn main() -> Result<(), Box<dyn std::error::Error>> {
	let app_manifest = tauri_build::AppManifest::new().commands(&[
		"get_system_info",
		"get_system_stats",
		"get_theme_preference",
		"set_theme_preference",
		"open_user_dir",
		"connect_remote",
		"remote_ready",
		"get_connection_status",
	]);

	println!("cargo:rerun-if-env-changed=FRONTEND_RELEASE_PUBLIC_KEY");

	let public_key = std::env::var("FRONTEND_RELEASE_PUBLIC_KEY").ok();

	if public_key.is_none()
		&& std::env::var("PROFILE").as_deref() == Ok("release")
		&& std::env::var("CARGO_FEATURE_E2E").is_err()
	{
		return Err(
			"FRONTEND_RELEASE_PUBLIC_KEY is required for release builds".into(),
		);
	}

	if let Some(public_key) = public_key {
		if public_key.len() != 64
			|| !public_key.bytes().all(|byte| byte.is_ascii_hexdigit())
		{
			return Err(
				"FRONTEND_RELEASE_PUBLIC_KEY must be 32-byte hexadecimal"
					.into(),
			);
		}
		println!("cargo:rustc-env=FRONTEND_RELEASE_PUBLIC_KEY={public_key}");
	}

	tauri_build::try_build(
		tauri_build::Attributes::new().app_manifest(app_manifest),
	)?;

	Ok(())
}
