import { useState } from 'react';
import { Dashboard } from './components/Dashboard';
import { MainView } from './components/MainView';
import { NewTaskModal } from './components/NewTaskModal';
import { useTaskStore } from './stores/taskStore';

type View = 'dashboard' | 'task';

function App() {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [showNewTaskModal, setShowNewTaskModal] = useState(false);

  const selectedTaskId = useTaskStore(state => state.selectedTaskId);
  const setSelectedTask = useTaskStore(state => state.setSelectedTask);

  // Switch back to dashboard
  const handleBackToDashboard = () => {
    setCurrentView('dashboard');
    setSelectedTask(null);
  };

  return (
    <>
      {currentView === 'dashboard' && (
        <div className="relative">
          <Dashboard />
          {/* Floating New Task Button */}
          <button
            onClick={() => setShowNewTaskModal(true)}
            className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 hover:bg-blue-700 rounded-full shadow-lg flex items-center justify-center text-2xl transition-colors"
          >
            +
          </button>
        </div>
      )}

      {currentView === 'task' && selectedTaskId && (
        <MainView taskId={selectedTaskId} onClose={handleBackToDashboard} />
      )}

      <NewTaskModal
        isOpen={showNewTaskModal}
        onClose={() => setShowNewTaskModal(false)}
      />
    </>
  );
}

export default App;
