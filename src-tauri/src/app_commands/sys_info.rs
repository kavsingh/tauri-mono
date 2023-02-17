use serde;
use std::option;
use sysinfo::{System, SystemExt};
use ts_rs;

#[derive(serde::Serialize, ts_rs::TS)]
#[serde(rename_all = "camelCase")]
#[ts(export, export_to = "bindings/sys-info-response.ts")]
pub struct SysInfoResponse {
	name: option::Option<String>,
	os_version: option::Option<String>,
	host_name: option::Option<String>,
}

// https://tauri.studio/en/docs/usage/howtos/command#complete-example
#[tauri::command]
pub fn get_sys_info() -> SysInfoResponse {
	let sys = System::new();

	SysInfoResponse {
		name: sys.name(),
		os_version: sys.os_version(),
		host_name: sys.host_name(),
	}
}
