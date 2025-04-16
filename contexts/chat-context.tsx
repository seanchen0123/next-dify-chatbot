'use client'

import { createContext, useContext } from 'react'
import { DisplayMessage } from '@/types/message'
import { ApiConversation } from '@/types/conversation'
import { UploadedFileResponse } from '@/services/types/common'
import { UploadFileItem } from '@/types/chat'

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
  sendMessage: (prompt: string, promptFiles?: UploadFileItem[]) => Promise<void>
  stopGeneration: () => Promise<void>
  regenerateMessage: (messageId: string) => Promise<void>
  // 下轮对话建议问题
  suggestionQuestions: string[]
  // 文件上传
  uploadedFiles: UploadedFileResponse[]
  uploadingFiles: boolean
  uploadFile: (file: File) => Promise<UploadedFileResponse>
  removeFile: (fileId: string) => void
  clearUploadedFiles: () => void
  textToSpeech: (messageId?: string, text?: string) => Promise<string | null>
  handlePasteEvent: (event: ClipboardEvent) => void
}

export const ChatContext = createContext<ChatContextType | undefined>(undefined)

export function useChat() {
  const context = useContext(ChatContext)
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider')
  }
  return context
}
