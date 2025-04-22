import { ChatUI } from "@/components/chat/chat-ui"

interface ChatPageProps {
  params: {
    id: string,
    appId: string
  }
}

export default function ChatPage({ params: { id, appId } }: ChatPageProps) {
  return (
    <div className="flex h-full flex-col">
      <ChatUI chatId={id} appId={appId} />
    </div>
  )
}