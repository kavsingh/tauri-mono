use std::collections::HashMap;
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

#[derive(Debug, Clone, Default, serde::Serialize, specta::Type, tauri_specta::Event)]
pub struct SystemStatsEvent(SystemStats);

struct CurrentStats {
	stats: SystemStats,
}

type EventSubscribersMap = HashMap<String, Sender<SystemStatsEvent>>;

#[derive(Default, Clone)]
struct EventSubscribers(Arc<Mutex<EventSubscribersMap>>);

impl EventSubscribers {
	pub fn subscribe(&self, subscriber: Sender<SystemStatsEvent>) -> Result<String, String> {
		let id = uuid::Uuid::new_v4().to_string();
		let mut subs = self.get_subscribers()?;

		subs.insert(id.clone(), subscriber);

		Ok(id)
	}

	pub fn publish(&self, stats: SystemStatsEvent) -> Result<(), String> {
		let subs = self.get_subscribers()?;

		subs.iter()
			.for_each(|(id, sub)| match sub.send(stats.clone()) {
				Ok(_) => (),
				Err(_) => log::error!("could not publish event to {id}"),
			});

		Ok(())
	}

	pub fn _unsubscribe(&self, id: &str) -> Result<(), String> {
		let mut subs = self.get_subscribers()?;

		subs.remove(id);

		Ok(())
	}

	fn get_subscribers(&self) -> Result<MutexGuard<'_, EventSubscribersMap>, String> {
		match self.0.lock() {
			Ok(subs) => Ok(subs),
			Err(_) => Err("could not get lock on subscribers".into()),
		}
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

					match subscribers_handle.publish(SystemStatsEvent(next_stats)) {
						Ok(_) => (),
						Err(e) => log::error!("could not publish stats event: {e}"),
					};
				} else {
					log::error!("could not get write lock for current stats");
				}

				std::thread::sleep(Duration::from_millis(1000));
			}
		});

		SystemStatsState {
			current_stats,
			event_subscribers,
		}
	}

	pub fn get_current(&self) -> Result<SystemStats, String> {
		match self.current_stats.read() {
			Ok(current) => Ok(current.stats.clone()),
			Err(_) => Err("could not read stats".into()),
		}
	}

	pub fn subscribe(&self) -> Result<(String, Receiver<SystemStatsEvent>), String> {
		let (tx, rx) = channel();

		match self.event_subscribers.subscribe(tx) {
			Ok(id) => Ok((id, rx)),
			Err(e) => Err(e),
		}
	}
}

impl Default for SystemStatsState {
	fn default() -> Self {
		SystemStatsState::new()
	}
}

#[derive(Default)]
pub struct ManagedSystemStatsState(Mutex<SystemStatsState>);

impl ManagedSystemStatsState {
	pub fn get_current(&self) -> Result<SystemStats, String> {
		self.get_state()?.get_current()
	}

	pub fn subscribe(&self) -> Result<(String, Receiver<SystemStatsEvent>), String> {
		self.get_state()?.subscribe()
	}

	fn get_state(&self) -> Result<MutexGuard<'_, SystemStatsState>, String> {
		match self.0.lock() {
			Ok(state) => Ok(state),
			Err(_) => Err("could get lock on stats state".into()),
		}
	}
}

#[tauri::command]
#[specta::specta]
pub fn get_system_stats(
	state: tauri::State<ManagedSystemStatsState>,
) -> Result<SystemStats, String> {
	state.get_current()
}

fn sample_system_stats() -> SystemStats {
	let mut sys = System::new();

	sys.refresh_memory();

	SystemStats {
		mem_total: Some(sys.total_memory().to_string()),
		mem_used: Some(sys.used_memory().to_string()),
		mem_available: Some(sys.available_memory().to_string()),
		sampled_at: chrono::Local::now().to_rfc3339_opts(chrono::SecondsFormat::Millis, true),
	}
}
