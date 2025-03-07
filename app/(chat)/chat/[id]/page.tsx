import { ChatUI } from "@/components/chat/chat-ui"

interface ChatPageProps {
  params: {
    id: string
  }
}

export default function ChatPage({ params }: ChatPageProps) {
  return (
    <div className="flex h-full flex-col">
      <ChatUI chatId={params.id} />
    </div>
  )
}