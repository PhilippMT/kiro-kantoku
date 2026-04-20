import { useState, useRef, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import ReactMarkdown from 'react-markdown';
import { useTaskStore } from '../stores/taskStore';
import { ChatMessage, ToolCall } from '../types';

interface ChatInterfaceProps {
  taskId: string;
}

export function ChatInterface({ taskId }: ChatInterfaceProps) {
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const task = useTaskStore(state => state.tasks.get(taskId));
  const addMessage = useTaskStore(state => state.addMessage);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [task?.messages]);

  const handleSend = async () => {
    if (!input.trim() || !task || isSending) return;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    addMessage(taskId, userMessage);
    setInput('');
    setIsSending(true);

    try {
      // Create agent message placeholder
      const agentMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'agent',
        content: '',
        timestamp: new Date(),
        toolCalls: [],
        agentThoughts: [],
      };
      addMessage(taskId, agentMessage);

      // Send prompt through ACP
      if (task.connectionId && task.sessionId) {
        await invoke('acp_send_prompt', {
          connectionId: task.connectionId,
          sessionId: task.sessionId,
          prompt: input,
        });
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsSending(false);
    }
  };

  if (!task) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        Task not found
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 p-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-green-600 rounded flex items-center justify-center">
            ⚙️
          </div>
          <div className="flex-1">
            <h2 className="font-semibold">{task.name}</h2>
            <p className="text-sm text-gray-400">{task.directory}</p>
          </div>
          {task.branch && (
            <span className="text-sm text-purple-400">🌿 {task.branch}</span>
          )}
        </div>
      </header>

      {/* Status Message */}
      {task.status === 'working' && (
        <div className="bg-gray-800 border-b border-gray-700 p-3 text-center">
          <p className="text-sm text-gray-400">Agent connected and ready.</p>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {task.messages.length === 0 ? (
          <div className="text-center text-gray-500 mt-20">
            <p>Start a conversation with the agent</p>
          </div>
        ) : (
          task.messages.map((message) => (
            <Message key={message.id} message={message} />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="bg-gray-800 border-t border-gray-700 p-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder="Type a message..."
            disabled={isSending || task.status !== 'working'}
            className="flex-1 bg-gray-700 rounded px-4 py-3 border border-gray-600 focus:border-blue-500 focus:outline-none disabled:opacity-50"
          />
          <button
            onClick={handleSend}
            disabled={isSending || !input.trim() || task.status !== 'working'}
            className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

interface MessageProps {
  message: ChatMessage;
}

function Message({ message }: MessageProps) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[80%] ${isUser ? 'order-2' : 'order-1'}`}>
        <div
          className={`rounded-lg p-4 ${
            isUser
              ? 'bg-blue-600 text-white'
              : 'bg-gray-800 text-gray-100 border border-gray-700'
          }`}
        >
          {message.content && (
            <div className="prose prose-invert max-w-none">
              <ReactMarkdown>{message.content}</ReactMarkdown>
            </div>
          )}

          {/* Tool Calls */}
          {message.toolCalls && message.toolCalls.length > 0 && (
            <div className="mt-3 space-y-2">
              {message.toolCalls.map((toolCall) => (
                <ToolCallItem key={toolCall.id} toolCall={toolCall} />
              ))}
            </div>
          )}

          {/* Agent Thoughts */}
          {message.agentThoughts && message.agentThoughts.length > 0 && (
            <details className="mt-3 text-sm text-gray-400">
              <summary className="cursor-pointer">Agent thoughts</summary>
              <div className="mt-2 space-y-1">
                {message.agentThoughts.map((thought, idx) => (
                  <p key={idx} className="text-xs">
                    {thought}
                  </p>
                ))}
              </div>
            </details>
          )}
        </div>
        <div className="text-xs text-gray-500 mt-1 px-2">
          {message.timestamp.toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
}

interface ToolCallItemProps {
  toolCall: ToolCall;
}

function ToolCallItem({ toolCall }: ToolCallItemProps) {
  const statusIcons = {
    running: '▶️',
    completed: '✅',
    failed: '❌',
  };

  const statusColors = {
    running: 'text-yellow-400',
    completed: 'text-green-400',
    failed: 'text-red-400',
  };

  return (
    <div className="flex items-center gap-2 text-sm bg-gray-700 p-2 rounded">
      <span>{statusIcons[toolCall.status]}</span>
      <span className="flex-1">{toolCall.title}</span>
      <span className={statusColors[toolCall.status]}>
        {toolCall.status}
      </span>
    </div>
  );
}
