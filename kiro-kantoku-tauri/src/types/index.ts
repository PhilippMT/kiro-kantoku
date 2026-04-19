// Task types
export type TaskStatus = 'pending' | 'starting' | 'working' | 'paused' | 'completed' | 'failed' | 'cancelled';

export interface Task {
  id: string;
  name: string;
  directory: string;
  branch?: string;
  status: TaskStatus;
  connectionId?: string;
  sessionId?: string;
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  gitWorktree?: string;
  messages: ChatMessage[];
}

// Chat message types
export type MessageRole = 'user' | 'agent';

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
  toolCalls?: ToolCall[];
  agentThoughts?: string[];
}

export interface ToolCall {
  id: string;
  title: string;
  status: 'running' | 'completed' | 'failed';
  timestamp: Date;
}

// Activity feed types
export type ActivityType = 'tool_call' | 'error' | 'status' | 'user_message';

export interface Activity {
  id: string;
  taskId: string;
  taskName: string;
  type: ActivityType;
  message: string;
  timestamp: Date;
}

// ACP session update events
export interface SessionUpdateEvent {
  type: 'agentMessageChunk' | 'toolCall' | 'toolCallUpdate' | 'agentThought' | 'planUpdate' |
        'commandsAvailable' | 'kiroCommandsAvailable' | 'kiroMetadata' | 'kiroAgentSwitched' |
        'kiroCompactionStatus' | 'kiroClearStatus' | 'kiroMcpOAuthRequest' | 'other';
  content?: string;
  toolCallId?: string;
  title?: string;
  status?: string;
  plan?: string;
  commands?: string[];
  kiroCommands?: KiroCommand[];
  contextUsage?: number;
  agentName?: string;
  previousAgent?: string;
  welcomeMessage?: string;
  url?: string;
  data?: any;
}

export interface KiroCommand {
  name: string;
  description: string;
  meta?: {
    inputType?: string;
    optionsMethod?: string;
    local?: boolean;
  };
}

// Permission request types
export interface PermissionRequest {
  requestId: string;
  options: PermissionOption[];
}

export interface PermissionOption {
  optionId: string;
}

// File change types
export interface FileChange {
  path: string;
  additions: number;
  deletions: number;
  status: 'added' | 'modified' | 'deleted';
}
