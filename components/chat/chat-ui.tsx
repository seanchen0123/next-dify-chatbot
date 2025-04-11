'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ChatMessage } from './chat-message'
import { EmptyScreen } from './empty-screen'
import { useChat } from '@/contexts/chat-context'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { Send, Plus, Search, Sparkles, Globe, Globe2, GlobeIcon, Paperclip } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

interface ChatUIProps {
  chatId?: string
}

export function ChatUI({ chatId }: ChatUIProps) {
  const router = useRouter()
  const {
    chatStarted,
    setConversationId,
    startNewChat,
    messages,
    sendMessage,
    stopGeneration,
    generateLoading,
    answerStarted
  } = useChat()

  // 移除本地的 messages 状态，使用 context 中的
  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // 设置conversationId，这会触发获取历史消息请求
  useEffect(() => {
    if (chatId) {
      setConversationId(chatId)
    }
  }, [chatId, router])

  // 自动滚动到最新消息
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
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

  // 检查是否有初始提示
  useEffect(() => {
    const initialPrompt = window.sessionStorage.getItem('initialPrompt')
    if (initialPrompt) {
      setInput(initialPrompt)
      window.sessionStorage.removeItem('initialPrompt')
    }
  }, [])

  // 开始新对话 - 使用共享逻辑
  const handleStartChat = async (prompt: string) => {
    await startNewChat(prompt)
  }

  // 添加停止生成函数
  const handleStopGeneration = async () => {
    try {
      await stopGeneration()
    } catch (error) {
      console.error('停止生成失败:', error)
    }
  }

  // 发送消息
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!input.trim() || generateLoading) return

    try {
      const prompt = input.trim()
      setInput('')
      await sendMessage(prompt)
    } catch (error) {
      console.error('发送消息失败:', error)
    }
  }

  return (
    <div className="flex h-full flex-col">
      {/* 聊天消息区域 - 修改条件判断，使用 context 中的 messages */}
      {!chatStarted && !generateLoading && messages.length === 0 ? (
        <EmptyScreen onStartChat={handleStartChat}/>
      ) : (
        <>
          <ScrollArea className="flex-1 p-4">
            <div className="mx-auto max-w-3xl space-y-4">
              {messages.map(message => (
                <ChatMessage key={message.id} message={message} />
              ))}
              {generateLoading && !messages.length && (
                <div className="space-y-2">
                  <Skeleton className="h-12 w-3/4" />
                  <Skeleton className="h-12 w-1/2" />
                  <Skeleton className="h-12 w-2/3" />
                </div>
              )}
              {/* 修改加载动画的显示逻辑：只在生成中且没有开始回答时显示 */}
              {generateLoading && messages.length > 0 && !answerStarted && (
                <div className="px-3 flex items-center space-x-1 text-muted-foreground">
                  <div className="h-1 w-1 animate-bounce rounded-full bg-muted-foreground"></div>
                  <div
                    className="h-1 w-1 animate-bounce rounded-full bg-muted-foreground"
                    style={{ animationDelay: '0.2s' }}
                  ></div>
                  <div
                    className="h-1 w-1 animate-bounce rounded-full bg-muted-foreground"
                    style={{ animationDelay: '0.4s' }}
                  ></div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* 消息输入区域 - 修改禁用条件 */}
          <div className="p-4 pt-0">
            <form onSubmit={handleSendMessage} className="mx-auto max-w-3xl">
              <div className="relative flex flex-col rounded-xl border bg-background shadow-sm">
                {/* 输入框 */}
                <div className="relative flex items-end p-3">
                  <Textarea
                    ref={textareaRef}
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="输入消息..."
                    className="min-h-[40px] max-h-[140px] resize-none border-0 p-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                    disabled={generateLoading}
                  />
                </div>

                {/* 底部工具栏 */}
                <div className="flex items-center justify-between px-3 py-1.5">
                  <div className="flex items-center gap-3">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button type="button" size="icon" variant="ghost" className="h-8 w-8 rounded-full opacity-80">
                            <Paperclip className="scale-125" />
                            <span className="sr-only">上传附件</span>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="top">上传附件</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button type="button" size="icon" variant="ghost" className="h-8 w-8 rounded-full opacity-80">
                            <Globe className='scale-125'/>
                            <span className="sr-only">联网搜索</span>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="top">联网搜索</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button type="button" size="icon" variant="ghost" className="h-8 w-8 rounded-full  opacity-80">
                            <Sparkles className="scale-125" />
                            <span className="sr-only">深度思考</span>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="top">深度思考</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <Button
                    type={generateLoading ? 'button' : 'submit'}
                    size="sm"
                    className="rounded-full"
                    disabled={!generateLoading && !input.trim()}
                    onClick={generateLoading ? handleStopGeneration : undefined}
                  >
                    {generateLoading ? (
                      <>
                        <span className="h-4 w-4 mr-1 bg-background rounded-full animate-pulse"></span>
                        停止
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-1" />
                        发送
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </form>
            <p className='text-xs text-center mt-2 text-muted-foreground opacity-50'>内容由 AI 生成，请仔细甄别</p>
          </div>
        </>
      )}
    </div>
  )
}
