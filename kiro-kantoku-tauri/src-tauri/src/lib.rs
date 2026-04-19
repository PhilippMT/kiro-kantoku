// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/

mod acp;
mod acp_client;
mod commands;
mod process;
mod state;

use tauri::Manager;
use state::AppState;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .setup(|app| {
            // Initialize application state
            let state = AppState::new();
            app.manage(state);
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::greet,
            commands::spawn_process,
            commands::kill_process,
            commands::acp_connect,
            commands::acp_disconnect,
            commands::acp_send_prompt,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
