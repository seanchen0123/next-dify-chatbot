// 会话类型定义
export interface ApiConversation {
  id: string
  name: string
  inputs: Record<string, any>
  status: string
  introduction: string
  created_at: string
  updated_at: string
}

export interface ConversationsResponse {
  data: ApiConversation[]
  has_more: boolean
  limit: number
}

export interface GetConversationsResult {
  conversations: ApiConversation[]
  hasMore: boolean
}
