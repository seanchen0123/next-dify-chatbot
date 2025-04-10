'use client'

import { useSearchParams } from 'next/navigation'
import { ChatProvider } from '@/contexts/chat-context'
import { ErrorPage } from '@/components/error-page'

export function ChatProviderWrapper({ children }: { children: React.ReactNode }) {
  const searchParams = useSearchParams()
  const userId = searchParams.get('userId')

  // 加载完成后，如果没有 userId 则显示错误页面
  if (!userId) {
    return <ErrorPage title="Missing User ID" errorCode='400' />
  }
  
  return (
    <ChatProvider userId={userId}>
      {children}
    </ChatProvider>
  )
}