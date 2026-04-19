/// Application state shared across all Tauri commands
use std::sync::Arc;
use tokio::sync::Mutex;

#[derive(Default)]
pub struct AppState {
    pub connections: Arc<Mutex<Vec<String>>>,
}

impl AppState {
    pub fn new() -> Self {
        Self::default()
    }
}
