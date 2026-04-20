/// ACP (Agent Communication Protocol) client implementation
/// Handles JSON-RPC 2.0 communication with kiro-cli

use serde::{Deserialize, Serialize};
use serde_json::Value;
use std::collections::HashMap;

// ============================================================================
// JSON-RPC Base Types
// ============================================================================

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct JsonRpcRequest {
    pub jsonrpc: String,
    pub method: String,
    pub params: Value,
    pub id: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct JsonRpcResponse {
    pub jsonrpc: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub result: Option<Value>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub error: Option<JsonRpcError>,
    pub id: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct JsonRpcNotification {
    pub jsonrpc: String,
    pub method: String,
    pub params: Value,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct JsonRpcError {
    pub code: i32,
    pub message: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub data: Option<Value>,
}

// ============================================================================
// ACP Core Types
// ============================================================================

pub type SessionId = String;
pub type ModelId = String;
pub type SessionModeId = String;
pub type SessionConfigId = String;
pub type SessionConfigValueId = String;
pub type ToolCallId = String;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SessionInfo {
    #[serde(rename = "sessionId")]
    pub session_id: SessionId,
    #[serde(rename = "configOptions")]
    pub config_options: Vec<SessionConfigOption>,
    pub modes: Vec<SessionMode>,
    pub models: Vec<ModelInfo>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SessionConfigOption {
    pub id: SessionConfigId,
    pub name: String,
    pub description: Option<String>,
    #[serde(rename = "type")]
    pub option_type: String,
    pub values: Vec<SessionConfigValue>,
    #[serde(rename = "currentValue")]
    pub current_value: SessionConfigValueId,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SessionConfigValue {
    pub id: SessionConfigValueId,
    pub name: String,
    pub description: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SessionMode {
    pub id: SessionModeId,
    pub name: String,
    pub description: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ModelInfo {
    pub id: ModelId,
    pub name: String,
    pub provider: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "type")]
pub enum ContentBlock {
    #[serde(rename = "text")]
    Text { text: String },
    #[serde(rename = "image")]
    Image {
        data: String,
        #[serde(rename = "mimeType")]
        mime_type: String,
    },
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum StopReason {
    #[serde(rename = "endTurn")]
    EndTurn,
    #[serde(rename = "maxTokens")]
    MaxTokens,
    #[serde(rename = "maxTurnRequests")]
    MaxTurnRequests,
    #[serde(rename = "cancelled")]
    Cancelled,
    #[serde(rename = "refusal")]
    Refusal,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Location {
    pub path: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub line: Option<u32>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ToolCallStatus {
    #[serde(rename = "pending")]
    Pending,
    #[serde(rename = "running")]
    Running,
    #[serde(rename = "completed")]
    Completed,
    #[serde(rename = "failed")]
    Failed,
}

// ============================================================================
// ACP Request/Response Types
// ============================================================================

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NewSessionRequest {
    pub cwd: String,
    #[serde(rename = "mcpServers")]
    pub mcp_servers: Vec<Value>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NewSessionResponse {
    #[serde(rename = "sessionId")]
    pub session_id: SessionId,
    #[serde(rename = "configOptions")]
    pub config_options: Vec<SessionConfigOption>,
    pub modes: Vec<SessionMode>,
    pub models: Vec<ModelInfo>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LoadSessionRequest {
    #[serde(rename = "sessionId")]
    pub session_id: SessionId,
    pub cwd: String,
    #[serde(rename = "mcpServers")]
    pub mcp_servers: Vec<Value>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LoadSessionResponse {
    #[serde(rename = "configOptions")]
    pub config_options: Vec<SessionConfigOption>,
    pub modes: Vec<SessionMode>,
    pub models: Vec<ModelInfo>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PromptRequest {
    #[serde(rename = "sessionId")]
    pub session_id: SessionId,
    pub prompt: Vec<ContentBlock>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PromptResponse {
    #[serde(rename = "stopReason")]
    pub stop_reason: StopReason,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CancelRequest {
    #[serde(rename = "sessionId")]
    pub session_id: SessionId,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SetModeRequest {
    #[serde(rename = "sessionId")]
    pub session_id: SessionId,
    #[serde(rename = "modeId")]
    pub mode_id: SessionModeId,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SetModelRequest {
    #[serde(rename = "sessionId")]
    pub session_id: SessionId,
    #[serde(rename = "modelId")]
    pub model_id: ModelId,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SetConfigOptionRequest {
    #[serde(rename = "sessionId")]
    pub session_id: SessionId,
    #[serde(rename = "configId")]
    pub config_id: SessionConfigId,
    pub value: SessionConfigValueId,
}

// ============================================================================
// Session Update Types
// ============================================================================

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "type")]
pub enum SessionUpdate {
    #[serde(rename = "agentMessageChunk")]
    AgentMessageChunk { content: ContentBlock },

    #[serde(rename = "toolCall")]
    ToolCall {
        #[serde(rename = "toolCallId")]
        tool_call_id: ToolCallId,
        title: String,
        #[serde(skip_serializing_if = "Option::is_none")]
        kind: Option<String>,
        #[serde(skip_serializing_if = "Option::is_none")]
        status: Option<ToolCallStatus>,
        #[serde(skip_serializing_if = "Option::is_none")]
        content: Option<Vec<ContentBlock>>,
        #[serde(skip_serializing_if = "Option::is_none")]
        locations: Option<Vec<Location>>,
        #[serde(rename = "rawInput", skip_serializing_if = "Option::is_none")]
        raw_input: Option<String>,
        #[serde(rename = "rawOutput", skip_serializing_if = "Option::is_none")]
        raw_output: Option<String>,
    },

    #[serde(rename = "toolCallUpdate")]
    ToolCallUpdate {
        #[serde(rename = "toolCallId")]
        tool_call_id: ToolCallId,
        #[serde(skip_serializing_if = "Option::is_none")]
        title: Option<String>,
        #[serde(skip_serializing_if = "Option::is_none")]
        kind: Option<String>,
        #[serde(skip_serializing_if = "Option::is_none")]
        status: Option<ToolCallStatus>,
        #[serde(skip_serializing_if = "Option::is_none")]
        content: Option<Vec<ContentBlock>>,
        #[serde(skip_serializing_if = "Option::is_none")]
        locations: Option<Vec<Location>>,
        #[serde(rename = "rawInput", skip_serializing_if = "Option::is_none")]
        raw_input: Option<String>,
        #[serde(rename = "rawOutput", skip_serializing_if = "Option::is_none")]
        raw_output: Option<String>,
    },

    #[serde(rename = "agentThoughtChunk")]
    AgentThoughtChunk { content: ContentBlock },

    #[serde(rename = "userMessageChunk")]
    UserMessageChunk { content: ContentBlock },

    #[serde(rename = "planUpdate")]
    PlanUpdate { entries: Vec<PlanEntry> },

    #[serde(rename = "availableCommandsUpdate")]
    AvailableCommandsUpdate {
        #[serde(rename = "availableCommands")]
        available_commands: Vec<AvailableCommand>,
    },

    #[serde(rename = "currentModeUpdate")]
    CurrentModeUpdate {
        #[serde(rename = "currentModeId")]
        current_mode_id: SessionModeId,
    },

    #[serde(rename = "configOptionUpdate")]
    ConfigOptionUpdate {
        #[serde(rename = "configOptions")]
        config_options: Vec<SessionConfigOption>,
    },

    #[serde(rename = "sessionInfoUpdate")]
    SessionInfoUpdate {
        #[serde(skip_serializing_if = "Option::is_none")]
        title: Option<String>,
    },
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PlanEntry {
    pub content: String,
    pub priority: u32,
    pub status: PlanEntryStatus,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum PlanEntryStatus {
    #[serde(rename = "pending")]
    Pending,
    #[serde(rename = "inProgress")]
    InProgress,
    #[serde(rename = "completed")]
    Completed,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AvailableCommand {
    pub name: String,
    pub description: String,
    #[serde(rename = "inputType")]
    pub input_type: Option<String>,
}

// ============================================================================
// Kiro Vendor Extension Types
// ============================================================================

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct KiroCommandsAvailable {
    #[serde(rename = "sessionId")]
    pub session_id: String,
    pub commands: Vec<KiroAvailableCommand>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct KiroAvailableCommand {
    pub name: String,
    pub description: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub meta: Option<Value>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct KiroCommandOptionsRequest {
    pub command: String,
    #[serde(rename = "sessionId")]
    pub session_id: String,
    #[serde(default)]
    pub partial: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct KiroCommandOptionsResponse {
    pub options: Vec<CommandOption>,
    #[serde(rename = "hasMore")]
    pub has_more: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CommandOption {
    pub value: String,
    pub label: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub description: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub group: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct KiroCommandExecuteRequest {
    #[serde(rename = "sessionId")]
    pub session_id: String,
    pub command: CommandExec,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CommandExec {
    pub command: String,
    pub args: HashMap<String, String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct KiroMetadata {
    #[serde(rename = "sessionId")]
    pub session_id: String,
    #[serde(rename = "contextUsagePercentage")]
    pub context_usage_percentage: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct KiroAgentSwitched {
    #[serde(rename = "sessionId")]
    pub session_id: String,
    #[serde(rename = "agentName")]
    pub agent_name: String,
    #[serde(rename = "previousAgentName")]
    pub previous_agent_name: String,
    #[serde(rename = "welcomeMessage", skip_serializing_if = "Option::is_none")]
    pub welcome_message: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "sessionUpdate")]
pub enum KiroSessionUpdate {
    #[serde(rename = "tool_call_chunk")]
    ToolCallChunk {
        #[serde(rename = "toolCallId")]
        tool_call_id: String,
        title: String,
        kind: String,
    },

    #[serde(rename = "plan")]
    Plan {
        #[serde(skip_serializing_if = "Option::is_none")]
        title: Option<String>,
        steps: Vec<KiroPlanStep>,
    },

    #[serde(rename = "agent_thought_chunk")]
    AgentThoughtChunk {
        content: KiroThoughtContent,
    },
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct KiroPlanStep {
    pub description: String,
    pub status: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct KiroThoughtContent {
    #[serde(rename = "type")]
    pub content_type: String,
    pub text: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct KiroCompactionStatus {
    pub message: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct KiroClearStatus {
    pub message: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct KiroMcpOAuthRequest {
    pub url: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct KiroMcpServerInitFailure {
    #[serde(rename = "sessionId")]
    pub session_id: String,
    #[serde(rename = "serverName")]
    pub server_name: String,
    pub error: String,
}
