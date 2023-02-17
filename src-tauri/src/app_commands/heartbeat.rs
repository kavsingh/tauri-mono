use serde;
use std::thread;
use std::time::{Duration, SystemTime};
use tauri::Window;
use ts_rs;

#[derive(Clone, serde::Serialize, ts_rs::TS)]
#[serde(rename_all = "camelCase")]
#[ts(export, export_to = "bindings/heartbeat-event.ts")]
pub struct HeartbeatEvent {
	message: String,
	timestamp: u128,
}

// init a background process on the command, and emit periodic events only to the window that used the command
#[tauri::command]
pub fn init_heartbeat(window: Window) -> Result<(), String> {
	let interval = Duration::new(3, 0);

	std::thread::spawn(move || loop {
		let since_epoch = SystemTime::now()
			.duration_since(SystemTime::UNIX_EPOCH)
			.unwrap();

		window
			.emit(
				"heartbeat",
				HeartbeatEvent {
					message: "OK".into(),
					timestamp: since_epoch.as_millis(),
				},
			)
			.unwrap();

		thread::sleep(interval);
	});

	Ok(())
}
