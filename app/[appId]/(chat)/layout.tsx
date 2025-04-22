import { ChatLayout } from '@/components/layout/chat-layout'
import { AppProvider } from '@/providers/app-provider'
import { ChatProviderWrapper } from '@/providers/chat-provider-wrapper'

export default function Layout({ children, params: { appId } }: { children: React.ReactNode, params: { appId: string} }) {
  return (
    <AppProvider appId={appId}>
      <ChatProviderWrapper appId={appId}>
        <ChatLayout>{children}</ChatLayout>
      </ChatProviderWrapper>
    </AppProvider>
  )
}
