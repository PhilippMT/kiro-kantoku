import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { Task } from '../types';
import { useTaskStore } from '../stores/taskStore';

interface NewTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NewTaskModal({ isOpen, onClose }: NewTaskModalProps) {
  const [taskName, setTaskName] = useState('');
  const [directory, setDirectory] = useState('');
  const [branch, setBranch] = useState('');
  const [currentBranch, setCurrentBranch] = useState('');
  const [isGitRepo, setIsGitRepo] = useState(false);
  const [useWorktree, setUseWorktree] = useState(false);
  const [newBranchName, setNewBranchName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const addTask = useTaskStore(state => state.addTask);

  useEffect(() => {
    if (isOpen) {
      // Reset form
      setTaskName('');
      setDirectory('');
      setBranch('');
      setCurrentBranch('');
      setIsGitRepo(false);
      setUseWorktree(false);
      setNewBranchName('');
    }
  }, [isOpen]);

  useEffect(() => {
    if (directory) {
      checkGitRepo();
    }
  }, [directory]);

  const checkGitRepo = async () => {
    try {
      const result = await invoke<{ isRepo: boolean; currentBranch?: string }>(
        'check_git_repo',
        { directory }
      );
      setIsGitRepo(result.isRepo);
      if (result.currentBranch) {
        setCurrentBranch(result.currentBranch);
        setBranch(result.currentBranch);
      }
    } catch (error) {
      console.error('Failed to check git repo:', error);
      setIsGitRepo(false);
    }
  };

  const handleChooseDirectory = async () => {
    try {
      // Use Tauri dialog plugin
      const { open } = await import('@tauri-apps/plugin-dialog');
      const selected = await open({
        directory: true,
        multiple: false,
        title: 'Choose Project Directory',
      });

      if (selected && typeof selected === 'string') {
        setDirectory(selected);

        // Auto-generate task name from directory if empty
        if (!taskName) {
          const dirName = selected.split(/[/\\]/).pop() || '';
          setTaskName(dirName);
        }
      }
    } catch (error) {
      console.error('Failed to open directory picker:', error);
    }
  };

  const handleCreate = async () => {
    if (!taskName.trim() || !directory) return;

    setIsCreating(true);

    try {
      const task: Task = {
        id: crypto.randomUUID(),
        name: taskName,
        directory,
        branch: useWorktree ? newBranchName : branch,
        status: 'pending',
        createdAt: new Date(),
        messages: [],
      };

      // If using worktree, create it
      if (useWorktree && newBranchName) {
        try {
          const worktreePath = await invoke<string>('create_git_worktree', {
            directory,
            branchName: newBranchName,
          });
          task.gitWorktree = worktreePath;
          task.directory = worktreePath; // Use worktree as working directory
        } catch (error) {
          console.error('Failed to create git worktree:', error);
          alert('Failed to create git worktree: ' + error);
          setIsCreating(false);
          return;
        }
      }

      // Add task to store
      addTask(task);

      // Start ACP connection
      try {
        const connectionId = await invoke<string>('acp_connect', {
          kiroCliPath: '/usr/local/bin/kiro', // TODO: Make configurable
        });

        const sessionId = await invoke<string>('acp_new_session', {
          connectionId,
          cwd: task.directory,
        });

        // Update task with connection info
        useTaskStore.getState().updateTask(task.id, {
          connectionId,
          sessionId,
          status: 'working',
          startedAt: new Date(),
        });
      } catch (error) {
        console.error('Failed to start ACP connection:', error);
        useTaskStore.getState().updateTask(task.id, { status: 'failed' });
      }

      onClose();
    } catch (error) {
      console.error('Failed to create task:', error);
      alert('Failed to create task: ' + error);
    } finally {
      setIsCreating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-2xl border border-gray-700">
        <h2 className="text-2xl font-bold mb-6">New Task</h2>

        {/* Task Name */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Task Name</label>
          <input
            type="text"
            value={taskName}
            onChange={(e) => setTaskName(e.target.value)}
            placeholder="TRACK-123-add-docs"
            className="w-full bg-gray-700 rounded px-4 py-3 border border-gray-600 focus:border-blue-500 focus:outline-none"
          />
        </div>

        {/* Directory */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Directory</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={directory}
              onChange={(e) => setDirectory(e.target.value)}
              placeholder="/Users/username/code/project"
              className="flex-1 bg-gray-700 rounded px-4 py-3 border border-gray-600 focus:border-blue-500 focus:outline-none"
            />
            <button
              onClick={handleChooseDirectory}
              className="bg-gray-700 hover:bg-gray-600 px-6 py-3 rounded font-medium transition-colors"
            >
              Choose...
            </button>
          </div>
        </div>

        {/* Git Section */}
        {isGitRepo && (
          <div className="mb-6 bg-gray-700 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-purple-400">🌿</span>
              <span className="font-medium">Git Repository Detected</span>
            </div>
            <p className="text-sm text-gray-400 mb-3">
              Current branch: <span className="text-white">{currentBranch}</span>
            </p>

            {/* Branch Input */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                Branch (leave empty for current)
              </label>
              <input
                type="text"
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                placeholder={currentBranch}
                disabled={useWorktree}
                className="w-full bg-gray-600 rounded px-4 py-2 border border-gray-500 focus:border-blue-500 focus:outline-none disabled:opacity-50"
              />
            </div>

            {/* Worktree Option */}
            <div className="flex items-center gap-3 mb-3">
              <input
                type="checkbox"
                id="use-worktree"
                checked={useWorktree}
                onChange={(e) => setUseWorktree(e.target.checked)}
                className="w-4 h-4 rounded bg-gray-600 border-gray-500"
              />
              <label htmlFor="use-worktree" className="text-sm font-medium cursor-pointer">
                Create task in new worktree
              </label>
            </div>

            {useWorktree && (
              <div>
                <label className="block text-sm font-medium mb-2">
                  New branch name (e.g., feature/my-feature)
                </label>
                <input
                  type="text"
                  value={newBranchName}
                  onChange={(e) => setNewBranchName(e.target.value)}
                  placeholder="feat/TRACK-123-docs"
                  className="w-full bg-gray-600 rounded px-4 py-2 border border-gray-500 focus:border-blue-500 focus:outline-none"
                />
                <p className="text-xs text-gray-400 mt-2">
                  A new worktree will be created as a sibling directory.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={isCreating}
            className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded font-medium transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={!taskName.trim() || !directory || isCreating || (useWorktree && !newBranchName)}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCreating ? 'Creating...' : 'Create Task'}
          </button>
        </div>
      </div>
    </div>
  );
}
