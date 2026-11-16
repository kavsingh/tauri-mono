use std::collections::HashSet;
use std::fmt::Write as _;
use std::fs;
use std::io::Write;
use std::ops::Add;
use std::path::{Component, Path, PathBuf};
use std::sync::{Mutex, RwLock};
use std::time::Duration;

use base64::Engine;
use base64::engine::general_purpose::STANDARD as BASE64;
use ed25519_dalek::{Signature, VerifyingKey};
use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};
use tauri::http::{self, Response, StatusCode};
use tauri::{AppHandle, Manager, UriSchemeContext};
use tokio::io::AsyncWriteExt;
use tokio::sync::Mutex as AsyncMutex;
use uuid::Uuid;

const COMPATIBILITY_VERSION: u32 = 1;
const MAX_MANIFEST_SIZE: usize = 1024 * 1024;
const MAX_FILE_COUNT: usize = 10_000;
const MAX_FILE_SIZE: u64 = 50 * 1024 * 1024;
const MAX_TOTAL_SIZE: u64 = 500 * 1024 * 1024;
const REQUEST_TIMEOUT: Duration = Duration::from_secs(60);
const MAX_DOWNLOAD_DURATION: Duration = Duration::from_mins(10);

#[derive(Clone, Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
struct ReleaseFile {
	path: String,
	size: u64,
	sha256: String,
}

#[derive(Clone, Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
struct ReleaseManifest {
	schema_version: u32,
	build_id: String,
	compatibility_version: u32,
	entry_point: String,
	files: Vec<ReleaseFile>,
	#[serde(default)]
	signature: String,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct SignedPayload<'a> {
	schema_version: u32,
	build_id: &'a str,
	compatibility_version: u32,
	entry_point: &'a str,
	files: &'a [ReleaseFile],
}

#[derive(Clone, Debug, Default)]
enum ActiveSource {
	Embedded {
		build_id: String,
	},
	Cached {
		build_id: String,
		directory: PathBuf,
		manifest: ReleaseManifest,
	},
	#[default]
	Unavailable,
}

#[derive(Default)]
pub struct FrontendCache {
	root: Mutex<Option<PathBuf>>,
	active: RwLock<ActiveSource>,
	update_lock: AsyncMutex<()>,
}

impl FrontendCache {
	pub fn initialize(&self, app: &AppHandle) -> Result<(), String> {
		let root = app
			.path()
			.app_data_dir()
			.map_err(|error| {
				format!("Could not find app data directory: {error}")
			})?
			.join("frontend");
		fs::create_dir_all(root.join("releases")).map_err(|error| {
			format!("Could not initialize frontend cache: {error}")
		})?;
		cleanup_staging(&root);

		let embedded_id = embedded_build_id(app).unwrap_or_default();
		let mut source = if embedded_id.is_empty() {
			ActiveSource::Unavailable
		} else {
			ActiveSource::Embedded {
				build_id: embedded_id,
			}
		};

		let active_id = read_build_pointer(&root.join("active-version"));
		let previous_id = read_build_pointer(&root.join("previous-version"));
		for build_id in active_id.into_iter().chain(previous_id) {
			let directory = root.join("releases").join(&build_id);
			match validate_release_directory(&directory, Some(&build_id)) {
				Ok(manifest) => {
					source = ActiveSource::Cached {
						build_id: manifest.build_id.clone(),
						directory,
						manifest,
					};
					if read_build_pointer(&root.join("active-version"))
						.as_deref()
						!= Some(&build_id)
					{
						write_pointer(&root.join("active-version"), &build_id)?;
					}
					break;
				}
				Err(error) => {
					log::warn!(
						"Ignoring invalid cached frontend release: {error}"
					);
					quarantine_release(&root, &build_id);
				}
			}
		}

		*self.root.lock().map_err(|error| error.to_string())? = Some(root);
		*self.active.write().map_err(|error| error.to_string())? = source;
		Ok(())
	}

	pub fn active_build_id(&self) -> Result<String, String> {
		match &*self.active.read().map_err(|error| error.to_string())? {
			ActiveSource::Embedded { build_id }
			| ActiveSource::Cached { build_id, .. } => Ok(build_id.clone()),
			ActiveSource::Unavailable => {
				Err("No valid local frontend is available".into())
			}
		}
	}

	pub fn is_cached(&self) -> Result<bool, String> {
		Ok(matches!(
			&*self.active.read().map_err(|error| error.to_string())?,
			ActiveSource::Cached { .. }
		))
	}

	pub fn use_embedded_baseline(
		&self,
		app: &AppHandle,
	) -> Result<String, String> {
		let build_id = embedded_build_id(app)
			.ok_or("The embedded frontend is unavailable or incompatible")?;
		let root = self.root.lock().map_err(|error| error.to_string())?.clone();
		if let Some(root) = root {
			if let ActiveSource::Cached { build_id, .. } =
				&*self.active.read().map_err(|error| error.to_string())?
			{
				quarantine_release(&root, build_id);
			}
			for pointer in ["active-version", "previous-version"] {
				if let Err(error) = fs::remove_file(root.join(pointer))
					&& error.kind() != std::io::ErrorKind::NotFound
				{
					return Err(format!(
						"Could not reset frontend cache pointer: {error}"
					));
				}
			}
		}
		*self.active.write().map_err(|error| error.to_string())? =
			ActiveSource::Embedded {
				build_id: build_id.clone(),
			};
		Ok(build_id)
	}

	#[allow(clippy::too_many_lines)]
	pub async fn update_from_remote(
		&self,
		remote_url: &tauri::Url,
		expected_build_id: &str,
	) -> Result<(), String> {
		if !is_valid_build_id(expected_build_id)
			|| expected_build_id == "development"
			|| remote_url.scheme() != "https"
		{
			return Err("Frontend release is not eligible for caching".into());
		}

		let _guard = self.update_lock.lock().await;
		let root = self
			.root
			.lock()
			.map_err(|error| error.to_string())?
			.clone()
			.ok_or("Frontend cache is not initialized")?;
		let client = reqwest::Client::builder()
			.redirect(reqwest::redirect::Policy::none())
			.timeout(REQUEST_TIMEOUT)
			.build()
			.map_err(|_| "Could not create release download client")?;
		let deadline = tokio::time::Instant::now().add(MAX_DOWNLOAD_DURATION);
		let manifest_url =
			release_url(remote_url, expected_build_id, "manifest.json")?;
		let manifest_bytes = download_bounded(
			&client,
			&manifest_url,
			MAX_MANIFEST_SIZE,
			remaining_time(deadline)?,
		)
		.await?;
		let manifest: ReleaseManifest = serde_json::from_slice(&manifest_bytes)
			.map_err(|_| "Release manifest is invalid")?;
		if manifest.build_id != expected_build_id {
			return Err(
				"Release manifest build ID does not match the loaded frontend"
					.into(),
			);
		}
		verify_manifest_signature(&manifest)?;
		validate_manifest(&manifest)?;

		let staging = root.join(format!("staging-{}", Uuid::new_v4()));
		tokio::fs::create_dir(&staging)
			.await
			.map_err(|_| "Could not create frontend staging directory")?;

		let download_result = async {
			let mut total = 0_u64;

			for file in &manifest.files {
				let timeout = remaining_time(deadline)?;
				let file_size: usize =
					file.size.try_into().map_err(|_| "Invalid file size")?;

				total = total
					.checked_add(file.size)
					.filter(|size| *size <= MAX_TOTAL_SIZE)
					.ok_or("Release exceeds the total size limit")?;

				let url =
					release_url(remote_url, expected_build_id, &file.path)?;
				let bytes =
					download_bounded(&client, &url, file_size, timeout).await?;

				if bytes.len() != file_size || sha256_hex(&bytes) != file.sha256
				{
					return Err(
						"Release file failed size or hash validation".into()
					);
				}

				let destination = join_manifest_path(&staging, &file.path)?;
				let parent = destination
					.parent()
					.ok_or("Release file path is invalid")?;

				tokio::fs::create_dir_all(parent)
					.await
					.map_err(|_| "Could not create frontend staging path")?;

				let mut output = tokio::fs::OpenOptions::new()
					.write(true)
					.create_new(true)
					.open(&destination)
					.await
					.map_err(|_| "Could not write frontend staging file")?;

				output
					.write_all(&bytes)
					.await
					.map_err(|_| "Could not write frontend staging file")?;

				output
					.sync_all()
					.await
					.map_err(|_| "Could not persist frontend staging file")?;
			}

			let mut manifest_file = tokio::fs::OpenOptions::new()
				.write(true)
				.create_new(true)
				.open(staging.join("manifest.json"))
				.await
				.map_err(|_| "Could not write staged frontend manifest")?;

			manifest_file
				.write_all(&manifest_bytes)
				.await
				.map_err(|_| "Could not write staged frontend manifest")?;

			manifest_file
				.sync_all()
				.await
				.map_err(|_| "Could not persist staged frontend manifest")?;

			Ok::<(), String>(())
		}
		.await;

		if let Err(error) = download_result {
			let _ = tokio::fs::remove_dir_all(&staging).await;
			return Err(error);
		}
		let manifest =
			match validate_release_directory(&staging, Some(expected_build_id))
			{
				Ok(manifest) => manifest,
				Err(error) => {
					let _ = tokio::fs::remove_dir_all(&staging).await;
					return Err(error);
				}
			};
		if let Err(error) = sync_directory_tree(&staging) {
			let _ = tokio::fs::remove_dir_all(&staging).await;
			return Err(error);
		}

		let releases = root.join("releases");
		let destination = releases.join(expected_build_id);
		if destination.exists() {
			if let Err(error) = validate_release_directory(
				&destination,
				Some(expected_build_id),
			) {
				let _ = tokio::fs::remove_dir_all(&staging).await;
				return Err(error);
			}
			let _ = tokio::fs::remove_dir_all(&staging).await;
		} else {
			tokio::fs::rename(&staging, &destination)
				.await
				.map_err(|_| "Could not install verified frontend release")?;
			sync_directory(&releases)
				.map_err(|_| "Could not persist installed frontend release")?;
		}

		let old_id = read_build_pointer(&root.join("active-version"));

		if let Some(old_id) =
			old_id.as_deref().filter(|id| *id != expected_build_id)
		{
			write_pointer(&root.join("previous-version"), old_id)?;
		}

		write_pointer(&root.join("active-version"), expected_build_id)?;

		*self.active.write().map_err(|error| error.to_string())? =
			ActiveSource::Cached {
				build_id: expected_build_id.to_string(),
				directory: destination,
				manifest,
			};

		cleanup_old_releases(&root, expected_build_id);

		Ok(())
	}

	pub fn serve(
		&self,
		app: &AppHandle,
		request_path: &str,
	) -> Response<Vec<u8>> {
		let Ok(path) = request_path_for_asset(request_path) else {
			return response(
				StatusCode::BAD_REQUEST,
				"text/plain",
				b"Bad path",
			);
		};

		let source = match self.active.read() {
			Ok(source) => source.clone(),
			Err(_) => {
				return response(
					StatusCode::INTERNAL_SERVER_ERROR,
					"text/plain",
					b"Frontend unavailable",
				);
			}
		};

		let result = match source {
			ActiveSource::Cached {
				directory,
				manifest,
				..
			} => read_cached_asset(&directory, &manifest, &path).or_else(|()| {
				if is_spa_route(&path) {
					read_cached_asset(
						&directory,
						&manifest,
						Path::new("index.html"),
					)
				} else {
					Err(())
				}
			}),
			ActiveSource::Embedded { .. } => read_embedded_asset(app, &path)
				.or_else(|()| {
					if is_spa_route(&path) {
						read_embedded_asset(app, Path::new("index.html"))
					} else {
						Err(())
					}
				}),
			ActiveSource::Unavailable => Err(()),
		};

		match result {
			Ok((bytes, mime_type)) => Response::builder()
				.status(StatusCode::OK)
				.header(http::header::CONTENT_TYPE, mime_type)
				.header(http::header::CACHE_CONTROL, "no-cache")
				.header("X-Content-Type-Options", "nosniff")
				.body(bytes)
				.unwrap_or_else(|_| {
					response(
						StatusCode::INTERNAL_SERVER_ERROR,
						"text/plain",
						b"Frontend unavailable",
					)
				}),
			Err(()) => {
				response(StatusCode::NOT_FOUND, "text/plain", b"Not found")
			}
		}
	}
}

#[allow(clippy::needless_pass_by_value)]
pub fn serve_protocol(
	context: UriSchemeContext<'_, tauri::Wry>,
	request: http::Request<Vec<u8>>,
) -> Response<Vec<u8>> {
	if context.webview_label() != "local" {
		return response(
			StatusCode::FORBIDDEN,
			"text/plain",
			b"Local frontend protocol is restricted",
		);
	}

	let Some(cache) = context.app_handle().try_state::<FrontendCache>() else {
		return response(
			StatusCode::SERVICE_UNAVAILABLE,
			"text/plain",
			b"Frontend unavailable",
		);
	};

	cache.serve(context.app_handle(), request.uri().path())
}

fn embedded_build_id(app: &AppHandle) -> Option<String> {
	let asset = app.asset_resolver().get("ui/manifest.json".into())?;
	let manifest: ReleaseManifest =
		serde_json::from_slice(asset.bytes()).ok()?;
	(validate_manifest(&manifest).ok())?;
	Some(manifest.build_id)
}

async fn download_bounded(
	client: &reqwest::Client,
	url: &tauri::Url,
	max_size: usize,
	timeout: Duration,
) -> Result<Vec<u8>, String> {
	let max_size: u64 = max_size.try_into().map_err(|_| "Invalid max size")?;

	if max_size > MAX_TOTAL_SIZE {
		return Err("Release exceeds the size limit".into());
	}

	tokio::time::timeout(timeout, async {
		let mut response = client
			.get(url.clone())
			.send()
			.await
			.map_err(|_| "Could not download frontend release")?;

		if !response.status().is_success() {
			return Err("Frontend release server returned an error".into());
		}

		if response.url().origin() != url.origin() {
			return Err(
				"Frontend release redirected to an unexpected origin".into()
			);
		}

		if response
			.content_length()
			.is_some_and(|size| size > max_size)
		{
			return Err("Frontend release file exceeds the size limit".into());
		}

		let mut bytes = Vec::new();

		while let Some(chunk) = response
			.chunk()
			.await
			.map_err(|_| "Could not read frontend release")?
		{
			let bytes_len: u64 = bytes
				.len()
				.saturating_add(chunk.len())
				.try_into()
				.map_err(|_| "Invalid bytes len")?;

			if bytes_len > max_size {
				return Err(
					"Frontend release file exceeds the size limit".into()
				);
			}

			bytes.extend_from_slice(&chunk);
		}

		Ok(bytes)
	})
	.await
	.map_err(|_| "Frontend release download timed out")?
}

fn remaining_time(deadline: tokio::time::Instant) -> Result<Duration, String> {
	let remaining =
		deadline.saturating_duration_since(tokio::time::Instant::now());
	if remaining.is_zero() {
		return Err("Frontend release download exceeded the time limit".into());
	}
	Ok(remaining.min(REQUEST_TIMEOUT))
}

fn release_url(
	origin: &tauri::Url,
	build_id: &str,
	path: &str,
) -> Result<tauri::Url, String> {
	if !is_valid_build_id(build_id) || !is_valid_manifest_path(path) {
		return Err("Frontend release path is invalid".into());
	}
	let mut url = origin.clone();
	url.set_query(None);
	url.set_fragment(None);
	url.set_path(&format!("/releases/{build_id}/{path}"));
	Ok(url)
}

fn validate_release_directory(
	directory: &Path,
	expected_build_id: Option<&str>,
) -> Result<ReleaseManifest, String> {
	validate_release_directory_with_key(
		directory,
		expected_build_id,
		option_env!("FRONTEND_RELEASE_PUBLIC_KEY"),
	)
}

fn validate_release_directory_with_key(
	directory: &Path,
	expected_build_id: Option<&str>,
	public_key_hex: Option<&str>,
) -> Result<ReleaseManifest, String> {
	let metadata = fs::symlink_metadata(directory)
		.map_err(|_| "Cached frontend release is unavailable")?;

	if !metadata.is_dir() || metadata.file_type().is_symlink() {
		return Err("Cached frontend release has an unsafe directory".into());
	}

	let manifest_path = directory.join("manifest.json");
	let manifest_metadata = fs::symlink_metadata(&manifest_path)
		.map_err(|_| "Cached frontend manifest is unavailable")?;

	if !manifest_metadata.is_file()
		|| manifest_metadata.file_type().is_symlink()
	{
		return Err("Cached frontend manifest has an unsafe file".into());
	}

	let max_manifest_size = MAX_MANIFEST_SIZE
		.try_into()
		.map_err(|_| "Invalid max manifest size")?;

	if manifest_metadata.len() > max_manifest_size {
		return Err("Cached frontend manifest exceeds the size limit".into());
	}

	let manifest: ReleaseManifest = serde_json::from_slice(
		&fs::read(&manifest_path)
			.map_err(|_| "Could not read cached frontend manifest")?,
	)
	.map_err(|_| "Cached frontend manifest is invalid")?;

	validate_manifest(&manifest)?;

	if expected_build_id.is_some_and(|build_id| build_id != manifest.build_id) {
		return Err(
			"Cached frontend build ID does not match its directory".into()
		);
	}

	verify_manifest_signature_with_key(
		&manifest,
		public_key_hex.ok_or("Release verification key is not configured")?,
	)?;

	let declared: HashSet<&str> = manifest
		.files
		.iter()
		.map(|file| file.path.as_str())
		.collect();
	let mut actual = HashSet::new();

	collect_release_paths(directory, directory, &mut actual)?;
	actual.remove("manifest.json");

	if actual.len() != declared.len()
		|| actual.iter().any(|path| !declared.contains(path.as_str()))
	{
		return Err("Cached frontend contains undeclared files".into());
	}

	for file in &manifest.files {
		let file_path = join_manifest_path(directory, &file.path)?;
		let metadata = fs::symlink_metadata(&file_path)
			.map_err(|_| "Cached frontend file is missing")?;
		if !metadata.is_file()
			|| metadata.file_type().is_symlink()
			|| metadata.len() != file.size
		{
			return Err(
				"Cached frontend file has an invalid size or type".into()
			);
		}
		let bytes = fs::read(&file_path)
			.map_err(|_| "Could not read cached frontend file")?;
		if sha256_hex(&bytes) != file.sha256 {
			return Err("Cached frontend file failed hash validation".into());
		}
	}

	Ok(manifest)
}

fn collect_release_paths(
	root: &Path,
	directory: &Path,
	files: &mut HashSet<String>,
) -> Result<(), String> {
	for entry in fs::read_dir(directory)
		.map_err(|_| "Could not inspect cached frontend")?
	{
		let entry = entry.map_err(|_| "Could not inspect cached frontend")?;
		let metadata = fs::symlink_metadata(entry.path())
			.map_err(|_| "Could not inspect cached frontend file")?;
		if metadata.file_type().is_symlink() {
			return Err("Cached frontend contains a symlink".into());
		}
		if metadata.is_dir() {
			collect_release_paths(root, &entry.path(), files)?;
		} else if metadata.is_file() {
			let relative = entry
				.path()
				.strip_prefix(root)
				.map_err(|_| "Cached frontend path escaped its directory")?
				.to_str()
				.ok_or("Cached frontend path is not UTF-8")?
				.replace('\\', "/");
			files.insert(relative);
		} else {
			return Err("Cached frontend contains an unsupported file".into());
		}
	}
	Ok(())
}

fn validate_manifest(manifest: &ReleaseManifest) -> Result<(), String> {
	if manifest.schema_version != 1
		|| manifest.compatibility_version != COMPATIBILITY_VERSION
		|| !is_valid_build_id(&manifest.build_id)
		|| !is_valid_manifest_path(&manifest.entry_point)
		|| manifest.files.is_empty()
		|| manifest.files.len() > MAX_FILE_COUNT
	{
		return Err("Frontend manifest is incompatible or invalid".into());
	}
	let mut paths = HashSet::new();
	let mut total_size = 0_u64;
	let mut contains_entry = false;
	for file in &manifest.files {
		if !is_valid_manifest_path(&file.path)
			|| !paths.insert(file.path.as_str())
			|| file.size > MAX_FILE_SIZE
			|| file.sha256.len() != 64
			|| !file.sha256.bytes().all(|byte| byte.is_ascii_hexdigit())
		{
			return Err(
				"Frontend manifest contains an invalid file entry".into()
			);
		}
		total_size = total_size
			.checked_add(file.size)
			.filter(|size| *size <= MAX_TOTAL_SIZE)
			.ok_or("Frontend manifest exceeds the total size limit")?;
		contains_entry |= file.path == manifest.entry_point;
	}
	if !contains_entry {
		return Err("Frontend manifest entry point is not declared".into());
	}
	Ok(())
}

fn verify_manifest_signature(manifest: &ReleaseManifest) -> Result<(), String> {
	let public_key_hex = option_env!("FRONTEND_RELEASE_PUBLIC_KEY")
		.ok_or("Release verification key is not configured")?;
	verify_manifest_signature_with_key(manifest, public_key_hex)
}

fn verify_manifest_signature_with_key(
	manifest: &ReleaseManifest,
	public_key_hex: &str,
) -> Result<(), String> {
	let public_key_bytes = decode_hex_32(public_key_hex)
		.ok_or("Release verification key is invalid")?;
	let key = VerifyingKey::from_bytes(&public_key_bytes)
		.map_err(|_| "Release verification key is invalid")?;
	let signature_bytes = BASE64
		.decode(&manifest.signature)
		.map_err(|_| "Release signature is invalid")?;
	let signature = Signature::from_slice(&signature_bytes)
		.map_err(|_| "Release signature is invalid")?;
	let payload = SignedPayload {
		schema_version: manifest.schema_version,
		build_id: &manifest.build_id,
		compatibility_version: manifest.compatibility_version,
		entry_point: &manifest.entry_point,
		files: &manifest.files,
	};
	let payload_bytes = serde_json::to_vec(&payload)
		.map_err(|_| "Could not serialize release manifest")?;
	key.verify_strict(&payload_bytes, &signature)
		.map_err(|_| "Frontend release signature does not match".to_string())
}

fn join_manifest_path(root: &Path, path: &str) -> Result<PathBuf, String> {
	if !is_valid_manifest_path(path) {
		return Err("Frontend release path is invalid".into());
	}
	let mut destination = root.to_path_buf();
	for component in Path::new(path).components() {
		match component {
			Component::Normal(part) => destination.push(part),
			_ => return Err("Frontend release path is invalid".into()),
		}
	}
	Ok(destination)
}

fn request_path_for_asset(path: &str) -> Result<PathBuf, ()> {
	let path = path.trim_start_matches('/').trim_end_matches('/');
	if path.is_empty() {
		return Ok(PathBuf::from("index.html"));
	}
	if !is_valid_manifest_path(path) {
		return Err(());
	}
	Ok(PathBuf::from(path))
}

fn read_cached_asset(
	root: &Path,
	manifest: &ReleaseManifest,
	path: &Path,
) -> Result<(Vec<u8>, String), ()> {
	let path_text = path.to_str().ok_or(())?;
	let root_metadata = fs::symlink_metadata(root).map_err(|_| ())?;
	if !root_metadata.is_dir() || root_metadata.file_type().is_symlink() {
		return Err(());
	}
	let expected = manifest
		.files
		.iter()
		.find(|file| file.path == path_text)
		.ok_or(())?;
	let file_path = join_manifest_path(root, path_text).map_err(|_| ())?;
	let metadata = fs::symlink_metadata(&file_path).map_err(|_| ())?;
	if !metadata.is_file()
		|| metadata.file_type().is_symlink()
		|| metadata.len() != expected.size
		|| has_symlink_component(root, path).is_err()
	{
		return Err(());
	}
	let bytes = fs::read(file_path).map_err(|_| ())?;
	if sha256_hex(&bytes) != expected.sha256 {
		return Err(());
	}
	let mime_type = mime_guess::from_path(path)
		.first_or_octet_stream()
		.essence_str()
		.to_string();
	Ok((bytes, mime_type))
}

fn has_symlink_component(root: &Path, relative_path: &Path) -> Result<(), ()> {
	let components = relative_path.components().collect::<Vec<_>>();
	let mut current = root.to_path_buf();

	for (index, component) in components.iter().enumerate() {
		let Component::Normal(part) = component else {
			return Err(());
		};

		current.push(part);

		let metadata = fs::symlink_metadata(&current).map_err(|_| ())?;

		if metadata.file_type().is_symlink()
			|| (index.saturating_add(1) < components.len()
				&& !metadata.is_dir())
		{
			return Err(());
		}
	}

	Ok(())
}

fn read_embedded_asset(
	app: &AppHandle,
	path: &Path,
) -> Result<(Vec<u8>, String), ()> {
	let relative = path.to_str().ok_or(())?.replace('\\', "/");
	let asset = app
		.asset_resolver()
		.get(format!("ui/{relative}"))
		.ok_or(())?;
	Ok((asset.bytes().to_vec(), asset.mime_type().to_string()))
}

fn is_spa_route(path: &Path) -> bool {
	path.extension().is_none()
}

fn is_valid_manifest_path(path: &str) -> bool {
	!path.is_empty()
		&& !path.starts_with('/')
		&& !path.contains('\\')
		&& !path.contains(':')
		&& !path.contains('\0')
		&& path.split('/').all(|component| {
			!component.is_empty() && component != "." && component != ".."
		})
}

fn is_valid_build_id(build_id: &str) -> bool {
	!build_id.is_empty()
		&& build_id.len() <= 64
		&& build_id.bytes().all(|byte| {
			byte.is_ascii_lowercase() || byte.is_ascii_digit() || byte == b'-'
		})
}

fn sha256_hex(bytes: &[u8]) -> String {
	Sha256::digest(bytes)
		.iter()
		.fold(String::new(), |mut output, b| {
			let _ = write!(output, "{b:02x}");
			output
		})
}

fn decode_hex_32(value: &str) -> Option<[u8; 32]> {
	if value.len() != 64 {
		return None;
	}

	let mut bytes = [0; 32];

	for (byte, chunk) in
		bytes.iter_mut().zip(value.as_bytes().as_chunks::<2>().0)
	{
		*byte =
			u8::from_str_radix(std::str::from_utf8(chunk).ok()?, 16).ok()?;
	}

	Some(bytes)
}

fn read_build_pointer(path: &Path) -> Option<String> {
	let build_id = fs::read_to_string(path).ok()?.trim().to_string();
	is_valid_build_id(&build_id).then_some(build_id)
}

fn write_pointer(path: &Path, build_id: &str) -> Result<(), String> {
	if !is_valid_build_id(build_id) {
		return Err("Frontend cache pointer is invalid".into());
	}

	let temporary = path.with_extension(format!("tmp-{}", Uuid::new_v4()));
	let mut file = fs::OpenOptions::new()
		.write(true)
		.create_new(true)
		.open(&temporary)
		.map_err(|_| "Could not create frontend cache pointer".to_string())?;

	file.write_all(build_id.as_bytes())
		.and_then(|()| file.sync_all())
		.map_err(|error| {
			remove_pointer_temp(&temporary);
			format!("Could not write frontend cache pointer: {error}")
		})?;

	if let Err(error) = replace_pointer(&temporary, path) {
		remove_pointer_temp(&temporary);
		return Err(error);
	}

	if let Some(parent) = path.parent() {
		sync_directory(parent)
			.map_err(|_| "Could not persist frontend cache pointer")?;
	}

	Ok(())
}

#[cfg(not(target_os = "windows"))]
fn replace_pointer(temporary: &Path, destination: &Path) -> Result<(), String> {
	fs::rename(temporary, destination).map_err(|_| {
		"Could not atomically update frontend cache pointer".to_string()
	})
}

#[cfg(target_os = "windows")]
fn replace_pointer(temporary: &Path, destination: &Path) -> Result<(), String> {
	use std::os::windows::ffi::OsStrExt;

	use windows_sys::Win32::Storage::FileSystem::{
		MOVEFILE_REPLACE_EXISTING, MOVEFILE_WRITE_THROUGH, MoveFileExW,
	};

	let temporary: Vec<u16> =
		temporary.as_os_str().encode_wide().chain(Some(0)).collect();
	let destination: Vec<u16> = destination
		.as_os_str()
		.encode_wide()
		.chain(Some(0))
		.collect();
	// SAFETY: Both strings are null-terminated UTF-16 paths owned for this call.
	let succeeded = unsafe {
		MoveFileExW(
			temporary.as_ptr(),
			destination.as_ptr(),
			MOVEFILE_REPLACE_EXISTING | MOVEFILE_WRITE_THROUGH,
		)
	};
	if succeeded == 0 {
		return Err("Could not atomically update frontend cache pointer".into());
	}
	Ok(())
}

fn quarantine_release(root: &Path, build_id: &str) {
	if !is_valid_build_id(build_id) {
		return;
	}
	let release = root.join("releases").join(build_id);
	if release.exists() {
		let quarantine = root.join(format!("quarantine-{}", Uuid::new_v4()));
		if let Err(error) = fs::rename(release, quarantine) {
			log::warn!(
				"Could not quarantine invalid frontend release: {error}"
			);
		}
	}
}

fn cleanup_old_releases(root: &Path, active_id: &str) {
	let previous_id = read_build_pointer(&root.join("previous-version"));
	let Ok(entries) = fs::read_dir(root.join("releases")) else {
		return;
	};
	for entry in entries.flatten() {
		let name = entry.file_name().to_string_lossy().into_owned();
		if !is_valid_build_id(&name)
			|| name == active_id
			|| previous_id.as_deref() == Some(&name)
		{
			continue;
		}
		if let Err(error) = fs::remove_dir_all(entry.path()) {
			log::warn!("Could not remove obsolete frontend release: {error}");
		}
	}
}

fn cleanup_staging(root: &Path) {
	let Ok(entries) = fs::read_dir(root) else {
		return;
	};

	for entry in entries.flatten() {
		let name = entry.file_name().to_string_lossy().into_owned();

		if name.starts_with("active-version.tmp-")
			|| name.starts_with("previous-version.tmp-")
		{
			if let Err(error) = fs::remove_file(entry.path()) {
				log::warn!(
					"Could not remove interrupted cache pointer: {error}"
				);
			}
			continue;
		}

		if !name.starts_with("staging-") {
			continue;
		}

		let Ok(metadata) = fs::symlink_metadata(entry.path()) else {
			continue;
		};

		if metadata.is_dir()
			&& !metadata.file_type().is_symlink()
			&& let Err(error) = fs::remove_dir_all(entry.path())
		{
			log::warn!(
				"Could not remove interrupted frontend staging directory: {error}"
			);
		}
	}
}

fn remove_pointer_temp(path: &Path) {
	if let Err(error) = fs::remove_file(path) {
		log::warn!("Could not remove incomplete cache pointer file: {error}");
	}
}

fn sync_directory_tree(root: &Path) -> Result<(), String> {
	for entry in
		fs::read_dir(root).map_err(|_| "Could not inspect staged frontend")?
	{
		let entry = entry.map_err(|_| "Could not inspect staged frontend")?;
		let path = entry.path();
		let metadata = fs::symlink_metadata(&path)
			.map_err(|_| "Could not inspect staged frontend file")?;

		if metadata.file_type().is_symlink() {
			return Err("Staged frontend contains a symlink".into());
		}

		if metadata.is_dir() {
			sync_directory_tree(&path)?;
		} else if metadata.is_file() {
			fs::File::open(path)
				.and_then(|file| file.sync_all())
				.map_err(|_| "Could not persist staged frontend file")?;
		} else {
			return Err("Staged frontend contains an unsupported file".into());
		}
	}

	sync_directory(root)
		.map_err(|_| "Could not persist staged frontend".to_string())
}

#[cfg(unix)]
fn sync_directory(path: &Path) -> std::io::Result<()> {
	fs::File::open(path)?.sync_all()
}

#[cfg(windows)]
fn sync_directory(_path: &Path) -> std::io::Result<()> {
	Ok(())
}

fn response(
	status: StatusCode,
	mime_type: &str,
	body: &[u8],
) -> Response<Vec<u8>> {
	Response::builder()
		.status(status)
		.header(http::header::CONTENT_TYPE, mime_type)
		.header("X-Content-Type-Options", "nosniff")
		.body(body.to_vec())
		.unwrap_or_else(|_| Response::new(Vec::new()))
}

#[cfg(test)]
#[allow(clippy::as_conversions)]
mod tests {
	use ed25519_dalek::{Signer, SigningKey};

	use super::*;

	#[test]
	fn hex_key_decoding_rejects_invalid_input() {
		assert_eq!(decode_hex_32(&"aF".repeat(32)), Some([0xaf; 32]));
		assert_eq!(decode_hex_32(&"0".repeat(63)), None);
		assert_eq!(decode_hex_32(&"xz".repeat(32)), None);
		assert_eq!(decode_hex_32(&format!("a\u{e9}{}", "0".repeat(61))), None);
	}

	#[test]
	fn manifest_paths_reject_traversal_and_absolute_names() {
		assert!(is_valid_manifest_path("assets/main.js"));
		assert!(!is_valid_manifest_path("../secret"));
		assert!(!is_valid_manifest_path("/absolute.js"));
		assert!(!is_valid_manifest_path(r"assets\main.js"));
		assert!(!is_valid_manifest_path("assets/./main.js"));
	}

	#[test]
	fn build_ids_are_bounded_and_path_safe() {
		assert!(is_valid_build_id("1a2b3c"));
		assert!(!is_valid_build_id("../bad"));
		assert!(!is_valid_build_id("AABB"));
		assert!(!is_valid_build_id(&"a".repeat(65)));
	}

	#[test]
	fn incompatible_and_duplicate_manifests_are_rejected() {
		let file = ReleaseFile {
			path: "index.html".into(),
			size: 1,
			sha256: "0".repeat(64),
		};
		let mut manifest = ReleaseManifest {
			schema_version: 1,
			build_id: "build-1".into(),
			compatibility_version: COMPATIBILITY_VERSION,
			entry_point: "index.html".into(),
			files: vec![file.clone(), file],
			signature: String::new(),
		};
		assert!(validate_manifest(&manifest).is_err());
		manifest.files.pop();
		manifest.compatibility_version += 1;
		assert!(validate_manifest(&manifest).is_err());
	}

	#[test]
	fn signed_release_and_file_hash_are_verified() {
		let signing_key = SigningKey::from_bytes(&[7; 32]);
		let file_bytes = b"<!doctype html>";

		let file = ReleaseFile {
			path: "index.html".into(),
			size: file_bytes.len() as u64,
			sha256: sha256_hex(file_bytes),
		};

		let mut manifest = ReleaseManifest {
			schema_version: 1,
			build_id: "build-1".into(),
			compatibility_version: COMPATIBILITY_VERSION,
			entry_point: "index.html".into(),
			files: vec![file],
			signature: String::new(),
		};

		let payload = SignedPayload {
			schema_version: manifest.schema_version,
			build_id: &manifest.build_id,
			compatibility_version: manifest.compatibility_version,
			entry_point: &manifest.entry_point,
			files: &manifest.files,
		};

		let payload_bytes = serde_json::to_vec(&payload).unwrap();

		manifest.signature =
			BASE64.encode(signing_key.sign(&payload_bytes).to_bytes());

		#[allow(clippy::format_collect)]
		let public_key_hex = signing_key
			.verifying_key()
			.to_bytes()
			.iter()
			.map(|byte| format!("{byte:02x}"))
			.collect::<String>();

		let directory = std::env::temp_dir()
			.join(format!("frontend-release-test-{}", Uuid::new_v4()));

		fs::create_dir(&directory).unwrap();
		fs::write(directory.join("index.html"), file_bytes).unwrap();
		fs::write(
			directory.join("manifest.json"),
			serde_json::to_vec(&manifest).unwrap(),
		)
		.unwrap();

		assert!(
			validate_release_directory_with_key(
				&directory,
				Some("build-1"),
				Some(&public_key_hex),
			)
			.is_ok()
		);

		fs::write(directory.join("index.html"), b"modified").unwrap();

		assert!(
			validate_release_directory_with_key(
				&directory,
				Some("build-1"),
				Some(&public_key_hex),
			)
			.is_err()
		);

		fs::remove_dir_all(directory).unwrap();
	}

	#[test]
	fn manifest_enforces_individual_file_size_limit() {
		let manifest = ReleaseManifest {
			schema_version: 1,
			build_id: "build-1".into(),
			compatibility_version: COMPATIBILITY_VERSION,
			entry_point: "index.html".into(),
			files: vec![ReleaseFile {
				path: "index.html".into(),
				size: MAX_FILE_SIZE + 1,
				sha256: "0".repeat(64),
			}],
			signature: String::new(),
		};
		assert!(validate_manifest(&manifest).is_err());
	}
}
