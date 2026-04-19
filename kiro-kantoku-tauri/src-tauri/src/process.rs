/// Enhanced process management for spawning and managing kiro-cli subprocesses
/// with full stdin/stdout/stderr handling

use async_process::{Child, ChildStdin, ChildStdout, ChildStderr, Command};
use std::collections::HashMap;
use std::process::Stdio;
use std::sync::Arc;
use tokio::sync::Mutex;
use futures::io::{AsyncBufReadExt, AsyncWriteExt, BufReader};
use anyhow::{Result, Context};

pub type ProcessId = u32;

#[derive(Debug)]
pub struct ManagedProcess {
    pub id: ProcessId,
    pub child: Child,
    pub stdin: Option<ChildStdin>,
    pub stdout_reader: Option<BufReader<ChildStdout>>,
    pub stderr_reader: Option<BufReader<ChildStderr>>,
}

pub struct ProcessManager {
    processes: Arc<Mutex<HashMap<ProcessId, ManagedProcess>>>,
}

impl ProcessManager {
    pub fn new() -> Self {
        Self {
            processes: Arc::new(Mutex::new(HashMap::new())),
        }
    }

    /// Spawn a new process with piped stdin/stdout/stderr
    pub async fn spawn(
        &self,
        command: &str,
        args: &[String],
        cwd: Option<&str>,
    ) -> Result<ProcessId> {
        let mut cmd = Command::new(command);
        cmd.args(args)
            .stdin(Stdio::piped())
            .stdout(Stdio::piped())
            .stderr(Stdio::piped());

        if let Some(dir) = cwd {
            cmd.current_dir(dir);
        }

        let mut child = cmd
            .spawn()
            .context(format!("Failed to spawn process: {}", command))?;

        let pid = child.id();

        // Take ownership of stdio handles
        let stdin = child.stdin.take();
        let stdout = child.stdout.take().map(BufReader::new);
        let stderr = child.stderr.take().map(BufReader::new);

        let process = ManagedProcess {
            id: pid,
            child,
            stdin,
            stdout_reader: stdout,
            stderr_reader: stderr,
        };

        let mut processes = self.processes.lock().await;
        processes.insert(pid, process);

        Ok(pid)
    }

    /// Write data to process stdin
    pub async fn write_stdin(&self, pid: ProcessId, data: &[u8]) -> Result<()> {
        let mut processes = self.processes.lock().await;

        if let Some(process) = processes.get_mut(&pid) {
            if let Some(stdin) = &mut process.stdin {
                stdin.write_all(data).await
                    .context("Failed to write to stdin")?;
                stdin.flush().await
                    .context("Failed to flush stdin")?;
                Ok(())
            } else {
                anyhow::bail!("Process stdin is not available")
            }
        } else {
            anyhow::bail!("Process not found: {}", pid)
        }
    }

    /// Read a line from process stdout
    pub async fn read_stdout_line(&self, pid: ProcessId) -> Result<Option<String>> {
        let mut processes = self.processes.lock().await;

        if let Some(process) = processes.get_mut(&pid) {
            if let Some(reader) = &mut process.stdout_reader {
                let mut line = String::new();
                let bytes_read = reader.read_line(&mut line).await
                    .context("Failed to read from stdout")?;

                if bytes_read == 0 {
                    Ok(None) // EOF
                } else {
                    Ok(Some(line))
                }
            } else {
                anyhow::bail!("Process stdout is not available")
            }
        } else {
            anyhow::bail!("Process not found: {}", pid)
        }
    }

    /// Read a line from process stderr
    pub async fn read_stderr_line(&self, pid: ProcessId) -> Result<Option<String>> {
        let mut processes = self.processes.lock().await;

        if let Some(process) = processes.get_mut(&pid) {
            if let Some(reader) = &mut process.stderr_reader {
                let mut line = String::new();
                let bytes_read = reader.read_line(&mut line).await
                    .context("Failed to read from stderr")?;

                if bytes_read == 0 {
                    Ok(None) // EOF
                } else {
                    Ok(Some(line))
                }
            } else {
                anyhow::bail!("Process stderr is not available")
            }
        } else {
            anyhow::bail!("Process not found: {}", pid)
        }
    }

    /// Kill a process
    pub async fn kill(&self, pid: ProcessId) -> Result<()> {
        let mut processes = self.processes.lock().await;

        if let Some(mut process) = processes.remove(&pid) {
            process.child.kill()
                .context("Failed to kill process")?;
            Ok(())
        } else {
            anyhow::bail!("Process not found: {}", pid)
        }
    }

    /// Check if a process is still running
    pub async fn is_running(&self, pid: ProcessId) -> bool {
        let processes = self.processes.lock().await;
        processes.contains_key(&pid)
    }

    /// Wait for a process to exit
    pub async fn wait(&self, pid: ProcessId) -> Result<std::process::ExitStatus> {
        let mut processes = self.processes.lock().await;

        if let Some(process) = processes.get_mut(&pid) {
            process.child.status().await
                .context("Failed to wait for process")
        } else {
            anyhow::bail!("Process not found: {}", pid)
        }
    }

    /// Get list of all running process IDs
    pub async fn list_processes(&self) -> Vec<ProcessId> {
        let processes = self.processes.lock().await;
        processes.keys().copied().collect()
    }

    /// Cleanup finished processes
    pub async fn cleanup_finished(&self) {
        // Note: async_process doesn't provide try_wait, so we rely on explicit cleanup
        // when processes exit or are killed
    }
}

impl Default for ProcessManager {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_spawn_process() {
        let pm = ProcessManager::new();
        let pid = pm.spawn("echo", &["test".to_string()], None).await;
        assert!(pid.is_ok());
    }

    #[tokio::test]
    async fn test_process_lifecycle() {
        let pm = ProcessManager::new();
        let pid = pm.spawn("sleep", &["1".to_string()], None).await.unwrap();

        assert!(pm.is_running(pid).await);
        pm.kill(pid).await.unwrap();

        tokio::time::sleep(tokio::time::Duration::from_millis(100)).await;
        assert!(!pm.is_running(pid).await);
    }
}
