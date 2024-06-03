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
}

#[derive(Clone, serde::Serialize, specta::Type)]
#[serde(rename_all = "camelCase")]
pub struct SystemStats {
	mem_total: option::Option<String>,
	mem_available: option::Option<String>,
	sampled_at: String,
}

#[derive(Clone, serde::Serialize, specta::Type, tauri_specta::Event)]
pub struct SystemStatsEvent(SystemStats);

#[tauri::command]
#[specta::specta]
pub fn get_system_info() -> SystemInfo {
	SystemInfo {
		os_fullname: System::long_os_version(),
		os_arch: System::cpu_arch(),
	}
}

#[tauri::command]
#[specta::specta]
pub fn get_system_stats() -> SystemStats {
	sample_system_stats()
}

pub fn receive_system_stats_events(period: Duration) -> Receiver<SystemStatsEvent> {
	let (tx, rx) = channel(1);

	spawn(async move {
		loop {
			tx.send(SystemStatsEvent(sample_system_stats()))
				.await
				.unwrap_or(());
			std::thread::sleep(period);
		}
	});

	rx
}

fn sample_system_stats() -> SystemStats {
	let mut sys = System::new();

	sys.refresh_memory();

	let sampled_at = match SystemTime::now().duration_since(UNIX_EPOCH) {
		Ok(duration) => duration.as_millis(),
		Err(_) => 0,
	};

	SystemStats {
		mem_total: Some(sys.total_memory().to_string()),
		mem_available: Some(sys.available_memory().to_string()),
		sampled_at: format!("{}", sampled_at),
	}
}
