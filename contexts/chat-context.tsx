'use client'

import { createContext, useContext } from 'react'
import { DisplayMessage } from '@/types/message'
import { ApiConversation } from '@/types/conversation'

interface ChatContextType {
  userId: string
  startNewChat: (initialPrompt?: string) => Promise<void>
  conversationId: string
  setConversationId: (id: string) => void
  chatStarted: boolean
  setChatStarted: (started: boolean) => void
  messages: DisplayMessage[]
  setMessages: React.Dispatch<React.SetStateAction<DisplayMessage[]>>
  addMessage: (message: DisplayMessage) => void
  updateLastMessage: (content: string) => void
  isLoadingMessages: boolean
  hasMoreMessages: boolean
  generateLoading: boolean
  setGenerateLoading: React.Dispatch<React.SetStateAction<boolean>>
  answerStarted: boolean
  setAnswerStarted: React.Dispatch<React.SetStateAction<boolean>>
  loadMoreMessages: (conversationId: string) => Promise<void>
  // 新增会话列表相关状态和方法
  conversations: ApiConversation[]
  currentConversation: ApiConversation | null
  isLoadingConversations: boolean
  loadConversations: () => Promise<void>
  deleteConversation: (id: string) => Promise<void>
  // 新增整体加载状态
  isLoading: boolean
  currentTaskId: string
  setCurrentTaskId: (id: string) => void
  sendMessage: (prompt: string) => Promise<void>
  stopGeneration: () => Promise<void>
  regenerateMessage: (messageId: string) => Promise<void>
}

export const ChatContext = createContext<ChatContextType | undefined>(undefined)

export function useChat() {
  const context = useContext(ChatContext)
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider')
  }
  return context
}
