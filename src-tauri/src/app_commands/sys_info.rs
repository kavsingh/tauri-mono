use std::option;
use sysinfo::{System, SystemExt};

#[derive(serde::Serialize, specta::Type)]
#[serde(rename_all = "camelCase")]
pub struct SysInfoResponse {
	name: option::Option<String>,
	os_version: option::Option<String>,
	host_name: option::Option<String>,
}

// https://tauri.studio/en/docs/usage/howtos/command#complete-example
#[tauri::command]
#[specta::specta]
pub fn get_sys_info() -> SysInfoResponse {
	let sys = System::new();

	SysInfoResponse {
		name: sys.name(),
		os_version: sys.os_version(),
		host_name: sys.host_name(),
	}
}
