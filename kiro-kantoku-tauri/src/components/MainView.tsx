import { useState } from 'react';
import { ChatInterface } from './ChatInterface';
import { CodePanel } from './CodePanel';
import { useTaskStore } from '../stores/taskStore';

interface MainViewProps {
  taskId: string;
  onClose: () => void;
}

export function MainView({ taskId, onClose }: MainViewProps) {
  const [showCodePanel, setShowCodePanel] = useState(true);

  const task = useTaskStore(state => state.tasks.get(taskId));

  if (!task) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
        <p>Task not found</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white">
      {/* Window Controls */}
      <div className="bg-gray-800 border-b border-gray-700 px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500" onClick={onClose} />
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <div className="w-3 h-3 rounded-full bg-green-500" />
          </div>
          <span className="ml-4 text-sm font-medium">{task.name}</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCodePanel(!showCodePanel)}
            className="px-3 py-1 text-sm bg-gray-700 hover:bg-gray-600 rounded transition-colors"
          >
            {showCodePanel ? 'Hide' : 'Show'} Code Panel
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Chat Panel */}
        <div className={`${showCodePanel ? 'w-1/2' : 'w-full'} border-r border-gray-700`}>
          <ChatInterface taskId={taskId} />
        </div>

        {/* Code Panel */}
        {showCodePanel && (
          <div className="w-1/2">
            <CodePanel taskId={taskId} />
          </div>
        )}
      </div>
    </div>
  );
}
