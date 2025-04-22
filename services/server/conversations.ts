import { createServerClient } from '@/lib/server-client'
import { ConversationsResponse } from '@/types/conversation'
import { DeleteConversationParams, GetConversationsParams, RenameConversationParams } from '../types/common'

// 获取会话列表
export async function getConversations(params: GetConversationsParams): Promise<ConversationsResponse> {
  try {
    const { userId, lastId, limit = 20, sortBy = '-updated_at', appId } = params
    const serverClient = createServerClient(appId)

    const requestParams = {
      user: userId,
      last_id: lastId,
      limit,
      sort_by: sortBy
    }

    const response = await serverClient.get<ConversationsResponse>('/conversations', { params: requestParams })
    return response.data
  } catch (error) {
    console.error('获取会话列表失败:', error)
    throw error
  }
}

// 删除会话
export async function deleteConversation(params: DeleteConversationParams): Promise<void> {
  try {
    const { userId, conversationId, appId } = params
    const serverClient = createServerClient(appId)

    await serverClient.delete(`/conversations/${conversationId}`, {
      data: { user: userId }
    })
  } catch (error) {
    console.error('删除会话失败:', error)
    throw error
  }
}

// 重命名会话
export async function renameConversation(params: RenameConversationParams): Promise<any> {
  try {
    const { userId, conversationId, name, autoGenerate = false, appId } = params
    const serverClient = createServerClient(appId)

    const requestBody = {
      user: userId,
      name,
      auto_generate: autoGenerate
    }

    const response = await serverClient.post(`/conversations/${conversationId}/name`, requestBody)
    return response.data
  } catch (error) {
    console.error('重命名会话失败:', error)
    throw error
  }
}
