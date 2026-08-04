use std::collections::HashMap;
use std::ops::Deref;
use std::sync::mpsc::{Receiver, Sender, channel};
use std::sync::{Arc, Mutex, MutexGuard, RwLock};
use std::time::Duration;

use sysinfo::System;

#[derive(Debug, Clone, Default, serde::Serialize, specta::Type)]
#[serde(rename_all = "camelCase")]
pub struct SystemStats {
	mem_total: Option<String>,
	mem_used: Option<String>,
	mem_available: Option<String>,
	sampled_at: String,
}

fn sample_system_stats() -> SystemStats {
	let mut sys = System::new();

	sys.refresh_memory();

	SystemStats {
		mem_total: Some(sys.total_memory().to_string()),
		mem_used: Some(sys.used_memory().to_string()),
		mem_available: Some(sys.available_memory().to_string()),
		sampled_at: chrono::Local::now()
			.to_rfc3339_opts(chrono::SecondsFormat::Millis, true),
	}
}

#[derive(
	Debug, Clone, Default, serde::Serialize, specta::Type, tauri_specta::Event,
)]
pub struct SystemStatsEvent(SystemStats);

struct CurrentStats {
	stats: SystemStats,
}

type EventSubscribersMap = HashMap<String, Sender<SystemStatsEvent>>;

#[derive(Default, Clone)]
struct EventSubscribers(Arc<Mutex<EventSubscribersMap>>);

impl EventSubscribers {
	pub fn subscribe(
		&self,
		subscriber: Sender<SystemStatsEvent>,
	) -> Result<String, String> {
		let id = uuid::Uuid::new_v4().to_string();

		self.get_subscribers()?.insert(id.clone(), subscriber);

		Ok(id)
	}

	pub fn publish(&self, stats: &SystemStatsEvent) -> Result<(), String> {
		{
			let subs = self.get_subscribers()?;

			for (id, sub) in subs.iter() {
				if let Err(err) = sub.send(stats.clone()) {
					log::error!("could not publish event to {id}: {err}");
				}
			}
		}

		Ok(())
	}

	pub fn _unsubscribe(&self, id: &str) -> Result<(), String> {
		self.get_subscribers()?.remove(id);

		Ok(())
	}

	fn get_subscribers(
		&self,
	) -> Result<MutexGuard<'_, EventSubscribersMap>, String> {
		self.lock().map_or_else(
			|e| Err(format!("could not get lock on subscribers {e}")),
			Ok,
		)
	}
}

impl Deref for EventSubscribers {
	type Target = Arc<Mutex<EventSubscribersMap>>;

	fn deref(&self) -> &Self::Target {
		&self.0
	}
}

pub struct SystemStatsState {
	current_stats: Arc<RwLock<CurrentStats>>,
	event_subscribers: EventSubscribers,
}

impl SystemStatsState {
	pub fn new() -> Self {
		let event_subscribers = EventSubscribers::default();
		let current_stats = Arc::new(RwLock::new(CurrentStats {
			stats: sample_system_stats(),
		}));

		let current_state_handle = current_stats.clone();
		let subscribers_handle = event_subscribers.clone();

		std::thread::spawn(move || {
			loop {
				if let Ok(mut current) = current_state_handle.write() {
					let next_stats = sample_system_stats();

					current.stats = next_stats.clone();

					if let Err(err) = subscribers_handle
						.publish(&SystemStatsEvent(next_stats))
					{
						log::error!("could not publish stats event: {err}");
					}
				} else {
					log::error!("could not get write lock for current stats");
				}

				std::thread::sleep(Duration::from_secs(1));
			}
		});

		Self {
			current_stats,
			event_subscribers,
		}
	}

	pub fn get_current(&self) -> Result<SystemStats, String> {
		self.current_stats.read().map_or_else(
			|e| Err(format!("could not read stats: {e}")),
			|current| Ok(current.stats.clone()),
		)
	}

	pub fn subscribe(
		&self,
	) -> Result<(String, Receiver<SystemStatsEvent>), String> {
		let (tx, rx) = channel();

		match self.event_subscribers.subscribe(tx) {
			Ok(id) => Ok((id, rx)),
			Err(e) => Err(e),
		}
	}
}

impl Default for SystemStatsState {
	fn default() -> Self {
		Self::new()
	}
}

#[derive(Default)]
pub struct ManagedSystemStatsState(Mutex<SystemStatsState>);

impl ManagedSystemStatsState {
	pub fn get_current(&self) -> Result<SystemStats, String> {
		self.get_state()?.get_current()
	}

	pub fn subscribe(
		&self,
	) -> Result<(String, Receiver<SystemStatsEvent>), String> {
		self.get_state()?.subscribe()
	}

	fn get_state(&self) -> Result<MutexGuard<'_, SystemStatsState>, String> {
		self.lock().map_or_else(
			|e| Err(format!("could not get lock on stats state: {e}")),
			Ok,
		)
	}
}

impl Deref for ManagedSystemStatsState {
	type Target = Mutex<SystemStatsState>;

	fn deref(&self) -> &Self::Target {
		&self.0
	}
}

#[tauri::command]
#[specta::specta]
#[allow(clippy::needless_pass_by_value)]
pub fn get_system_stats(
	state: tauri::State<ManagedSystemStatsState>,
) -> Result<SystemStats, String> {
	state.get_current()
}
