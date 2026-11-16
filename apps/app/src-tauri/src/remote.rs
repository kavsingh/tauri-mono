// Tauri's async command wrapper generates an unreachable branch for borrowed state.
#![allow(clippy::unreachable)]

use std::sync::Mutex;
use std::time::Duration;

use serde::Serialize;
use specta::Type;
use tauri::{
	AppHandle, Manager, State, WebviewUrl, WebviewWindow, WebviewWindowBuilder,
};
use tokio::sync::{Mutex as AsyncMutex, oneshot};
use uuid::Uuid;

use crate::frontend_cache::FrontendCache;
use crate::preferences::get_stored_theme_preference;

const CONNECT_TIMEOUT: Duration = Duration::from_secs(5);
const READY_TIMEOUT: Duration = Duration::from_secs(15);
const LOCAL_SCHEME: &str = "app-local://localhost/";

#[derive(Clone, Debug, Default, Serialize, Type)]
#[serde(rename_all = "camelCase")]
pub enum ConnectionMode {
	#[default]
	Connecting,
	Local,
	Remote,
	Failed,
}

#[derive(Clone, Debug, Default, Serialize, Type)]
#[serde(rename_all = "camelCase")]
pub struct ConnectionStatus {
	pub mode: ConnectionMode,
	pub retrying: bool,
	pub error: Option<String>,
}

struct PendingLoad {
	load_id: String,
	window_label: String,
	expected_build_id: Option<String>,
	sender: oneshot::Sender<()>,
}

#[derive(Default)]
pub struct RemoteState {
	connecting: AsyncMutex<()>,
	pending: Mutex<Option<PendingLoad>>,
	last_ready_build_id: Mutex<Option<String>>,
	status: Mutex<ConnectionStatus>,
}

impl RemoteState {
	fn acknowledge(
		&self,
		window_label: &str,
		load_id: &str,
		build_id: &str,
	) -> Result<(), String> {
		let mut pending =
			self.pending.lock().map_err(|error| error.to_string())?;

		let Some(expected) = pending.as_ref() else {
			return Err("The readiness signal is for an outdated load".into());
		};

		if expected.load_id != load_id || expected.window_label != window_label
		{
			return Err("The readiness signal is for an outdated load".into());
		}

		if expected
			.expected_build_id
			.as_deref()
			.is_some_and(|expected_id| expected_id != build_id)
		{
			return Err("The local frontend build ID is invalid".into());
		}

		if build_id.is_empty() || build_id.len() > 64 {
			return Err("The frontend build ID is invalid".into());
		}

		if let Some(expected) = pending.take() {
			*self
				.last_ready_build_id
				.lock()
				.map_err(|error| error.to_string())? =
				Some(build_id.to_string());
			expected
				.sender
				.send(())
				.map_err(|()| "The connection attempt has already ended")?;
		}

		drop(pending);

		Ok(())
	}

	fn set_status(
		&self,
		mode: ConnectionMode,
		retrying: bool,
		error: Option<String>,
	) -> Result<(), String> {
		*self.status.lock().map_err(|error| error.to_string())? =
			ConnectionStatus {
				mode,
				retrying,
				error,
			};
		Ok(())
	}
}

#[tauri::command]
#[specta::specta]
#[allow(clippy::too_many_lines)]
pub async fn connect_remote(
	app: AppHandle,
	window: WebviewWindow,
	state: State<'_, RemoteState>,
	cache: State<'_, FrontendCache>,
) -> Result<(), String> {
	let is_startup = window.label() == "loading";

	if !is_startup && window.label() != "local" {
		return Err(
			"Only the connection screen or local frontend can retry".into()
		);
	}

	let _guard = state
		.connecting
		.try_lock()
		.map_err(|_| "A connection attempt is already in progress")?;

	state.set_status(
		if is_startup {
			ConnectionMode::Connecting
		} else {
			ConnectionMode::Local
		},
		true,
		None,
	)?;

	let config = app
		.config()
		.app
		.windows
		.iter()
		.find(|window| window.label == "main")
		.ok_or("No main window configuration available")?;

	let WebviewUrl::External(remote_url) = &config.url else {
		return Err("The main window must have a remote URL".into());
	};

	let remote_url = remote_url.clone();

	match open_remote(&app, config, &state, &remote_url).await {
		Ok((remote_window, build_id)) => {
			if let Err(error) = handoff(&remote_window, &window) {
				let _ = remote_window.destroy();
				state.set_status(
					if is_startup {
						ConnectionMode::Failed
					} else {
						ConnectionMode::Local
					},
					false,
					Some(error.clone()),
				)?;
				return Err(error);
			}
			state.set_status(ConnectionMode::Remote, false, None)?;

			if remote_url.scheme() == "https"
				&& build_id != "development"
				&& is_release_build_id(&build_id)
			{
				let app = app.clone();
				let remote_url = remote_url.clone();

				tauri::async_runtime::spawn(async move {
					if let Err(error) = app
						.state::<FrontendCache>()
						.update_from_remote(&remote_url, &build_id)
						.await
					{
						log::warn!(
							"Could not update verified frontend cache: {error}"
						);
					}
				});
			}

			Ok(())
		}

		Err(remote_error) if is_startup => {
			log::warn!(
				"Remote frontend could not be loaded; trying local fallback"
			);

			state.set_status(
				ConnectionMode::Local,
				true,
				Some(remote_error),
			)?;

			match open_local(&app, &window, config, &state, &cache).await {
				Ok(local_window) => {
					if let Err(error) = handoff(&local_window, &window) {
						let _ = local_window.destroy();

						state.set_status(
							ConnectionMode::Failed,
							false,
							Some(error.clone()),
						)?;

						return Err(error);
					}

					state.set_status(
						ConnectionMode::Local,
						false,
						Some("Remote frontend is unavailable".into()),
					)?;

					Ok(())
				}

				Err(_cached_error) if cache.is_cached()? => {
					log::warn!(
						"Cached frontend did not become ready; trying embedded baseline"
					);

					cache.use_embedded_baseline(&app)?;

					match open_local(&app, &window, config, &state, &cache)
						.await
					{
						Ok(local_window) => {
							if let Err(error) = handoff(&local_window, &window)
							{
								let _ = local_window.destroy();
								state.set_status(
									ConnectionMode::Failed,
									false,
									Some(error.clone()),
								)?;
								return Err(error);
							}
							state.set_status(
								ConnectionMode::Local,
								false,
								Some("Remote frontend is unavailable".into()),
							)?;
							Ok(())
						}
						Err(baseline_error) => {
							let error = format!(
								"Could not load the embedded frontend: {baseline_error}"
							);
							log::error!(
								"Local frontend readiness failed; connection screen remains visible"
							);
							state.set_status(
								ConnectionMode::Failed,
								false,
								Some(error.clone()),
							)?;
							Err(error)
						}
					}
				}

				Err(error) => {
					log::error!(
						"Local frontend readiness failed; connection screen remains visible"
					);

					state.set_status(
						ConnectionMode::Failed,
						false,
						Some(error.clone()),
					)?;

					Err(error)
				}
			}
		}

		Err(error) => {
			state.set_status(
				ConnectionMode::Local,
				false,
				Some(error.clone()),
			)?;
			Err(error)
		}
	}
}

async fn open_remote(
	app: &AppHandle,
	config: &tauri::utils::config::WindowConfig,
	state: &RemoteState,
	remote_url: &tauri::Url,
) -> Result<(WebviewWindow, String), String> {
	check_remote(remote_url, CONNECT_TIMEOUT).await?;
	load_window(
		app,
		config,
		"main",
		WebviewUrl::External(remote_url.clone()),
		state,
		None,
	)
	.await
}

async fn open_local(
	app: &AppHandle,
	_current_window: &WebviewWindow,
	config: &tauri::utils::config::WindowConfig,
	state: &RemoteState,
	cache: &FrontendCache,
) -> Result<WebviewWindow, String> {
	let build_id = cache.active_build_id()?;
	let url = LOCAL_SCHEME
		.parse()
		.map_err(|_| "Could not create local frontend URL")?;
	let (window, _) = load_window(
		app,
		config,
		"local",
		WebviewUrl::External(url),
		state,
		Some(build_id),
	)
	.await?;
	Ok(window)
}

async fn check_remote(
	url: &tauri::Url,
	timeout: Duration,
) -> Result<(), String> {
	let host = url.host_str().unwrap_or_default();

	if (!matches!(url.scheme(), "http" | "https"))
		|| (url.scheme() != "https"
			&& !matches!(host, "localhost" | "127.0.0.1" | "::1" | "[::1]"))
		|| !url.username().is_empty()
		|| url.password().is_some()
	{
		return Err("Remote frontend URL is not trusted".into());
	}

	let client = reqwest::Client::builder()
		.timeout(timeout)
		.redirect(reqwest::redirect::Policy::none())
		.build()
		.map_err(|_| "Could not create remote connection client")?;

	let response = client
		.get(url.clone())
		.send()
		.await
		.map_err(|_| "Remote frontend is unavailable")?;

	if !response.status().is_success()
		|| response.url().origin() != url.origin()
	{
		return Err("Remote frontend is unavailable".into());
	}

	Ok(())
}

async fn load_window(
	app: &AppHandle,
	config: &tauri::utils::config::WindowConfig,
	label: &str,
	url: WebviewUrl,
	state: &RemoteState,
	expected_build_id: Option<String>,
) -> Result<(WebviewWindow, String), String> {
	let load_id = Uuid::new_v4().to_string();
	let (sender, receiver) = oneshot::channel();

	*state
		.last_ready_build_id
		.lock()
		.map_err(|error| error.to_string())? = None;

	*state.pending.lock().map_err(|error| error.to_string())? =
		Some(PendingLoad {
			load_id: load_id.clone(),
			window_label: label.to_string(),
			expected_build_id,
			sender,
		});

	let mut candidate_config = config.clone();

	candidate_config.label = label.into();
	candidate_config.url = url;
	candidate_config.visible = false;

	let Ok(candidate) =
		WebviewWindowBuilder::from_config(app, &candidate_config).and_then(
			|builder| {
				builder
					.initialization_script(format!(
						"window.__REMOTE_LOAD_ID__ = '{load_id}';"
					))
					.theme(get_stored_theme_preference(app).into())
					.build()
			},
		)
	else {
		*state.pending.lock().map_err(|error| error.to_string())? = None;

		return Err("Could not create frontend window".into());
	};

	let ready = tokio::time::timeout(READY_TIMEOUT, receiver).await;

	*state.pending.lock().map_err(|error| error.to_string())? = None;

	let build_id = match ready {
		Ok(Ok(())) => {
			let Some(build_id) = state
				.last_ready_build_id
				.lock()
				.map_err(|error| error.to_string())?
				.take()
			else {
				let _ = candidate.destroy();
				return Err("Frontend did not identify its build".into());
			};
			build_id
		}
		Ok(Err(_)) => {
			let _ = candidate.destroy();
			return Err("Frontend readiness signal failed".into());
		}
		Err(_) => {
			let _ = candidate.destroy();
			return Err("Frontend did not become ready in time".into());
		}
	};

	Ok((candidate, build_id))
}

fn handoff(
	candidate: &WebviewWindow,
	current: &WebviewWindow,
) -> Result<(), String> {
	candidate
		.show()
		.map_err(|_| "Could not show the ready frontend")?;
	current
		.destroy()
		.map_err(|_| "Could not close the previous frontend window")?;
	#[cfg(all(debug_assertions, not(feature = "e2e")))]
	if candidate.label() == "main" {
		candidate.open_devtools();
	}
	Ok(())
}

#[tauri::command]
#[specta::specta]
#[allow(clippy::needless_pass_by_value)]
pub fn remote_ready(
	window: WebviewWindow,
	state: State<'_, RemoteState>,
	load_id: String,
	build_id: String,
) -> Result<(), String> {
	if window.label() != "main" && window.label() != "local" {
		return Err("Only a frontend candidate can signal readiness".into());
	}
	state.acknowledge(window.label(), &load_id, &build_id)
}

#[tauri::command]
#[specta::specta]
#[allow(clippy::needless_pass_by_value)]
pub fn get_connection_status(
	state: State<'_, RemoteState>,
) -> Result<ConnectionStatus, String> {
	state
		.status
		.lock()
		.map(|status| status.clone())
		.map_err(|error| error.to_string())
}

fn is_release_build_id(build_id: &str) -> bool {
	!build_id.is_empty()
		&& build_id.len() <= 64
		&& build_id.bytes().all(|byte| {
			byte.is_ascii_lowercase() || byte.is_ascii_digit() || byte == b'-'
		})
}

#[cfg(test)]
mod tests {
	use std::io::{Read, Write};
	use std::net::TcpListener;
	use std::thread;

	use super::*;

	#[test]
	fn readiness_rejects_stale_loads_and_wrong_builds() {
		let state = RemoteState::default();
		let (sender, mut receiver) = oneshot::channel();
		*state.pending.lock().unwrap() = Some(PendingLoad {
			load_id: "current".into(),
			window_label: "local".into(),
			expected_build_id: Some("right".into()),
			sender,
		});
		assert!(state.acknowledge("local", "old", "right").is_err());
		assert!(state.acknowledge("local", "current", "wrong").is_err());
		assert!(receiver.try_recv().is_err());
		state.acknowledge("local", "current", "right").unwrap();
		assert_eq!(receiver.try_recv(), Ok(()));
		assert!(state.acknowledge("local", "current", "right").is_err());
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
