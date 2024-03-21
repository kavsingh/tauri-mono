use std::option;
use sysinfo::{System, SystemExt};
use tauri::async_runtime::{channel, spawn, Receiver};

#[derive(Clone, Debug, serde::Serialize, specta::Type, ts_rs::TS)]
#[serde(rename_all = "camelCase")]
#[ts(
	export,
	export_to = "../src/__generated__/bindings/system-info-event.ts"
)]
pub struct SystemInfo {
	os_fullname: option::Option<String>,
	os_version: option::Option<String>,
	os_arch: option::Option<String>,
	mem_total: option::Option<String>,
	mem_available: option::Option<String>,
}

// https://tauri.studio/en/docs/usage/howtos/command#complete-example
#[tauri::command]
#[specta::specta]
pub fn get_system_info() -> SystemInfo {
	create_system_info()
}

pub fn subscribe_system_info_events() -> Receiver<SystemInfo> {
	let (tx, rx) = channel(1);

	spawn(async move {
		loop {
			let sys = create_system_info();

			tx.send(sys).await.unwrap();
			std::thread::sleep(std::time::Duration::from_secs(2));
		}
	});

	rx
}

fn create_system_info() -> SystemInfo {
	let mut sys = System::new();

	sys.refresh_all();

	SystemInfo {
		os_fullname: sys.long_os_version(),
		os_version: sys.os_version(),
		// TODO: get the actual runtime arch somehow
		os_arch: Some(std::env::consts::ARCH.to_string()),
		mem_total: Some(sys.total_memory().to_string()),
		mem_available: Some(sys.available_memory().to_string()),
	}
}
