// Tauri's async command wrapper generates an unreachable branch for borrowed state.
#![allow(clippy::unreachable)]

use std::sync::Mutex;
use std::time::Duration;

use tauri::{
	AppHandle, State, WebviewUrl, WebviewWindow, WebviewWindowBuilder,
};
use tokio::sync::{Mutex as AsyncMutex, oneshot};
use uuid::Uuid;

use crate::preferences::get_stored_theme_preference;

const CONNECT_TIMEOUT: Duration = Duration::from_secs(5);
const READY_TIMEOUT: Duration = Duration::from_secs(15);

#[derive(Default)]
pub struct RemoteState {
	connecting: AsyncMutex<()>,
	pending: Mutex<Option<(String, oneshot::Sender<()>)>>,
}

impl RemoteState {
	fn acknowledge(&self, load_id: &str) -> Result<(), String> {
		let mut pending =
			self.pending.lock().map_err(|error| error.to_string())?;

		if let Some((expected, _)) = pending.as_ref() {
			if expected != load_id {
				return Err(
					"The readiness signal is for an outdated load".into()
				);
			}
			if let Some((_, sender)) = pending.take() {
				sender
					.send(())
					.map_err(|()| "The connection attempt has already ended")?;
			}
		}

		Ok(())
	}
}

#[tauri::command]
#[specta::specta]
pub async fn connect_remote(
	app: AppHandle,
	window: WebviewWindow,
	state: State<'_, RemoteState>,
) -> Result<(), String> {
	if window.label() != "loading" {
		return Err("Only the connection screen can start a connection".into());
	}

	let _ = state
		.connecting
		.try_lock()
		.map_err(|_| "A connection attempt is already in progress")?;
	let result = connect(&app, &window, &state).await;

	if let Err(error) = &result {
		log::error!("Could not load remote frontend: {error}");
	}

	result
}

async fn connect(
	app: &AppHandle,
	loading: &WebviewWindow,
	state: &RemoteState,
) -> Result<(), String> {
	let config = app
		.config()
		.app
		.windows
		.iter()
		.find(|window| window.label == "main")
		.ok_or("No main window configuration available")?;
	let WebviewUrl::External(url) = &config.url else {
		return Err("The main window must have a remote URL".into());
	};

	check_remote(url, CONNECT_TIMEOUT).await?;

	let load_id = Uuid::new_v4().to_string();
	let (sender, receiver) = oneshot::channel();
	*state.pending.lock().map_err(|error| error.to_string())? =
		Some((load_id.clone(), sender));

	let result = load_window(app, loading, config, &load_id, receiver).await;
	*state.pending.lock().map_err(|error| error.to_string())? = None;
	result
}

async fn check_remote(
	url: &tauri::Url,
	timeout: Duration,
) -> Result<(), String> {
	let client = reqwest::Client::builder()
		.timeout(timeout)
		.build()
		.map_err(|error| format!("Could not create HTTP client: {error}"))?;
	client
		.get(url.clone())
		.send()
		.await
		.and_then(reqwest::Response::error_for_status)
		.map_err(|error| format!("Remote frontend is unavailable: {error}"))?;

	Ok(())
}

async fn load_window(
	app: &AppHandle,
	loading: &WebviewWindow,
	config: &tauri::utils::config::WindowConfig,
	load_id: &str,
	receiver: oneshot::Receiver<()>,
) -> Result<(), String> {
	let main = WebviewWindowBuilder::from_config(app, config)
		.map_err(|error| error.to_string())?
		.initialization_script(format!(
			"window.__REMOTE_LOAD_ID__ = '{load_id}';"
		))
		.theme(get_stored_theme_preference(app).into())
		.build()
		.map_err(|error| {
			format!("Could not create the remote window: {error}")
		})?;

	let result = match tokio::time::timeout(READY_TIMEOUT, receiver).await {
		Ok(Ok(())) => main
			.show()
			.and_then(|()| loading.destroy())
			.map_err(|error| format!("Could not show the app: {error}")),
		Ok(Err(error)) => {
			Err(format!("Remote readiness signal failed: {error}"))
		}
		Err(_) => Err("Remote frontend did not become ready in time".into()),
	};
	if let Err(error) = result {
		if let Err(close_error) = main.destroy() {
			return Err(format!(
				"{error}; could not close the remote window: {close_error}"
			));
		}
		return Err(error);
	}
	#[cfg(all(debug_assertions, not(feature = "e2e")))]
	main.open_devtools();

	Ok(())
}

#[tauri::command]
#[specta::specta]
#[allow(clippy::needless_pass_by_value)]
pub fn remote_ready(
	window: WebviewWindow,
	state: State<'_, RemoteState>,
	load_id: String,
) -> Result<(), String> {
	if window.label() != "main" {
		return Err("Only the remote window can signal readiness".into());
	}

	state.acknowledge(&load_id)
}

#[cfg(test)]
#[allow(clippy::expect_used, clippy::unwrap_used)]
mod tests {
	use std::io::{Read, Write};
	use std::net::TcpListener;
	use std::thread;

	use super::*;

	#[test]
	fn readiness_rejects_stale_loads() {
		let state = RemoteState::default();
		let (sender, mut receiver) = oneshot::channel();
		*state.pending.lock().unwrap() = Some(("current".into(), sender));
		assert!(state.acknowledge("old").is_err());
		assert!(receiver.try_recv().is_err());
		state.acknowledge("current").unwrap();
		assert_eq!(receiver.try_recv(), Ok(()));
		assert!(state.acknowledge("current").is_ok());
	}

	#[test]
	fn readiness_reports_expired_attempts() {
		let state = RemoteState::default();
		let (sender, receiver) = oneshot::channel();
		drop(receiver);
		*state.pending.lock().unwrap() = Some(("current".into(), sender));
		assert!(state.acknowledge("current").is_err());
	}

	#[test]
	fn probe_accepts_success_and_rejects_http_errors() {
		for (status, success) in [("200 OK", true), ("503 Unavailable", false)]
		{
			let listener = TcpListener::bind("127.0.0.1:0").unwrap();
			let address = listener.local_addr().unwrap();
			let server = thread::spawn(move || {
				let (mut stream, _) = listener.accept().unwrap();
				let mut request = [0; 1024];
				assert!(stream.read(&mut request).unwrap() > 0);
				write!(
					stream,
					"HTTP/1.1 {status}\r\nContent-Length: 0\r\n\r\n"
				)
				.unwrap();
			});
			let url = format!("http://{address}").parse().unwrap();
			let result = tauri::async_runtime::block_on(check_remote(
				&url,
				Duration::from_secs(2),
			));
			assert_eq!(result.is_ok(), success);
			server.join().unwrap();
		}
	}

	#[test]
	fn probe_times_out_when_the_server_does_not_respond() {
		let listener = TcpListener::bind("127.0.0.1:0").unwrap();
		let address = listener.local_addr().unwrap();
		let server = thread::spawn(move || {
			let (_stream, _) = listener.accept().unwrap();
			thread::sleep(Duration::from_millis(200));
		});
		let url = format!("http://{address}").parse().unwrap();
		let result = tauri::async_runtime::block_on(check_remote(
			&url,
			Duration::from_millis(50),
		));
		assert!(result.is_err());
		server.join().unwrap();
	}
}
