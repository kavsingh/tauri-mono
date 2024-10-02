use std::option;

use sysinfo::System;

#[derive(Clone, serde::Serialize, specta::Type)]
#[serde(rename_all = "camelCase")]
pub struct SystemInfo {
	os_fullname: option::Option<String>,
	os_arch: option::Option<String>,
}

#[tauri::command]
#[specta::specta]
pub fn get_system_info() -> SystemInfo {
	SystemInfo {
		os_fullname: System::long_os_version(),
		os_arch: System::cpu_arch(),
	}
}
