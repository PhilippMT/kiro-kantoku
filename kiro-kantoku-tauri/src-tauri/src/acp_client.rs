//! ACP Client wrapper using the official Rust SDK
//!
//! This module provides a wrapper around the agent-client-protocol SDK
//! to manage connections to kiro-cli agents.

use agent_client_protocol::{
    schema::{
        ContentBlock, InitializeRequest, NewSessionRequest, PromptRequest, ProtocolVersion,
        RequestPermissionOutcome, RequestPermissionRequest, RequestPermissionResponse,
        SelectedPermissionOutcome, SessionNotification, TextContent,
    },
    Agent, ByteStreams, Client, ConnectionTo,
};
use anyhow::{Context, Result};
use futures::FutureExt;
use serde_json::Value;
use std::path::PathBuf;
use std::sync::Arc;
use tokio::sync::{mpsc, Mutex};
use tokio_util::compat::{TokioAsyncReadCompatExt, TokioAsyncWriteCompatExt};

/// Session update event that can be sent to the frontend
#[derive(Debug, Clone, serde::Serialize)]
#[serde(tag = "type")]
pub enum SessionUpdateEvent {
    AgentMessageChunk { content: String },
    ToolCall { tool_call_id: String, title: String },
    ToolCallUpdate { tool_call_id: String, status: String },
    AgentThought { content: String },
    PlanUpdate { plan: String },
    CommandsAvailable { commands: Vec<String> },
    Other { data: Value },
}

/// Permission request that needs user approval
#[derive(Debug, Clone, serde::Serialize)]
pub struct PermissionRequestData {
    pub request_id: String,
    pub options: Vec<PermissionOption>,
}

#[derive(Debug, Clone, serde::Serialize)]
pub struct PermissionOption {
    pub option_id: String,
    pub description: String,
}

/// ACP client connection to a kiro-cli agent
pub struct AcpClient {
    process_handle: tokio::process::Child,
    session_update_tx: mpsc::UnboundedSender<SessionUpdateEvent>,
    permission_request_tx: mpsc::UnboundedSender<PermissionRequestData>,
    permission_response_rx: Arc<Mutex<mpsc::UnboundedReceiver<String>>>,
}

impl AcpClient {
    /// Connect to a kiro-cli agent process
    pub async fn connect(
        kiro_cli_path: String,
        session_update_tx: mpsc::UnboundedSender<SessionUpdateEvent>,
        permission_request_tx: mpsc::UnboundedSender<PermissionRequestData>,
        permission_response_rx: mpsc::UnboundedReceiver<String>,
    ) -> Result<Self> {
        // Spawn the kiro-cli process
        let mut cmd = tokio::process::Command::new(&kiro_cli_path);
        cmd.stdin(std::process::Stdio::piped())
            .stdout(std::process::Stdio::piped());

        let mut child = cmd
            .spawn()
            .context(format!("Failed to spawn kiro-cli: {}", kiro_cli_path))?;

        let child_stdin = child
            .stdin
            .take()
            .ok_or_else(|| anyhow::anyhow!("Failed to open stdin"))?;
        let child_stdout = child
            .stdout
            .take()
            .ok_or_else(|| anyhow::anyhow!("Failed to open stdout"))?;

        // Create the ACP transport
        let transport = ByteStreams::new(child_stdin.compat_write(), child_stdout.compat());

        let permission_response_rx = Arc::new(Mutex::new(permission_response_rx));
        let permission_response_rx_clone = Arc::clone(&permission_response_rx);

        // Start the client with handlers
        let session_update_tx_clone = session_update_tx.clone();
        let permission_request_tx_clone = permission_request_tx.clone();

        tokio::spawn(async move {
            let result = agent_client_protocol::Client.builder()
                .on_receive_notification(
                    async move |notification: SessionNotification, _cx| {
                        // Forward session updates to the frontend
                        let event = Self::parse_session_update(notification.update);
                        let _ = session_update_tx_clone.send(event);
                        Ok(())
                    },
                    |f: &mut _, notif, cx| Box::pin(f(notif, cx)),
                )
                .on_receive_request(
                    async move |request: RequestPermissionRequest, responder, _connection| -> agent_client_protocol::Result<()> {
                        // Send permission request to frontend
                        let request_id = uuid::Uuid::new_v4().to_string();
                        let options = request
                            .options
                            .iter()
                            .map(|opt| PermissionOption {
                                option_id: opt.option_id.clone(),
                                description: opt.description.clone(),
                            })
                            .collect();

                        let permission_data = PermissionRequestData {
                            request_id: request_id.clone(),
                            options,
                        };

                        if permission_request_tx_clone.send(permission_data).is_err() {
                            // Channel closed, respond with cancelled
                            responder.respond(RequestPermissionResponse::new(
                                RequestPermissionOutcome::Cancelled,
                            ));
                            return Ok(());
                        }

                        // Wait for response from frontend
                        let response = {
                            let mut rx = permission_response_rx_clone.lock().await;
                            rx.recv().await
                        };

                        match response {
                            Some(option_id) if !option_id.is_empty() => {
                                responder.respond(RequestPermissionResponse::new(
                                    RequestPermissionOutcome::Selected(
                                        SelectedPermissionOutcome::new(option_id),
                                    ),
                                ));
                            }
                            _ => {
                                responder.respond(RequestPermissionResponse::new(
                                    RequestPermissionOutcome::Cancelled,
                                ));
                            }
                        }
                        Ok(())
                    },
                    |f: &mut _, req, responder, cx| Box::pin(f(req, responder, cx)),
                )
                .connect_with(transport, |connection: ConnectionTo<Agent>| async move {
                    // Initialize the agent
                    let _init_response = connection
                        .send_request(InitializeRequest::new(ProtocolVersion::V1))
                        .block_task()
                        .await?;

                    // Keep the connection alive
                    futures::future::pending::<Result<()>>().await
                })
                .await;

            if let Err(e) = result {
                eprintln!("ACP client error: {:?}", e);
            }
        });

        Ok(Self {
            process_handle: child,
            session_update_tx,
            permission_request_tx,
            permission_response_rx,
        })
    }

    /// Parse a session update notification into a frontend event
    fn parse_session_update(update: Value) -> SessionUpdateEvent {
        // Try to parse as different update types
        if let Some(obj) = update.as_object() {
            if let Some(update_type) = obj.get("type").and_then(|v| v.as_str()) {
                match update_type {
                    "agentMessageChunk" => {
                        if let Some(content) = obj.get("content").and_then(|v| v.as_str()) {
                            return SessionUpdateEvent::AgentMessageChunk {
                                content: content.to_string(),
                            };
                        }
                    }
                    "toolCall" => {
                        let tool_call_id = obj
                            .get("toolCallId")
                            .and_then(|v| v.as_str())
                            .unwrap_or("")
                            .to_string();
                        let title = obj
                            .get("title")
                            .and_then(|v| v.as_str())
                            .unwrap_or("")
                            .to_string();
                        return SessionUpdateEvent::ToolCall { tool_call_id, title };
                    }
                    "toolCallUpdate" => {
                        let tool_call_id = obj
                            .get("toolCallId")
                            .and_then(|v| v.as_str())
                            .unwrap_or("")
                            .to_string();
                        let status = obj
                            .get("status")
                            .and_then(|v| v.as_str())
                            .unwrap_or("")
                            .to_string();
                        return SessionUpdateEvent::ToolCallUpdate {
                            tool_call_id,
                            status,
                        };
                    }
                    "agentThoughtChunk" => {
                        if let Some(content) = obj.get("content").and_then(|v| v.as_str()) {
                            return SessionUpdateEvent::AgentThought {
                                content: content.to_string(),
                            };
                        }
                    }
                    "planUpdate" => {
                        if let Some(plan) = obj.get("plan").and_then(|v| v.as_str()) {
                            return SessionUpdateEvent::PlanUpdate {
                                plan: plan.to_string(),
                            };
                        }
                    }
                    _ => {}
                }
            }
        }

        SessionUpdateEvent::Other { data: update }
    }

    /// Disconnect and cleanup
    pub async fn disconnect(mut self) -> Result<()> {
        self.process_handle.kill().await?;
        Ok(())
    }
}

/// Handle to send requests to an ACP connection
pub struct AcpConnectionHandle {
    connection: ConnectionTo<Agent>,
}

impl AcpConnectionHandle {
    /// Create a new session
    pub async fn new_session(&self, cwd: PathBuf) -> Result<String> {
        let response = self
            .connection
            .send_request(NewSessionRequest::new(cwd))
            .block_task()
            .await?;

        Ok(response.session_id)
    }

    /// Send a prompt to a session
    pub async fn send_prompt(&self, session_id: String, prompt: String) -> Result<()> {
        let _response = self
            .connection
            .send_request(PromptRequest::new(
                session_id,
                vec![ContentBlock::Text(TextContent::new(prompt))],
            ))
            .block_task()
            .await?;

        Ok(())
    }
}
