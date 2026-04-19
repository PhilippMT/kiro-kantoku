import { useTaskStore } from '../stores/taskStore';
import { Task } from '../types';
import { formatDistanceToNow } from '../lib/utils';

export function Dashboard() {
  const { tasks, activeTasks, activities, setSelectedTask } = useTaskStore();

  const activeTasksList = activeTasks.map(id => tasks.get(id)).filter(Boolean) as Task[];

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      {/* Sidebar - Active Tasks */}
      <aside className="w-80 bg-gray-800 border-r border-gray-700 flex flex-col">
        <div className="p-4 border-b border-gray-700">
          <h2 className="text-lg font-semibold">Active Tasks</h2>
          <p className="text-sm text-gray-400">{activeTasks.length} task{activeTasks.length !== 1 ? 's' : ''}</p>
        </div>

        <div className="flex-1 overflow-y-auto">
          {activeTasksList.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              <p className="text-sm">No active tasks</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-700">
              {activeTasksList.map(task => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onClick={() => setSelectedTask(task.id)}
                />
              ))}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-gray-700">
          <h3 className="text-sm font-semibold mb-2">Task History</h3>
          <p className="text-xs text-gray-500">No completed tasks</p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        <header className="bg-gray-800 border-b border-gray-700 p-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Tasks Overview</h1>
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded font-medium transition-colors">
              New Task
            </button>
            <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded font-medium transition-colors">
              Cancel All Tasks
            </button>
            <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded font-medium transition-colors">
              Refresh All
            </button>
          </div>
        </header>

        <div className="flex-1 grid grid-cols-2 gap-6 p-6 overflow-y-auto">
          {/* Tasks Overview Panel */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Active Tasks</h2>
            {activeTasksList.length === 0 ? (
              <p className="text-gray-500">No active tasks</p>
            ) : (
              <div className="space-y-4">
                {activeTasksList.map(task => (
                  <div
                    key={task.id}
                    className="bg-gray-700 rounded-lg p-4 cursor-pointer hover:bg-gray-600 transition-colors"
                    onClick={() => setSelectedTask(task.id)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <StatusIndicator status={task.status} />
                        <h3 className="font-semibold">{task.name}</h3>
                      </div>
                      <span className="text-xs text-gray-400">
                        {task.status === 'working' && 'Working'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-400">{task.directory}</p>
                    {task.branch && (
                      <p className="text-xs text-purple-400 mt-1">
                        🌿 {task.branch}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mt-2">No messages yet</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Activity Feed Panel */}
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Activity Feed</h2>
              <span className="text-sm text-gray-400">{activities.length} events</span>
            </div>
            {activities.length === 0 ? (
              <p className="text-gray-500">No activity yet</p>
            ) : (
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {activities.map(activity => (
                  <ActivityItem key={activity.id} activity={activity} />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

interface TaskCardProps {
  task: Task;
  onClick: () => void;
}

function TaskCard({ task, onClick }: TaskCardProps) {
  return (
    <div
      className="p-4 cursor-pointer hover:bg-gray-700 transition-colors"
      onClick={onClick}
    >
      <div className="flex items-center gap-3 mb-2">
        <StatusIndicator status={task.status} />
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold truncate">{task.name}</h3>
          <p className="text-xs text-gray-400 truncate">{task.directory}</p>
        </div>
      </div>
      {task.branch && (
        <p className="text-xs text-purple-400">🌿 {task.branch}</p>
      )}
      <p className="text-xs text-gray-500 mt-1">
        {formatDistanceToNow(task.createdAt)}
      </p>
    </div>
  );
}

interface StatusIndicatorProps {
  status: Task['status'];
}

function StatusIndicator({ status }: StatusIndicatorProps) {
  const colors = {
    pending: 'bg-gray-500',
    starting: 'bg-yellow-500',
    working: 'bg-green-500 animate-pulse',
    paused: 'bg-yellow-500',
    completed: 'bg-blue-500',
    failed: 'bg-red-500',
    cancelled: 'bg-gray-500',
  };

  return (
    <div className="flex items-center gap-2">
      <div className={`w-2 h-2 rounded-full ${colors[status]}`} />
    </div>
  );
}

interface ActivityItemProps {
  activity: { id: string; taskName: string; type: string; message: string; timestamp: Date };
}

function ActivityItem({ activity }: ActivityItemProps) {
  const icons = {
    tool_call: '⚙️',
    error: '⚠️',
    status: 'ℹ️',
    user_message: '💬',
  };

  const icon = icons[activity.type as keyof typeof icons] || 'ℹ️';

  return (
    <div className="flex items-start gap-3 p-3 bg-gray-700 rounded">
      <span className="text-lg">{icon}</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span className="font-semibold text-sm">{activity.taskName}</span>
          <span className="text-xs text-gray-400">
            {formatDistanceToNow(activity.timestamp)}
          </span>
        </div>
        <p className="text-sm text-gray-300">{activity.message}</p>
      </div>
    </div>
  );
}
