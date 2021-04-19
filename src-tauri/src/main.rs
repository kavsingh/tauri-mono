#![cfg_attr(
  all(not(debug_assertions), target_os = "windows"),
  windows_subsystem = "windows"
)]

fn main() {
  tauri::Builder::default()
    .invoke_handler(tauri::generate_handler![my_custom_command])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}

// #[derive(serde::Serialize, ts_rs::TS)]
#[derive(serde::Serialize)]
#[serde(rename_all = "camelCase")]
struct CustomResponse {
  message: String,
  other_val: usize,
}

// https://tauri.studio/en/docs/usage/howtos/command#complete-example
#[tauri::command]
fn my_custom_command(number: usize) -> CustomResponse {
  CustomResponse {
    message: "This is some message".into(),
    other_val: 42 + number,
  }
}

// ts_rs::export! {
//   CustomResponse => "CustomResponse.ts"
// }
