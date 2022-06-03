#![cfg_attr(
  all(not(debug_assertions), target_os = "windows"),
  windows_subsystem = "windows"
)]

use nfd::Response;
use serde::Serialize;
use tauri::{command, generate_context, generate_handler, Builder};
use ts_rs::TS;

fn main() {
  Builder::default()
    .invoke_handler(generate_handler![select_files])
    .run(generate_context!())
    .expect("error while running tauri application");
}

#[derive(Serialize, TS)]
#[serde(rename_all = "camelCase")]
#[ts(export, export_to = "../src/__generated__/select-files-response.ts")]
struct SelectFilesResponse {
  files: Vec<String>,
}

// https://tauri.studio/en/docs/usage/howtos/command#complete-example
#[command]
fn select_files(_maybe_inital_path: Option<String>) -> SelectFilesResponse {
  // let initial_path = maybe_initial_path.unwrap_or("~".into());

  let result = nfd::open_file_dialog(None, None).unwrap_or_else(|e| {
    panic!("{}", e.to_string());
  });

  match result {
    Response::OkayMultiple(files) => SelectFilesResponse { files },
    Response::Okay(file_path) => SelectFilesResponse {
      files: Vec::from([file_path]),
    },
    Response::Cancel => SelectFilesResponse {
      files: Vec::from([]),
    },
  }
}
