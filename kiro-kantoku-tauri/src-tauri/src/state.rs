/// Application state shared across all Tauri commands
use crate::acp_client::{AcpClient, PermissionRequestData, SessionUpdateEvent};
use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::{mpsc, Mutex};

/// Connection ID for tracking ACP connections
pub type ConnectionId = String;

/// Active ACP connection
pub struct ActiveConnection {
    pub client: AcpClient,
    pub session_update_rx: Arc<Mutex<mpsc::UnboundedReceiver<SessionUpdateEvent>>>,
    pub permission_request_rx: Arc<Mutex<mpsc::UnboundedReceiver<PermissionRequestData>>>,
    pub permission_response_tx: mpsc::UnboundedSender<String>,
}

#[derive(Default)]
pub struct AppState {
    pub connections: Arc<Mutex<HashMap<ConnectionId, ActiveConnection>>>,
}

impl AppState {
    pub fn new() -> Self {
        Self::default()
    }
}
