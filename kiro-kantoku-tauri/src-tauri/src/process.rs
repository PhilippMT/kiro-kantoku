/// Process management for spawning and managing kiro-cli subprocesses

use async_process::{Command, Child};
use std::process::Stdio;

pub struct ProcessManager {
    processes: Vec<Child>,
}

impl ProcessManager {
    pub fn new() -> Self {
        Self {
            processes: Vec::new(),
        }
    }

    pub async fn spawn(&mut self, command: &str, args: &[String]) -> Result<u32, String> {
        let child = Command::new(command)
            .args(args)
            .stdin(Stdio::piped())
            .stdout(Stdio::piped())
            .stderr(Stdio::piped())
            .spawn()
            .map_err(|e| e.to_string())?;

        let pid = child.id();
        self.processes.push(child);
        Ok(pid)
    }

    pub async fn kill(&mut self, pid: u32) -> Result<(), String> {
        // Find and kill the process
        if let Some(pos) = self.processes.iter().position(|p| p.id() == pid) {
            let mut process = self.processes.remove(pos);
            process.kill().map_err(|e| e.to_string())?;
        }
        Ok(())
    }
}

impl Default for ProcessManager {
    fn default() -> Self {
        Self::new()
    }
}
