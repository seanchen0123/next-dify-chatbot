import { createServerClient } from '@/lib/server-client'
import { MessagesResponse } from '@/types/message'
import { GetMessagesParams, GetNextRoundSuggestionsParams, StopMessageParams, SubmitMessageFeedbackParams } from '../types/common'

// 获取会话历史消息
export async function getMessages(params: GetMessagesParams): Promise<MessagesResponse> {
  try {
    const { conversationId, userId, firstId, limit = 20, appId } = params
    const serverClient = createServerClient(appId)

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
    const { userId, taskId, appId } = params
    const serverClient = createServerClient(appId)

    await serverClient.post(`/chat-messages/${taskId}/stop`, {
      user: userId
    })
  } catch (error) {
    console.error('停止消息生成失败:', error)
    throw error
  }
}

// 提交消息反馈（点赞/点踩）
export async function submitMessageFeedback(params: SubmitMessageFeedbackParams): Promise<void> {
  const { messageId, rating, userId, content, appId } = params
  const serverClient = createServerClient(appId)

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

// 获取下一轮建议问题列表
export async function getNextRoundSuggestions(params: GetNextRoundSuggestionsParams): Promise<string[]> {
  const { messageId, userId, appId } = params
  const serverClient = createServerClient(appId)

  try {
    const response = await serverClient.get(`/messages/${messageId}/suggested`, {
      params: {
        user: userId
      }
    })
    return response.data
  } catch (error) {
    console.error('获取下一轮建议问题列表失败:', error)
    throw error
  }
}
