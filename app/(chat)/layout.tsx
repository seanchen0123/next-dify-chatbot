import { ChatLayout } from '@/components/layout/chat-layout'
import { AppProvider } from '@/providers/app-provider'
import { ChatProviderWrapper } from '@/providers/chat-provider-wrapper'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <AppProvider>
      <ChatProviderWrapper>
        <ChatLayout>{children}</ChatLayout>
      </ChatProviderWrapper>
    </AppProvider>
  )
}
