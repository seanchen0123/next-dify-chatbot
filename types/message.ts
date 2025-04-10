export interface MessageFile {
  id: string;
  type: string; // 'image' 等
  url: string;
  belongs_to: 'user' | 'assistant';
}

export interface Feedback {
  rating?: 'like' | 'dislike';
}

export interface RetrieverResource {
  id: string;
  content: string;
  metadata: Record<string, any>;
  // 其他可能的字段
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

export interface DisplayMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  createdAt: Date;
}

export interface GetFormattedMessagesResult {
  messages: DisplayMessage[]
  hasMore: boolean
}
