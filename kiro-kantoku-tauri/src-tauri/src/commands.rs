/// Tauri commands for the frontend to call
use tauri::State;
use crate::state::AppState;

#[tauri::command]
pub fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
pub async fn spawn_process(
    _state: State<'_, AppState>,
    command: String,
    args: Vec<String>,
) -> Result<u32, String> {
    // TODO: Implement process spawning
    Ok(0)
}

#[tauri::command]
pub async fn kill_process(
    _state: State<'_, AppState>,
    pid: u32,
) -> Result<(), String> {
    // TODO: Implement process killing
    Ok(())
}

#[tauri::command]
pub async fn acp_connect(
    _state: State<'_, AppState>,
    kiro_cli_path: String,
) -> Result<String, String> {
    // TODO: Implement ACP connection
    Ok("connected".to_string())
}

#[tauri::command]
pub async fn acp_disconnect(
    _state: State<'_, AppState>,
) -> Result<(), String> {
    // TODO: Implement ACP disconnection
    Ok(())
}

#[tauri::command]
pub async fn acp_send_prompt(
    _state: State<'_, AppState>,
    session_id: String,
    prompt: String,
) -> Result<String, String> {
    // TODO: Implement prompt sending
    Ok("response".to_string())
}
