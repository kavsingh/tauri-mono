use std::option;
use sysinfo::{System, SystemExt};

#[derive(serde::Serialize, specta::Type)]
#[serde(rename_all = "camelCase")]
pub struct SystemInfoResponse {
	os_fullname: option::Option<String>,
	os_version: option::Option<String>,
	os_arch: option::Option<String>,
	mem_total: option::Option<String>,
	mem_available: option::Option<String>,
}

// https://tauri.studio/en/docs/usage/howtos/command#complete-example
#[tauri::command]
#[specta::specta]
pub fn get_system_info() -> SystemInfoResponse {
	let sys = System::new();

	SystemInfoResponse {
		os_fullname: sys.long_os_version(),
		os_version: sys.os_version(),
		// TODO: get the actual runtime arch somehow
		os_arch: Some(std::env::consts::ARCH.to_string()),
		mem_total: Some(sys.total_memory().to_string()),
		mem_available: Some(sys.available_memory().to_string()),
	}
}
