'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ChatMessage } from './chat-message'
import { useChat } from '@/contexts/chat-context'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Send, Globe, Paperclip, Atom, Mic } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { useApp } from '@/contexts/app-context'
import EmptySkeletonWithId from './empty-skeleton-with-id'
import SuggestedQuestions from './suggested-questions'
import { FileUpload } from './file-upload'
import { FilePreview } from './file-preview'
import { cn } from '@/lib/utils'
import { VoiceInputButton } from './voice-input-button'

interface ChatUIProps {
  appId?: string
  chatId?: string
}

export function ChatUI({ chatId }: ChatUIProps) {
  const { appParameters, appId } = useApp()
  const router = useRouter()
  const {
    setConversationId,
    messages,
    sendMessage,
    isLoadingMessages,
    stopGeneration,
    generateLoading,
    answerStarted,
    suggestionQuestions,
    uploadedFiles,
    uploadingFiles,
    removeFile,
    handlePasteEvent,
    speechToText,
    textToSpeech,
    regenerateMessage,
    userId
  } = useChat()

  // 移除本地的 messages 状态，使用 context 中的
  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  // 添加录音和语音转文字状态
  const [isRecording, setIsRecording] = useState(false)
  const [isTranscribing, setIsTranscribing] = useState(false)

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
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault()
      handleSendMessage(e)
    }
  }

  // 处理input粘贴事件
  useEffect(() => {
    const input = textareaRef.current
    if (!input) return

    const pasteEventHandler = (e: ClipboardEvent) => {
      if (document.activeElement === input) {
        handlePasteEvent(e)
      }
    }

    input.addEventListener('paste', pasteEventHandler)

    return () => {
      input.removeEventListener('paste', pasteEventHandler)
    }
  }, [handlePasteEvent])

  // 检查是否有初始提示
  useEffect(() => {
    const initialPrompt = window.sessionStorage.getItem('initialPrompt')
    if (initialPrompt) {
      setInput(initialPrompt)
      window.sessionStorage.removeItem('initialPrompt')
    }
  }, [])

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
      setInput('')
      await sendMessage(input)
    } catch (error) {
      console.error('发送消息失败:', error)
    }
  }

  const handleAudioCaptured = async (audioBlob: Blob) => {
    try {
      // 将 Blob 转换为 File 对象
      const audioFile = new File([audioBlob], `voice-message-${Date.now()}.wav`, {
        type: audioBlob.type || 'audio/wav'
      })

      // 设置转写状态为true
      setIsTranscribing(true)

      // 调用语音转文字服务
      const text = await speechToText(audioFile)

      // 如果有返回文本，设置到输入框
      if (text) {
        const cleanedText = text.replace(/<\|.*?\|>/g, '')
        setInput(cleanedText)
        // 聚焦输入框
        textareaRef.current?.focus()
      }
    } catch (error) {
      console.error('语音转文字失败:', error)
    } finally {
      // 无论成功失败，都重置转写状态
      setIsTranscribing(false)
    }
  }

  return (
    <div className="flex h-full flex-col">
      {/* 聊天消息区域 - 修改条件判断，使用 context 中的 messages */}
      {chatId && !generateLoading && isLoadingMessages ? (
        <EmptySkeletonWithId />
      ) : (
        <>
          <ScrollArea className="flex-1 p-4">
            <div className="mx-auto max-w-3xl space-y-4">
              {messages.map(message => (
                <ChatMessage
                  key={message.id}
                  message={message}
                  showRetrieverResources={appParameters?.retriever_resource.enabled}
                  tts={appParameters?.text_to_speech.enabled}
                  userId={userId}
                  appId={appId}
                  regenerateMessage={regenerateMessage}
                  textToSpeech={textToSpeech}
                  generateLoading={generateLoading}
                />
              ))}
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
            {/* 下一轮会话建议问题 */}
            {appParameters?.suggested_questions_after_answer.enabled &&
              suggestionQuestions &&
              suggestionQuestions.length > 0 && (
                <SuggestedQuestions
                  suggestedQuestions={suggestionQuestions}
                  onSendMessage={prompt => sendMessage(prompt)}
                />
              )}
            {/* 消息输入表单 */}
            <form onSubmit={handleSendMessage} className="mx-auto max-w-3xl">
              <div className="relative flex flex-col rounded-xl border bg-background shadow-sm">
                {/* 输入框 */}
                <div className="relative p-3">
                  {/* 已上传文件预览 */}
                  {uploadedFiles.length > 0 && (
                    <FilePreview
                      files={uploadedFiles}
                      disabled={generateLoading || uploadingFiles}
                      onRemove={removeFile}
                    />
                  )}
                  <Textarea
                    ref={textareaRef}
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={isTranscribing ? '语音转文字中...' : '输入消息...'}
                    className={cn(
                      'min-h-[40px] max-h-[140px] resize-none border-0 p-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-sm',
                      uploadedFiles.length > 0 ? 'mt-1' : 'mt-0'
                    )}
                    disabled={generateLoading || isRecording || isTranscribing}
                  />
                </div>

                {/* 底部工具栏 */}
                <div className="flex items-center justify-between px-3 py-1.5">
                  <div className="flex items-center gap-3">
                    <FileUpload />

                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button type="button" size="icon" variant="ghost" className="h-8 w-8 rounded-full opacity-80">
                            <Globe className="scale-125" />
                            <span className="sr-only">联网搜索</span>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="top">联网搜索</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 rounded-full  opacity-80"
                          >
                            <Atom className="scale-125" />
                            <span className="sr-only">深度思考</span>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="top">深度思考</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <div className="flex items-center gap-3">
                    {appParameters?.speech_to_text.enabled && (
                      <VoiceInputButton
                        onAudioCaptured={handleAudioCaptured}
                        disabled={generateLoading || isTranscribing}
                        onRecordingStateChange={setIsRecording}
                        isTranscribing={isTranscribing}
                      />
                    )}
                    <Button
                      type={generateLoading ? 'button' : 'submit'}
                      size="sm"
                      className="rounded-full"
                      disabled={!generateLoading && !input.trim()}
                      onClick={generateLoading ? handleStopGeneration : undefined}
                    >
                      {generateLoading ? (
                        <>
                          <span className="h-4 w-4 mr-1 bg-gray-100 rounded-full animate-pulse"></span>
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
              </div>
            </form>
            <p className="text-xs text-center mt-2 text-muted-foreground opacity-50">内容由 AI 生成，请仔细甄别</p>
          </div>
        </>
      )}
    </div>
  )
}
