import api from '@/lib/api'
import { Message, MessagesResponse, GetFormattedMessagesResult } from '@/types/message'
import { formatMessagesToDisplay, sortMessagesByTime } from '@/lib/utils'
import { GetMessagesParams, StopMessageParams } from '../types/common'

// 获取会话历史消息（原始格式）
export async function getMessages(params: GetMessagesParams): Promise<Message[]> {
  try {
    const { conversationId, userId, firstId, limit = 20 } = params

    const requestParams = {
      conversation_id: conversationId,
      user: userId,
      first_id: firstId,
      limit
    }

    const response = await api.get<MessagesResponse>('/messages', {
      params: requestParams
    })

    return response.data.data
  } catch (error) {
    console.error('获取历史消息失败:', error)
    throw error
  }
}

// 获取格式化后的会话历史消息（用于前端显示）
export async function getFormattedMessages(params: GetMessagesParams): Promise<GetFormattedMessagesResult> {
  try {
    const { conversationId, userId, firstId, limit } = params

    const response = await api.get<MessagesResponse>('/messages', {
      params: {
        conversation_id: conversationId,
        user: userId,
        first_id: firstId,
        limit
      }
    })

    // 转换消息格式
    const formattedMessages = formatMessagesToDisplay(response.data.data)

    // 按时间排序
    const sortedMessages = sortMessagesByTime(formattedMessages)

    return {
      messages: sortedMessages,
      hasMore: response.data.has_more
    }
  } catch (error) {
    console.error('获取格式化历史消息失败:', error)
    throw error
  }
}

// 在现有文件中添加以下函数

// 停止消息生成
export async function stopMessageGeneration(params: StopMessageParams): Promise<void> {
  try {
    const { taskId, userId } = params
    
    await api.post(`/chat-messages/${taskId}/stop`, {
      userId
    })
  } catch (error) {
    console.error('停止消息生成失败:', error)
    throw error
  }
}