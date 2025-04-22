import api from '@/lib/api'
import { Message, MessagesResponse, GetFormattedMessagesResult } from '@/types/message'
import { formatMessagesToDisplay, sortMessagesByTime } from '@/lib/utils'
import { GetMessagesParams, GetNextRoundSuggestionsParams, StopMessageParams, SubmitMessageFeedbackParams, TextToAudioParams } from '../types/common'

// 获取会话历史消息（原始格式）
export async function getMessages(params: GetMessagesParams): Promise<Message[]> {
  try {
    const { conversationId, userId, firstId, limit = 20, appId } = params

    const requestParams = {
      conversation_id: conversationId,
      user: userId,
      first_id: firstId,
      limit,
      appId
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
    const { conversationId, userId, firstId, limit, appId } = params

    const response = await api.get<MessagesResponse>('/messages', {
      params: {
        conversation_id: conversationId,
        user: userId,
        first_id: firstId,
        limit,
        appId
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

// 提交消息反馈（点赞/点踩）
export async function submitMessageFeedback(params: SubmitMessageFeedbackParams): Promise<void> {
  const { messageId, userId, rating, content, appId } = params
  try {
    await api.post(`/messages/${messageId}/feedbacks`, {
      userId,
      rating,
      content,
      appId
    })
  } catch (error) {
    console.error('提交消息反馈失败:', error)
    throw error
  }
}

// 停止消息生成
export async function stopMessageGeneration(params: StopMessageParams): Promise<void> {
  try {
    const { taskId, userId, appId } = params

    await api.post(`/chat-messages/${taskId}/stop`, {
      userId,
      appId
    })
  } catch (error) {
    console.error('停止消息生成失败:', error)
    throw error
  }
}

// 获取下一轮建议问题列表
export async function getNextRoundSuggestions(params: GetNextRoundSuggestionsParams): Promise<string[]> {
  const { messageId, userId, appId } = params
  try {
    const response = await api.post(`/messages/${messageId}/suggested`, {
      userId,
      appId
    })
    return response.data.data
  } catch (error) {
    console.error('获取下一轮建议问题列表失败:', error)
    throw error
  }
}

export async function textToAudio(params: TextToAudioParams): Promise<Blob> {
  const { messageId, text, userId, appId } = params
  try {
    const response = await api.post('/text-to-audio', {
      messageId,
      text,
      userId,
      appId
    }, {
      responseType: 'blob'
    })
    return response.data
  } catch (error) {
    console.error('文本转语音失败:', error)
    throw error
  }
}

export async function audioToText(audioFile: File, userId: string, appId: string): Promise<string> {
  try {
    const formData = new FormData()
    formData.append('file', audioFile)
    formData.append('userId', userId)
    formData.append('appId', appId || '')

    const response = await api.post('/audio-to-text', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    console.log(response)
    return response.data.text
  } catch (error) {
    console.error('语音转文字请求失败:', error)
    throw new Error('语音转文字失败')
  }
}