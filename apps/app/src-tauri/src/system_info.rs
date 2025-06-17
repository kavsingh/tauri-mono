use std::sync::LazyLock;

use sysinfo::System;

static OS_ARCH: LazyLock<String> = LazyLock::new(System::cpu_arch);
static OS_FULLNAME: LazyLock<String> =
	LazyLock::new(|| System::long_os_version().unwrap_or_default());

#[derive(Clone, serde::Serialize, specta::Type)]
#[serde(rename_all = "camelCase")]
pub struct SystemInfo {
	os_fullname: &'static str,
	os_arch: &'static str,
}

#[tauri::command]
#[specta::specta]
pub fn get_system_info() -> SystemInfo {
	SystemInfo {
		os_fullname: &OS_FULLNAME,
		os_arch: &OS_ARCH,
	}
}
