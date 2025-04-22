export interface User {
  id: string
  name?: string
}

export interface ChatRequest {
  query: string
  conversation_id?: string
  user: string
  files?: UploadFileItem[]
  inputs?: Record<string, any>
  appId: string
}

export interface UploadFileItem {
  type: string
  transfer_method: 'remote_url' | 'local_file'
  url?: string
  upload_file_id?: string
}
