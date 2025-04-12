'use client'

import { ChatUI } from "@/components/chat/chat-ui"
import { EmptyScreen } from "@/components/chat/empty-screen"
import EmptySkeleton from "@/components/chat/empty-skeleton"
import { useChat } from "@/contexts/chat-context"

export default function ChatPage() {

  const {isLoadingConversations, chatStarted, messages, startNewChat} = useChat()

  if (isLoadingConversations &&!chatStarted) {
    return <EmptySkeleton />
  }

  return (
    <div className="flex h-full flex-col">
      {chatStarted ? <ChatUI /> : <EmptyScreen onStartChat={(prompt) => startNewChat(prompt)} />}
    </div>
  )
}
