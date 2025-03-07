import { ChatUI } from "@/components/chat/chat-ui"

interface ChatPageProps {
  params: {
    chatId?: string[]
  }
}

export default function ChatPage({ params }: ChatPageProps) {
  const chatId = params.chatId?.[0]
  
  return <ChatUI chatId={chatId} />
}