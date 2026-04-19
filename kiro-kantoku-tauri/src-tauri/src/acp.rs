/// ACP (Agent Communication Protocol) client implementation
/// Handles JSON-RPC 2.0 communication with kiro-cli

use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct ACPMessage {
    pub jsonrpc: String,
    pub method: String,
    pub params: serde_json::Value,
    pub id: Option<i64>,
}

// TODO: Implement full ACP client
