use std::{
	option,
	time::{Duration, SystemTime, UNIX_EPOCH},
};
use sysinfo::System;
use tauri::async_runtime::{channel, spawn, Receiver};

#[derive(Clone, serde::Serialize, specta::Type)]
#[serde(rename_all = "camelCase")]
pub struct SystemInfo {
	os_fullname: option::Option<String>,
	os_arch: option::Option<String>,
	mem_total: option::Option<String>,
	mem_available: option::Option<String>,
	sampled_at: String,
}

#[derive(Clone, serde::Serialize, specta::Type, tauri_specta::Event)]
pub struct SystemInfoEvent(SystemInfo);

// https://tauri.studio/en/docs/usage/howtos/command#complete-example
#[tauri::command]
#[specta::specta]
pub fn get_system_info() -> SystemInfo {
	create_system_info()
}

pub fn receive_system_info_events(period: Duration) -> Receiver<SystemInfoEvent> {
	let (tx, rx) = channel(1);

	spawn(async move {
		loop {
			tx.send(SystemInfoEvent(create_system_info()))
				.await
				.unwrap_or(());
			std::thread::sleep(period);
		}
	});

	rx
}

fn create_system_info() -> SystemInfo {
	let mut sys = System::new();

	sys.refresh_memory();

	let sampled_at = match SystemTime::now().duration_since(UNIX_EPOCH) {
		Ok(duration) => duration.as_millis(),
		Err(_) => 0,
	};

	SystemInfo {
		os_fullname: System::long_os_version(),
		os_arch: System::cpu_arch(),
		mem_total: Some(sys.total_memory().to_string()),
		mem_available: Some(sys.available_memory().to_string()),
		sampled_at: format!("{}", sampled_at),
	}
}
