'use client'

import { ChatUI } from '@/components/chat/chat-ui'
import { EmptyScreen } from '@/components/chat/empty-screen'
import EmptySkeleton from '@/components/chat/empty-skeleton'
import { useApp } from '@/contexts/app-context'
import { useChat } from '@/contexts/chat-context'

export default function ChatPage({ params: { appId }}: { params: { appId: string }}) {
  const examplePrompts = [
    '解释量子计算的基本原理',
    '帮我写一个简单的React组件',
    '如何提高英语口语水平？',
    '写一个关于未来科技的短篇故事'
  ]

  const { isLoadingConversations, chatStarted, startNewChat, sendMessage } = useChat()
  const { appInfo, appParameters } = useApp()
  const appName = appInfo?.name || 'AI聊天助手'
  const appDescription = appInfo?.description || '开始一个新的对话，探索AI的无限可能'
  const openingQuestions = appParameters?.suggested_questions.length ? appParameters?.suggested_questions : examplePrompts

  const handleStartNewChat = async (prompt?: string) => {
    await startNewChat()
    if (prompt) {
      await sendMessage(prompt)
    }
  }

  if (isLoadingConversations && !chatStarted) {
    return <EmptySkeleton />
  }

  return (
    <div className="flex h-full flex-col">
      {chatStarted ? (
        <ChatUI appId={appId} />
      ) : (
        <EmptyScreen
          appName={appName}
          appDescription={appDescription}
          openingQuestions={openingQuestions}
          onStartChat={prompt => handleStartNewChat(prompt)}
        />
      )}
    </div>
  )
}
