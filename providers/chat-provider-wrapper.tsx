'use client'

import { useSearchParams } from 'next/navigation'
import { ErrorPage } from '@/components/error-page'
import { ChatProvider } from './chat-provider'
import { Suspense } from 'react'

// 创建一个内部组件来使用 useSearchParams
function ChatProviderWithParams({ children, appId }: { children: React.ReactNode, appId: string }) {
  const searchParams = useSearchParams()
  const userId = searchParams.get('userId')

  // 加载完成后，如果没有 userId 则显示错误页面
  if (!userId) {
    return <ErrorPage title="Missing User ID" errorCode="400" />
  }

  return <ChatProvider userId={userId} appId={appId}>{children}</ChatProvider>
}

export function ChatProviderWrapper({ children, appId }: { children: React.ReactNode, appId: string }) {
  return (
    <Suspense fallback={null}>
      <ChatProviderWithParams appId={appId}>{children}</ChatProviderWithParams>
    </Suspense>
  )
}
