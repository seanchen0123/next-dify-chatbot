import serverClient from '@/lib/server-client'
import { MessagesResponse } from '@/types/message'
import { GetMessagesParams, StopMessageParams, SubmitMessageFeedbackParams } from '../types/common'

// 获取会话历史消息
export async function getMessages(params: GetMessagesParams): Promise<MessagesResponse> {
  try {
    const { conversationId, userId, firstId, limit = 20 } = params

    const requestParams = {
      conversation_id: conversationId,
      user: userId,
      first_id: firstId,
      limit
    }

    const response = await serverClient.get<MessagesResponse>('/messages', {
      params: requestParams
    })

    return response.data
  } catch (error) {
    console.error('获取历史消息失败:', error)
    throw error
  }
}

// 停止消息生成
export async function stopMessageGeneration(params: StopMessageParams): Promise<void> {
  try {
    const { userId, taskId } = params

    await serverClient.post(`/chat-messages/${taskId}/stop`, {
      user: userId
    })
  } catch (error) {
    console.error('停止消息生成失败:', error)
    throw error
  }
}

// 在现有文件中添加以下函数

// 提交消息反馈（点赞/点踩）
export async function submitMessageFeedback(params: SubmitMessageFeedbackParams): Promise<void> {
  const { messageId, rating, userId, content } = params
  try {
    await serverClient.post(`/messages/${messageId}/feedbacks`, {
      rating,
      user: userId,
      content
    })
  } catch (error) {
    console.error('提交消息反馈失败:', error)
    throw error
  }
}
