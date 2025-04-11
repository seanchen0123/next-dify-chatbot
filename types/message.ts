export interface MessageFile {
  id: string;
  type: string; // 'image' 等
  url: string;
  belongs_to: 'user' | 'assistant';
}

export interface Feedback {
  rating?: 'like' | 'dislike';
}

// 定义引用资源类型
export interface RetrieverResource {
  position: number
  dataset_id: string
  dataset_name: string
  document_id: string
  document_name: string
  data_source_type: string
  segment_id: string
  retriever_from: string
  score: number
  hit_count: number
  word_count: number
  segment_position: number
  index_node_hash: string
  content: string
  page: number | null
}

// 修改 DisplayMessage 类型，增加 retrieverResources 属性
export interface DisplayMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  createdAt: Date
  updatedAt?: Date
  files?: MessageFile[]
  retrieverResources?: RetrieverResource[] // 新增属性
}

export interface Message {
  id: string;
  conversation_id: string;
  inputs: {
    [key: string]: any;
  };
  message_files?: MessageFile[];
  query: string;
  answer: string;
  created_at: string; // 时间戳
  feedback?: Feedback;
  retriever_resources?: RetrieverResource[];
}

export interface MessagesResponse {
  data: Message[];
  has_more: boolean;
  limit: number;
}

export interface GetFormattedMessagesResult {
  messages: DisplayMessage[]
  hasMore: boolean
}
