import { useState } from 'react';
import Editor from '@monaco-editor/react';
import { FileChange } from '../types';

interface CodePanelProps {
  taskId: string;
}

export function CodePanel({ taskId }: CodePanelProps) {
  const [activeTab, setActiveTab] = useState<'files' | 'terminal' | 'debug'>('files');
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [fileChanges] = useState<FileChange[]>([
    // Mock data - will be populated from real file watching
  ]);

  return (
    <div className="flex flex-col h-full bg-gray-900">
      {/* Tabs */}
      <div className="bg-gray-800 border-b border-gray-700 flex items-center gap-1 px-2">
        <TabButton
          active={activeTab === 'files'}
          onClick={() => setActiveTab('files')}
          label="Files Changed"
        />
        <TabButton
          active={activeTab === 'terminal'}
          onClick={() => setActiveTab('terminal')}
          label="Terminal"
        />
        <TabButton
          active={activeTab === 'debug'}
          onClick={() => setActiveTab('debug')}
          label="Debug"
        />

        {/* Action Buttons */}
        <div className="ml-auto flex items-center gap-2 p-2">
          <button className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded text-sm transition-colors">
            Pause
          </button>
          <button className="px-3 py-1.5 bg-green-600 hover:bg-green-700 rounded text-sm transition-colors">
            Complete
          </button>
          <button className="px-3 py-1.5 bg-red-600 hover:bg-red-700 rounded text-sm transition-colors">
            Cancel
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'files' && (
          <FilesChangedPanel
            fileChanges={fileChanges}
            selectedFile={selectedFile}
            onSelectFile={setSelectedFile}
          />
        )}
        {activeTab === 'terminal' && <TerminalPanel taskId={taskId} />}
        {activeTab === 'debug' && <DebugPanel taskId={taskId} />}
      </div>
    </div>
  );
}

interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  label: string;
}

function TabButton({ active, onClick, label }: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2.5 font-medium text-sm transition-colors ${
        active
          ? 'bg-blue-600 text-white'
          : 'bg-transparent text-gray-400 hover:text-white hover:bg-gray-700'
      }`}
    >
      {label}
    </button>
  );
}

interface FilesChangedPanelProps {
  fileChanges: FileChange[];
  selectedFile: string | null;
  onSelectFile: (file: string | null) => void;
}

function FilesChangedPanel({ fileChanges, selectedFile, onSelectFile }: FilesChangedPanelProps) {
  if (fileChanges.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        <div className="text-center">
          <p className="text-lg mb-2">No files changed yet</p>
          <p className="text-sm">Changes will appear here as the agent works</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full">
      {/* File List */}
      <div className="w-80 bg-gray-800 border-r border-gray-700 overflow-y-auto">
        <div className="p-3 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">
              {fileChanges.length} file{fileChanges.length !== 1 ? 's' : ''} changed
            </span>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-green-400">
                +{fileChanges.reduce((sum, f) => sum + f.additions, 0)}
              </span>
              <span className="text-red-400">
                -{fileChanges.reduce((sum, f) => sum + f.deletions, 0)}
              </span>
            </div>
          </div>
        </div>
        <div className="divide-y divide-gray-700">
          {fileChanges.map((file) => (
            <FileChangeItem
              key={file.path}
              file={file}
              isSelected={selectedFile === file.path}
              onClick={() => onSelectFile(file.path)}
            />
          ))}
        </div>
      </div>

      {/* File Diff Viewer */}
      <div className="flex-1 bg-gray-900">
        {selectedFile ? (
          <Editor
            height="100%"
            defaultLanguage="diff"
            theme="vs-dark"
            value={`// Diff for ${selectedFile}\n// TODO: Implement diff viewing`}
            options={{
              readOnly: true,
              minimap: { enabled: false },
              lineNumbers: 'on',
            }}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            Select a file to view changes
          </div>
        )}
      </div>
    </div>
  );
}

interface FileChangeItemProps {
  file: FileChange;
  isSelected: boolean;
  onClick: () => void;
}

function FileChangeItem({ file, isSelected, onClick }: FileChangeItemProps) {
  const statusIcons = {
    added: '✚',
    modified: '●',
    deleted: '✖',
  };

  const statusColors = {
    added: 'text-green-400',
    modified: 'text-yellow-400',
    deleted: 'text-red-400',
  };

  return (
    <div
      onClick={onClick}
      className={`p-3 cursor-pointer transition-colors ${
        isSelected ? 'bg-gray-700' : 'hover:bg-gray-750'
      }`}
    >
      <div className="flex items-center gap-2 mb-1">
        <span className={statusColors[file.status]}>{statusIcons[file.status]}</span>
        <span className="text-sm font-mono flex-1 truncate">{file.path}</span>
      </div>
      <div className="flex items-center gap-3 text-xs ml-5">
        <span className="text-green-400">+{file.additions}</span>
        <span className="text-red-400">-{file.deletions}</span>
      </div>
    </div>
  );
}

interface TerminalPanelProps {
  taskId: string;
}

function TerminalPanel({ taskId }: TerminalPanelProps) {
  return (
    <div className="h-full bg-black p-4 font-mono text-sm text-green-400 overflow-y-auto">
      <div>$ kiro --version</div>
      <div className="text-gray-400">kiro 1.0.0</div>
      <div className="mt-2">$ # Terminal output will appear here</div>
      <div className="text-gray-500 mt-4">Task ID: {taskId}</div>
    </div>
  );
}

interface DebugPanelProps {
  taskId: string;
}

function DebugPanel({ taskId }: DebugPanelProps) {
  return (
    <div className="h-full bg-gray-900 p-4 overflow-y-auto">
      <h3 className="text-lg font-semibold mb-4">Debug Information</h3>
      <div className="space-y-4">
        <div className="bg-gray-800 rounded p-3">
          <h4 className="text-sm font-medium mb-2">Task ID</h4>
          <p className="text-xs font-mono text-gray-400">{taskId}</p>
        </div>
        <div className="bg-gray-800 rounded p-3">
          <h4 className="text-sm font-medium mb-2">Connection Status</h4>
          <p className="text-xs text-gray-400">Connected</p>
        </div>
        <div className="bg-gray-800 rounded p-3">
          <h4 className="text-sm font-medium mb-2">Session Info</h4>
          <p className="text-xs text-gray-400">Session active</p>
        </div>
      </div>
    </div>
  );
}
