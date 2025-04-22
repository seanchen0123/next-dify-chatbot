import api from '@/lib/api'
import { GetConversationsResult } from '@/types/conversation'
import { DeleteConversationParams, GetConversationsParams, RenameConversationParams } from '../types/common'

// 获取会话列表
export async function getConversations(params: GetConversationsParams): Promise<GetConversationsResult> {
  try {
    const { lastId, limit = 20, sortBy = '-updated_at', userId, appId } = params

    const requestParams = {
      userId,
      last_id: lastId,
      limit,
      sort_by: sortBy,
      appId
    }

    const response = await api.get('/conversations', { params: requestParams })
    return {
      conversations: response.data.data,
      hasMore: response.data.has_more
    }
  } catch (error) {
    console.error('获取会话列表失败:', error)
    throw error
  }
}

// 删除会话
export async function deleteConversation(params: DeleteConversationParams): Promise<void> {
  try {
    const { conversationId, userId, appId } = params

    await api.delete(`/conversations/${conversationId}`, {
      data: { userId, appId }
    })
  } catch (error) {
    console.error('删除会话失败:', error)
    throw error
  }
}

// 重命名会话
export async function renameConversation(params: RenameConversationParams): Promise<void> {
  try {
    const { conversationId, userId, name, autoGenerate = false, appId } = params

    await api.post(`/conversations/${conversationId}/name`, {
      userId,
      name,
      auto_generate: autoGenerate,
      appId
    })
  } catch (error) {
    console.error('重命名会话失败:', error)
    throw error
  }
}
