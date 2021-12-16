#![cfg_attr(
  all(not(debug_assertions), target_os = "windows"),
  windows_subsystem = "windows"
)]

use tauri::{Manager, Builder, generate_handler, generate_context, command};
use serde::Serialize;
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
    .invoke_handler(generate_handler![my_custom_command])
    .run(generate_context!())
    .expect("error while running tauri application");
}

#[derive(Serialize, TS)]
#[serde(rename_all = "camelCase")]
#[ts(export, export_to = "../src/__generated__/custom-command-response.ts")]
struct CustomCommandResponse {
  message: String,
  other_val: usize,
}

#[derive(Serialize, TS)]
#[serde(rename_all = "camelCase")]
#[ts(export, export_to = "../src/__generated__/custom-event.ts")]
struct CustomEvent {
  message: String,
}

// https://tauri.studio/en/docs/usage/howtos/command#complete-example
#[command]
fn my_custom_command(number: usize) -> CustomCommandResponse {
  CustomCommandResponse {
    message: "This is some message".into(),
    other_val: 42 + number,
  }
}
