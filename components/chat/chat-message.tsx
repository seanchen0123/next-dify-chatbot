import { formatDistanceToNow } from "date-fns"
import { zhCN } from "date-fns/locale"
import { User, Bot } from "lucide-react"
import { Message } from "@/types/chat"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

interface ChatMessageProps {
  message: Message
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user"
  const formattedTime = formatDistanceToNow(new Date(message.createdAt), {
    addSuffix: true,
    locale: zhCN,
  })

  return (
    <div className={cn("flex", isUser ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "flex max-w-[80%] items-start space-x-2 rounded-lg px-4 py-2",
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-muted-foreground"
        )}
      >
        <Avatar className="h-8 w-8 mt-1">
          <AvatarFallback className={cn(
            isUser ? "bg-blue-500" : "bg-green-500",
            "text-white"
          )}>
            {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
          </AvatarFallback>
        </Avatar>
        
        <div className="space-y-1">
          <div className="break-words">{message.content}</div>
          <div className={cn(
            "text-xs",
            isUser ? "text-primary-foreground/70" : "text-muted-foreground/70"
          )}>
            {formattedTime}
          </div>
        </div>
      </div>
    </div>
  )
}