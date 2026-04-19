/// Tauri commands for the frontend to call
use crate::acp_client::AcpClient;
use crate::state::{ActiveConnection, AppState};
use std::sync::Arc;
use tauri::State;
use tokio::sync::{mpsc, Mutex};

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
pub async fn kill_process(_state: State<'_, AppState>, pid: u32) -> Result<(), String> {
    // TODO: Implement process killing
    Ok(())
}

#[tauri::command]
pub async fn acp_connect(
    state: State<'_, AppState>,
    kiro_cli_path: String,
) -> Result<String, String> {
    // Create channels for session updates and permission requests
    let (session_update_tx, session_update_rx) = mpsc::unbounded_channel();
    let (permission_request_tx, permission_request_rx) = mpsc::unbounded_channel();
    let (permission_response_tx, permission_response_rx) = mpsc::unbounded_channel();

    // Connect to the kiro-cli agent
    let client = AcpClient::connect(
        kiro_cli_path,
        session_update_tx,
        permission_request_tx,
        permission_response_rx,
    )
    .await
    .map_err(|e| format!("Failed to connect: {}", e))?;

    // Generate connection ID
    let connection_id = uuid::Uuid::new_v4().to_string();

    // Store the connection
    let connection = ActiveConnection {
        client,
        session_update_rx: Arc::new(Mutex::new(session_update_rx)),
        permission_request_rx: Arc::new(Mutex::new(permission_request_rx)),
        permission_response_tx,
    };

    state
        .connections
        .lock()
        .await
        .insert(connection_id.clone(), connection);

    Ok(connection_id)
}

#[tauri::command]
pub async fn acp_disconnect(
    state: State<'_, AppState>,
    connection_id: String,
) -> Result<(), String> {
    let mut connections = state.connections.lock().await;
    if let Some(connection) = connections.remove(&connection_id) {
        connection
            .client
            .disconnect()
            .await
            .map_err(|e| format!("Failed to disconnect: {}", e))?;
    }
    Ok(())
}

#[tauri::command]
pub async fn acp_send_prompt(
    _state: State<'_, AppState>,
    session_id: String,
    prompt: String,
) -> Result<String, String> {
    // TODO: Implement prompt sending via connection handle
    Ok("response".to_string())
}

