//! Git operations module for worktree management

use anyhow::{Context, Result};
use git2::{BranchType, Repository};
use std::path::{Path, PathBuf};

/// Check if a directory is a git repository
pub fn is_git_repo(path: &Path) -> Result<bool> {
    Ok(Repository::open(path).is_ok())
}

/// Get the current branch name
pub fn get_current_branch(repo_path: &Path) -> Result<String> {
    let repo = Repository::open(repo_path)?;
    let head = repo.head()?;

    if let Some(branch_name) = head.shorthand() {
        Ok(branch_name.to_string())
    } else {
        Ok("HEAD".to_string())
    }
}

/// Create a new git worktree
///
/// Creates a worktree as a sibling directory to the main repository.
/// For example, if the repo is at `/path/to/repo`, the worktree will be at
/// `/path/to/repo-worktree-{branch_name}`
pub fn create_worktree(repo_path: &Path, branch_name: &str) -> Result<PathBuf> {
    let repo = Repository::open(repo_path)
        .context("Failed to open git repository")?;

    // Sanitize branch name for directory
    let dir_suffix = branch_name.replace('/', "-");

    // Get the parent directory and repo name
    let repo_dir_name = repo_path
        .file_name()
        .context("Invalid repository path")?
        .to_str()
        .context("Invalid UTF-8 in path")?;

    let parent_dir = repo_path
        .parent()
        .context("Repository has no parent directory")?;

    // Create worktree path as sibling directory
    let worktree_name = format!("{}-worktree-{}", repo_dir_name, dir_suffix);
    let worktree_path = parent_dir.join(worktree_name);

    // Check if worktree already exists
    if worktree_path.exists() {
        anyhow::bail!("Worktree directory already exists: {}", worktree_path.display());
    }

    // Check if branch exists, create if it doesn't
    let branch_exists = repo
        .find_branch(branch_name, BranchType::Local)
        .is_ok();

    if !branch_exists {
        // Create new branch from HEAD
        let head_commit = repo.head()?.peel_to_commit()?;
        repo.branch(branch_name, &head_commit, false)
            .context("Failed to create branch")?;
    }

    // Create the worktree
    repo.worktree(
        branch_name,
        &worktree_path,
        None,
    ).context("Failed to create git worktree")?;

    Ok(worktree_path)
}

/// Remove a git worktree
pub fn remove_worktree(repo_path: &Path, worktree_path: &Path) -> Result<()> {
    let repo = Repository::open(repo_path)
        .context("Failed to open git repository")?;

    // Get the worktree name from the path
    let worktree_name = worktree_path
        .file_name()
        .context("Invalid worktree path")?
        .to_str()
        .context("Invalid UTF-8 in path")?;

    // Find and remove the worktree
    let worktree = repo.find_worktree(worktree_name)
        .context("Worktree not found")?;

    // Prune the worktree (this removes it from git's tracking)
    worktree.prune(None)
        .context("Failed to prune worktree")?;

    // Remove the directory if it still exists
    if worktree_path.exists() {
        std::fs::remove_dir_all(worktree_path)
            .context("Failed to remove worktree directory")?;
    }

    Ok(())
}

/// List all worktrees for a repository
pub fn list_worktrees(repo_path: &Path) -> Result<Vec<PathBuf>> {
    let repo = Repository::open(repo_path)
        .context("Failed to open git repository")?;

    let mut worktrees = Vec::new();

    // Get worktree names
    let worktree_names = repo.worktrees()
        .context("Failed to get worktrees")?;

    for name_bytes in worktree_names.iter() {
        if let Some(name) = name_bytes {
            if let Ok(worktree) = repo.find_worktree(name) {
                let path = worktree.path();
                worktrees.push(path.to_path_buf());
            }
        }
    }

    Ok(worktrees)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_is_git_repo() {
        // This will fail in non-git directories
        let current_dir = std::env::current_dir().unwrap();
        let result = is_git_repo(&current_dir);
        // Just ensure it doesn't crash
        assert!(result.is_ok());
    }
}
