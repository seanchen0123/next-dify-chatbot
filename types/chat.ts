export interface User {
  id: string;
  name?: string;
}

export interface ChatRequest {
  query: string
  conversation_id?: string
  user?: string
  files?: Array<{
    type: string
    transfer_method: string
    url: string
  }>
  inputs?: Record<string, any>
}