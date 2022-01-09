#![cfg_attr(
  all(not(debug_assertions), target_os = "windows"),
  windows_subsystem = "windows"
)]

use nfd::Response;
use serde::Serialize;
use tauri::{command, generate_context, generate_handler, Builder, Manager};
use ts_rs::TS;

fn main() {
  Builder::default()
    .setup(|app| {
      let main_window = app.get_window("main").unwrap();

      main_window
        .emit(
          "custom-event",
          CustomEvent {
            message: "This is an event message".into(),
          },
        )
        .unwrap();

      Ok(())
    })
    .invoke_handler(generate_handler![load_files])
    .run(generate_context!())
    .expect("error while running tauri application");
}

#[derive(Serialize, TS)]
#[serde(rename_all = "camelCase")]
#[ts(export, export_to = "../src/__generated__/load-files-response.ts")]
struct LoadFilesResponse {
  success: bool,
  files: Option<Vec<String>>,
  message: Option<String>,
}

#[derive(Serialize, TS)]
#[serde(rename_all = "camelCase")]
#[ts(export, export_to = "../src/__generated__/custom-event.ts")]
struct CustomEvent {
  message: String,
}

// https://tauri.studio/en/docs/usage/howtos/command#complete-example
#[command]
fn load_files(maybe_initial_path: Option<String>) -> LoadFilesResponse {
  let initial_path = maybe_initial_path.unwrap_or("~".into());

  let result = nfd::open_file_dialog(None, None).unwrap_or_else(|e| {
    panic!("{}", e.to_string());
  });

  match result {
    Response::Okay(file_path) => LoadFilesResponse {
      success: true,
      files: Some(Vec::from([file_path])),
      message: None,
    },
    Response::OkayMultiple(files) => LoadFilesResponse {
      success: true,
      files: Some(files),
      message: None,
    },
    Response::Cancel => LoadFilesResponse {
      success: false,
      files: None,
      message: Some("cancelled".into()),
    },
  }
}
