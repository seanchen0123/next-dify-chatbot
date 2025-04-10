import { ChatLayout } from '@/components/layout/chat-layout'
import { ChatProviderWrapper } from '@/contexts/chat-provider-wrapper'

export default function Layout({ children }: { children: React.ReactNode }) {


  return (
    <ChatProviderWrapper>
      <ChatLayout>{children}</ChatLayout>
    </ChatProviderWrapper>
  )
}
