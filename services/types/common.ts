import { DisplayMessage } from "@/types/message"

export interface GetConversationsParams {
  userId: string
  lastId?: string
  limit?: number
  sortBy?: string
}

export interface DeleteConversationParams {
  conversationId: string
  userId: string
}

export interface GetMessagesParams {
  conversationId: string
  userId: string
  firstId?: string
  limit?: number
}

export interface GetFormattedMessagesResult {
  messages: DisplayMessage[]
  hasMore: boolean
}

export interface RenameConversationParams {
  userId: string
  conversationId: string
  name: string
  autoGenerate?: boolean
}

export interface StopMessageParams {
  userId: string
  taskId: string
}

export interface SubmitMessageFeedbackParams {
  messageId: string
  userId: string
  rating: 'like' | 'dislike' | null
  content?: string
}