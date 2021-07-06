#![cfg_attr(
  all(not(debug_assertions), target_os = "windows"),
  windows_subsystem = "windows"
)]

use tauri::Manager;

fn main() {
  tauri::Builder::default()
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
    .invoke_handler(tauri::generate_handler![my_custom_command])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}

#[derive(serde::Serialize, ts_rs::TS)]
#[serde(rename_all = "camelCase")]
struct CustomResponse {
  message: String,
  other_val: usize,
}

#[derive(serde::Serialize, ts_rs::TS)]
#[serde(rename_all = "camelCase")]
struct CustomEvent {
  message: String,
}

// https://tauri.studio/en/docs/usage/howtos/command#complete-example
#[tauri::command]
fn my_custom_command(number: usize) -> CustomResponse {
  CustomResponse {
    message: "This is some message".into(),
    other_val: 42 + number,
  }
}

ts_rs::export! {
  CustomResponse => "../src/typings/tauri/custom-response.ts",
  CustomEvent => "../src/typings/tauri/custom-event.ts",
}
