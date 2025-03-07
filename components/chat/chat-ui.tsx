"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Send } from "lucide-react"
import { ChatMessage } from "./chat-message"
import { EmptyScreen } from "./empty-screen"
import { Message } from "@/types/chat"
import { getConversation, sendMessage, createConversation } from "@/services/api"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"

interface ChatUIProps {
  chatId?: string
}

export function ChatUI({ chatId }: ChatUIProps) {
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // 加载聊天历史或创建新对话
  useEffect(() => {
    async function loadOrCreateChat() {
      setIsLoading(true)
      try {
        if (chatId) {
          // 加载现有对话
          const conversation = await getConversation(chatId)
          if (conversation) {
            setMessages(conversation.messages)
          } else {
            // 如果对话不存在，重定向到新对话
            router.push("/chat")
          }
        }
      } catch (error) {
        console.error("加载对话失败:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadOrCreateChat()
  }, [chatId, router])

  // 自动滚动到最新消息
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // 自动调整文本框高度
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`
    }
  }, [input])

  // 处理按键事件
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage(e)
    }
  }

  // 开始新对话
  const handleStartChat = async (prompt: string) => {
    try {
      const newConversation = await createConversation()
      router.push(`/chat/${newConversation.id}`)
      
      // 设置输入内容，等待路由变化后自动发送
      setInput(prompt)
      
      // 延迟发送消息，确保路由已经变化
      setTimeout(() => {
        const textarea = textareaRef.current
        if (textarea) {
          const event = new Event('submit', { bubbles: true })
          textarea.form?.dispatchEvent(event)
        }
      }, 100)
    } catch (error) {
      console.error("创建新对话失败:", error)
    }
  }

  // 发送消息
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!input.trim() || isLoading) return
    
    // 如果没有chatId，创建新对话
    if (!chatId) {
      handleStartChat(input)
      return
    }
    
    const userMessage: Message = {
      id: `temp-${Date.now()}`,
      role: "user",
      content: input,
      createdAt: new Date(),
    }
    
    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)
    
    try {
      // 调用API发送消息
      const assistantMessage = await sendMessage(chatId, input)
      
      // 更新消息列表，替换临时用户消息ID
      setMessages((prev) => [
        ...prev.filter(m => m.id !== userMessage.id),
        {
          id: `user-${Date.now()}`,
          role: "user",
          content: input,
          createdAt: new Date(),
        },
        assistantMessage
      ])
      
      // 刷新路由以更新侧边栏
      router.refresh()
    } catch (error) {
      console.error("发送消息失败:", error)
      // 可以在这里添加错误处理，例如显示错误提示
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex h-full flex-col">
      {/* 聊天消息区域 */}
      {!chatId && !isLoading && messages.length === 0 ? (
        <EmptyScreen onStartChat={handleStartChat} />
      ) : (
        <>
          <ScrollArea className="flex-1 p-4">
            <div className="mx-auto max-w-3xl space-y-4">
              {messages.map((message) => (
                <ChatMessage key={message.id} message={message} />
              ))}
              {isLoading && !messages.length && (
                <div className="space-y-2">
                  <Skeleton className="h-12 w-3/4" />
                  <Skeleton className="h-12 w-1/2" />
                  <Skeleton className="h-12 w-2/3" />
                </div>
              )}
              {isLoading && messages.length > 0 && (
                <div className="flex items-center space-x-2 text-muted-foreground">
                  <div className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground"></div>
                  <div className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground" style={{ animationDelay: "0.2s" }}></div>
                  <div className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground" style={{ animationDelay: "0.4s" }}></div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
          
          {/* 消息输入区域 */}
          <div className="border-t p-4">
            <form onSubmit={handleSendMessage} className="mx-auto max-w-3xl">
              <div className="relative flex items-end">
                <Textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="输入消息..."
                  className="min-h-[60px] max-h-[200px] pr-12 resize-none"
                  disabled={isLoading || !chatId}
                />
                <Button
                  type="submit"
                  size="icon"
                  className="absolute right-2 bottom-2"
                  disabled={isLoading || !input.trim() || !chatId}
                >
                  <Send className="h-5 w-5" />
                  <span className="sr-only">发送</span>
                </Button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  )
}