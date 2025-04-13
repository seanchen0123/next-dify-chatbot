'use client'

import { useState, ReactNode, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { deleteConversation, getConversations } from '@/services/client/conversations'
import { getFormattedMessages, getNextRoundSuggestions, stopMessageGeneration } from '@/services/client/messages'
import { ChatRequest } from '@/types/chat'
import { EventData, MessageEndEvent, MessageEvent, WorkflowFinishedEvent } from '@/types/events'
import { DisplayMessage } from '@/types/message'
import { ApiConversation } from '@/types/conversation'
import { ChatContext } from '@/contexts/chat-context'

export function ChatProvider({ userId, children }: { userId: string, children: ReactNode }) {
  const router = useRouter()
  const [conversationId, setConversationId] = useState('')
  const [chatStarted, setChatStarted] = useState(false)
  const [messages, setMessages] = useState<DisplayMessage[]>([])
  const [isLoadingMessages, setIsLoadingMessages] = useState(false)
  const [hasMoreMessages, setHasMoreMessages] = useState(false)
  // 内容生成时的loading状态
  const [generateLoading, setGenerateLoading] = useState(false)
  // 仅针对回答内容是否生成完毕的标志位
  const [answerStarted, setAnswerStarted] = useState(false)

  // 新增会话列表相关状态
  const [conversations, setConversations] = useState<ApiConversation[]>([])
  const [isLoadingConversations, setIsLoadingConversations] = useState(true)
  // 当前的会话信息
  const [currentConversation, setCurrentConversation] = useState<ApiConversation | null>(null)

  // 计算整体加载状态
  const isLoading = isLoadingMessages || isLoadingConversations

  // taskId用于停止当前正在输出的消息
  const [currentTaskId, setCurrentTaskId] = useState<string>('')

  // 下轮问题建议问题列表
  const [suggestions, setSuggestions] = useState<string[]>([])

  // 加载会话列表
  const loadConversations = async () => {
    setIsLoadingConversations(true)
    try {
      const res = await getConversations({ userId })
      setConversations(res.conversations)
      setHasMoreMessages(res.hasMore)
    } catch (error) {
      console.error('加载对话列表失败:', error)
    } finally {
      setIsLoadingConversations(false)
    }
  }

  // 删除会话
  const handleDeleteConversation = async (id: string) => {
    try {
      await deleteConversation({ conversationId: id, userId })
      setConversations(prev => prev.filter(conv => conv.id !== id))

      // 如果删除的是当前正在查看的对话，则重定向到新对话
      if (conversationId === id) {
        router.replace(`/chat?userId=${userId}`)
        setMessages([])
        setConversationId('')
      }
    } catch (error) {
      console.error('删除对话失败:', error)
    }
  }

  // 初始加载会话列表
  useEffect(() => {
    if (userId) {
      loadConversations()
    }
  }, [])

  // 监听 conversationId 变化，加载历史消息
  useEffect(() => {
    const init = async () =>{
      if (conversationId && userId) {
        await loadMessages(conversationId, userId)
        setChatStarted(true)
      } else {
        setMessages([])
      }
    }
    init()
  }, [conversationId, userId])

  // 获取当前的会话
  useEffect(() => {
    const conversation = conversations.find(c => c.id === conversationId)
    setCurrentConversation(conversation || null)
  }, [conversationId, setConversationId, conversations, setConversations])

  // 统一的开始新对话逻辑
  const startNewChat = async (initialPrompt?: string) => {
    // 重置状态
    setConversationId('')
    setChatStarted(true)
    setMessages([]) // 清空消息列表

    // 如果是从布局中调用，需要导航到/chat
    if (window.location.pathname !== '/chat') {
      router.replace(`/chat?userId=${userId}`)
    }

    // 通过URL参数传递初始提示(如果有)
    if (initialPrompt) {
      await sendMessage(initialPrompt)
    }
  }

  // 添加新消息
  const addMessage = (message: DisplayMessage) => {
    setMessages(prev => [...prev, message])
  }

  // 更新最后一条消息（用于流式响应）
  const updateLastMessage = (content: string) => {
    setMessages(prev => {
      const lastMessage = prev[prev.length - 1]

      // 检查最后一条消息是否是助手消息
      if (lastMessage && lastMessage.role === 'assistant') {
        // 更新现有的助手消息，累加内容
        const updatedMessages = [...prev]
        updatedMessages[updatedMessages.length - 1] = {
          ...lastMessage,
          content: lastMessage.content + content
        }
        return updatedMessages
      } else {
        // 创建新的助手消息
        return [
          ...prev,
          {
            id: `assistant-${Date.now()}`,
            role: 'assistant',
            content: content,
            createdAt: new Date()
          }
        ]
      }
    })
  }

  // 加载历史消息
  const loadMessages = async (conversationId: string, userId: string, firstId?: string, limit?: number) => {
    if (!conversationId || !userId) return

    setIsLoadingMessages(true)
    try {
      const res = await getFormattedMessages({
        conversationId,
        userId
      })

      if (firstId) {
        // 加载更多消息（向上滚动加载）
        setMessages(prev => [...res.messages, ...prev])
      } else {
        // 初始加载
        setMessages(res.messages)
      }

      // 更新是否有更多消息
      setHasMoreMessages(res.hasMore)
    } catch (error) {
      console.error('加载历史消息失败:', error)
    } finally {
      setIsLoadingMessages(false)
    }
  }

  // 加载更多历史消息（向上滚动加载）
  const loadMoreMessages = async (conversationId: string) => {
    if (!messages.length || !hasMoreMessages || isLoadingMessages) return

    // 获取当前消息列表中最早的消息ID
    // 注意：我们需要找到原始消息ID，而不是DisplayMessage的ID
    const firstMessageId = messages[0]?.id.split('-')[0] // 提取原始消息ID
    await loadMessages(conversationId, firstMessageId)
  }

  // 专门处理message事件 - 增量累加模式
  function handleMessageEvent(eventData: MessageEvent) {
    setAnswerStarted(true)
    const { answer, from_variable_selector, conversation_id } = eventData
    if (from_variable_selector && from_variable_selector[1] === 'text') {
      console.log('收到消息:', answer)
      // 保存会话ID
      if (conversation_id && !conversationId) {
        setConversationId(conversation_id)
      }

      // 使用 context 中的 updateLastMessage 函数
      updateLastMessage(answer)
    }
  }

  // 处理message_end事件
  function handleMessageEndEvent(eventData: MessageEndEvent) {
    // console.log('消息结束:', eventData)
    setAnswerStarted(false)
    setMessages((prev) => {
      const updatedMessages = [...prev]
      const lastMessage = updatedMessages[updatedMessages.length - 1]
      
      if (lastMessage && lastMessage.role === 'assistant') {
        // 添加引用资源
        if (eventData.metadata.retriever_resources && eventData.metadata.retriever_resources.length > 0) {
          lastMessage.retrieverResources = eventData.metadata.retriever_resources
        }
      }
      
      return updatedMessages
    })
    
  }

  async function fetchStreamData(data: ChatRequest) {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })

    if (!response.ok || !response.body) {
      throw new Error(`HTTP error! Status: ${response.status}`)
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''
    let receivedConversationId = ''
    let messageId = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })

      // 处理可能的多条消息
      const parts = buffer.split('\n\n')
      buffer = parts.pop() || '' // 保留未完成的部分

      for (const part of parts) {
        if (!part.startsWith('data: ')) continue

        try {
          const jsonStr = part.slice(6) // 去掉 'data: ' 前缀
          if (!jsonStr.trim()) continue

          const eventData = JSON.parse(jsonStr) as EventData

          // 保存任务ID
          if (eventData.task_id) {
            setCurrentTaskId(eventData.task_id)
          }

          // 保存会话ID和消息ID，以便后续使用
          if (eventData.conversation_id) {
            receivedConversationId = eventData.conversation_id
            // 更新状态中的conversationId
            if (!conversationId) {
              setConversationId(receivedConversationId)
            }
          }
          if (eventData.message_id) messageId = eventData.message_id

          // 处理不同类型的event
          switch (eventData.event) {
            case 'message':
              // 处理消息事件
              handleMessageEvent(eventData as MessageEvent)
              break

            case 'workflow_started':
              // console.log('工作流开始:', eventData)
              // 可以在这里添加一个初始的助手消息
              if (!messages.some(m => m.role === 'assistant')) {
              }
              break

            case 'node_started':
              // console.log('节点开始:', (eventData as NodeStartedEvent).data?.node_id)
              break

            case 'node_finished':
              // console.log('节点完成:', (eventData as NodeFinishedEvent).data?.node_id)
              break

            case 'workflow_finished':
              console.log('工作流完成:', (eventData as WorkflowFinishedEvent).data?.status)
              setGenerateLoading(false)
              break

            case 'message_end':
              handleMessageEndEvent(eventData)
              break

            default:
              console.log('未知事件类型:', eventData.event)
          }
        } catch (error) {
          console.error('解析JSON出错:', error, '原始数据:', part)
        }
      }
    }

    // 清除当前任务ID
    setCurrentTaskId('')
    return { conversationId: receivedConversationId, messageId }
  }

  const sendMessage = async (prompt: string) => {
    if (!prompt.trim() || isLoading) return
    setGenerateLoading(true)
    const processedPrompt = prompt.replace(/\n\t/g, ' ').trim()
    const userMessage: DisplayMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: processedPrompt,
      createdAt: new Date()
    }

    // 使用 context 中的 addMessage 函数
    addMessage(userMessage)

    const chatRequest: ChatRequest = {
      query: processedPrompt,
      conversation_id: conversationId || undefined,
      user: userId,
      files: [],
      inputs: {}
    }

    try {
      const { conversationId: newConversationId } = await fetchStreamData(chatRequest)

      // 如果是新对话，更新URL（可选）
      if (!conversationId && newConversationId) {
        // 更新状态
        setConversationId(newConversationId)
        // 使用 router.replace 更新 URL，不会刷新当前页面
        router.replace(`/chat/${newConversationId}?userId=${userId}`)
        // 刷新一下会话列表
        await loadConversations()
      }
    } catch (error) {
      console.error('Error fetching chat response:', error)
      // 在消息中显示错误
      addMessage({
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: '抱歉，处理您的请求时发生错误。',
        createdAt: new Date()
      })
    } finally {
      setGenerateLoading(false)
    }
  }

  // 添加停止生成函数
  const stopGeneration = async () => {
    if (!currentTaskId || !userId) return
    try {
      await stopMessageGeneration({ taskId: currentTaskId, userId })
      // 停止成功后清除任务ID
      setCurrentTaskId('')
    } catch (error) {
      console.error('停止生成失败:', error)
    }
  }

  // 添加重新生成消息的函数
  const regenerateMessage = async (messageId: string) => {
    if (!conversationId || isLoading) return
    
    // 设置加载状态
    setGenerateLoading(true)
    
    try {
      // 找到要重新生成的消息的索引
      const messageIndex = messages.findIndex(msg => msg.id.includes(messageId))
      if (messageIndex === -1) {
        throw new Error('找不到要重新生成的消息')
      }
      
      // 获取上一条用户消息
      let userMessageIndex = messageIndex - 1
      while (userMessageIndex >= 0) {
        if (messages[userMessageIndex].role === 'user') {
          break
        }
        userMessageIndex--
      }
      
      if (userMessageIndex < 0) {
        throw new Error('找不到对应的用户消息')
      }
      
      const userMessage = messages[userMessageIndex]
      
      // 不删除原始消息，而是直接重新发送用户消息
      // 这样会在消息列表末尾添加新的用户消息和助手回复
      await sendMessage(userMessage.content)
      
    } catch (error) {
      console.error('重新生成消息失败:', error)
    } finally {
      setGenerateLoading(false)
    }
  }

  return (
    <ChatContext.Provider
      value={{
        userId,
        startNewChat,
        conversationId,
        setConversationId,
        chatStarted,
        setChatStarted,
        messages,
        setMessages,
        addMessage,
        updateLastMessage,
        isLoadingMessages,
        hasMoreMessages,
        loadMoreMessages,
        // 新增会话列表相关状态和方法
        conversations,
        currentConversation,
        isLoadingConversations,
        loadConversations,
        deleteConversation: handleDeleteConversation,
        // 新增整体加载状态
        isLoading,
        currentTaskId,
        setCurrentTaskId,
        sendMessage,
        stopGeneration,
        generateLoading,
        answerStarted,
        setAnswerStarted,
        setGenerateLoading,
        regenerateMessage
      }}
    >
      {children}
    </ChatContext.Provider>
  )
}