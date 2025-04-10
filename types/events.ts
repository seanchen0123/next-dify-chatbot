// 定义事件类型
export interface BaseEvent {
  task_id: string
  message_id?: string
  conversation_id?: string
  event: string
  created_at?: number
}

// 消息事件
export interface MessageEvent extends BaseEvent {
  event: 'message'
  answer: string
  from_variable_selector?: [string, string] // 用于标识消息来源
}

// 文件事件
export interface MessageFileEvent extends BaseEvent {
  event: 'message_file'
  id: string
  type: string
  belongs_to: 'user' | 'assistant'
  url: string
}

// 消息结束事件
export interface MessageEndEvent extends BaseEvent {
  event: 'message_end'
  metadata: Record<string, any>
  usage: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
  retriever_resources?: Array<any>
}

// TTS 音频流事件
export interface TTSMessageEvent extends BaseEvent {
  event: 'tts_message'
  audio: string
}

// TTS 音频流结束事件
export interface TTSMessageEndEvent extends BaseEvent {
  event: 'tts_message_end'
  audio: string
}

// 消息内容替换事件
export interface MessageReplaceEvent extends BaseEvent {
  event: 'message_replace'
  answer: string
}

// Workflow 开始执行事件
export interface WorkflowStartedEvent extends BaseEvent {
  event: 'workflow_started'
  workflow_run_id: string
  data: {
    id: string
    workflow_id: string
    sequence_number: number
    created_at: number
  }
}

// Node 开始执行事件
export interface NodeStartedEvent extends BaseEvent {
  event: 'node_started'
  workflow_run_id: string
  data: {
    id: string
    node_id: string
    node_type: string
    title: string
    index: number
    predecessor_node_id?: string
    inputs: Record<string, any>
    created_at: number
  }
}

// Node 执行结束事件
export interface NodeFinishedEvent extends BaseEvent {
  event: 'node_finished'
  workflow_run_id: string
  data: {
    id: string
    node_id: string
    index: number
    predecessor_node_id?: string
    inputs: Record<string, any>
    process_data?: any
    outputs?: any
    status: 'running' | 'succeeded' | 'failed' | 'stopped'
    error?: string
    elapsed_time?: number
    execution_metadata?: any
    total_tokens?: number
    total_price?: number
    currency?: string
    created_at: number
  }
}

// Workflow 执行结束事件
export interface WorkflowFinishedEvent extends BaseEvent {
  event: 'workflow_finished'
  workflow_run_id: string
  data: {
    id: string
    workflow_id: string
    status: 'running' | 'succeeded' | 'failed' | 'stopped'
    outputs?: any
    error?: string
    elapsed_time?: number
    total_tokens?: number
    total_steps?: number
    created_at: number
    finished_at: number
  }
}

// 错误事件
export interface ErrorEvent extends BaseEvent {
  event: 'error'
  status: number
  code: string
  message: string
}

// Ping 事件
export interface PingEvent extends BaseEvent {
  event: 'ping'
}

// 所有事件类型的联合类型
export type EventData =
  | MessageEvent
  | MessageFileEvent
  | MessageEndEvent
  | TTSMessageEvent
  | TTSMessageEndEvent
  | MessageReplaceEvent
  | WorkflowStartedEvent
  | NodeStartedEvent
  | NodeFinishedEvent
  | WorkflowFinishedEvent
  | ErrorEvent
  | PingEvent