import { create } from 'zustand';
import { Task, Activity, ChatMessage, SessionUpdateEvent } from '../types';

interface TaskStore {
  tasks: Map<string, Task>;
  activeTasks: string[];
  activities: Activity[];
  selectedTaskId: string | null;

  // Task management
  addTask: (task: Task) => void;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  removeTask: (taskId: string) => void;
  setSelectedTask: (taskId: string | null) => void;

  // Message management
  addMessage: (taskId: string, message: ChatMessage) => void;
  updateLastMessage: (taskId: string, content: string) => void;

  // Activity feed
  addActivity: (activity: Activity) => void;
  clearActivities: () => void;

  // Session update handling
  handleSessionUpdate: (taskId: string, event: SessionUpdateEvent) => void;
}

export const useTaskStore = create<TaskStore>((set, get) => ({
  tasks: new Map(),
  activeTasks: [],
  activities: [],
  selectedTaskId: null,

  addTask: (task) => set((state) => {
    const newTasks = new Map(state.tasks);
    newTasks.set(task.id, task);
    return {
      tasks: newTasks,
      activeTasks: [...state.activeTasks, task.id],
      selectedTaskId: task.id,
    };
  }),

  updateTask: (taskId, updates) => set((state) => {
    const newTasks = new Map(state.tasks);
    const task = newTasks.get(taskId);
    if (task) {
      newTasks.set(taskId, { ...task, ...updates });
    }
    return { tasks: newTasks };
  }),

  removeTask: (taskId) => set((state) => {
    const newTasks = new Map(state.tasks);
    newTasks.delete(taskId);
    return {
      tasks: newTasks,
      activeTasks: state.activeTasks.filter(id => id !== taskId),
      selectedTaskId: state.selectedTaskId === taskId ? null : state.selectedTaskId,
    };
  }),

  setSelectedTask: (taskId) => set({ selectedTaskId: taskId }),

  addMessage: (taskId, message) => set((state) => {
    const newTasks = new Map(state.tasks);
    const task = newTasks.get(taskId);
    if (task) {
      newTasks.set(taskId, {
        ...task,
        messages: [...task.messages, message],
      });
    }
    return { tasks: newTasks };
  }),

  updateLastMessage: (taskId, content) => set((state) => {
    const newTasks = new Map(state.tasks);
    const task = newTasks.get(taskId);
    if (task && task.messages.length > 0) {
      const messages = [...task.messages];
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.role === 'agent') {
        messages[messages.length - 1] = {
          ...lastMessage,
          content: lastMessage.content + content,
        };
        newTasks.set(taskId, { ...task, messages });
      }
    }
    return { tasks: newTasks };
  }),

  addActivity: (activity) => set((state) => ({
    activities: [activity, ...state.activities].slice(0, 100), // Keep last 100
  })),

  clearActivities: () => set({ activities: [] }),

  handleSessionUpdate: (taskId, event) => {
    const { updateLastMessage, addActivity, updateTask } = get();
    const task = get().tasks.get(taskId);

    if (!task) return;

    switch (event.type) {
      case 'agentMessageChunk':
        if (event.content) {
          updateLastMessage(taskId, event.content);
        }
        break;

      case 'toolCall':
        if (event.toolCallId && event.title) {
          const lastMessage = task.messages[task.messages.length - 1];
          if (lastMessage && lastMessage.role === 'agent') {
            const toolCall = {
              id: event.toolCallId,
              title: event.title,
              status: 'running' as const,
              timestamp: new Date(),
            };
            const messages = [...task.messages];
            messages[messages.length - 1] = {
              ...lastMessage,
              toolCalls: [...(lastMessage.toolCalls || []), toolCall],
            };
            updateTask(taskId, { messages });
          }

          addActivity({
            id: crypto.randomUUID(),
            taskId,
            taskName: task.name,
            type: 'tool_call',
            message: `Tool: ${event.title}`,
            timestamp: new Date(),
          });
        }
        break;

      case 'toolCallUpdate':
        if (event.toolCallId && event.status) {
          const lastMessage = task.messages[task.messages.length - 1];
          if (lastMessage && lastMessage.role === 'agent' && lastMessage.toolCalls) {
            const toolCalls = lastMessage.toolCalls.map(tc =>
              tc.id === event.toolCallId ? { ...tc, status: event.status as any } : tc
            );
            const messages = [...task.messages];
            messages[messages.length - 1] = { ...lastMessage, toolCalls };
            updateTask(taskId, { messages });
          }
        }
        break;

      case 'agentThought':
        if (event.content) {
          const lastMessage = task.messages[task.messages.length - 1];
          if (lastMessage && lastMessage.role === 'agent') {
            const messages = [...task.messages];
            messages[messages.length - 1] = {
              ...lastMessage,
              agentThoughts: [...(lastMessage.agentThoughts || []), event.content],
            };
            updateTask(taskId, { messages });
          }
        }
        break;

      case 'kiroAgentSwitched':
        if (event.agentName) {
          addActivity({
            id: crypto.randomUUID(),
            taskId,
            taskName: task.name,
            type: 'status',
            message: `Agent switched to ${event.agentName}`,
            timestamp: new Date(),
          });
        }
        break;
    }
  },
}));
