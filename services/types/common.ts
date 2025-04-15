import { DisplayMessage } from "@/types/message"

export interface GetConversationsParams {
  userId: string
  lastId?: string
  limit?: number
  sortBy?: string
}

export interface DeleteConversationParams {
  conversationId: string
  userId: string
}

export interface GetMessagesParams {
  conversationId: string
  userId: string
  firstId?: string
  limit?: number
}

export interface GetFormattedMessagesResult {
  messages: DisplayMessage[]
  hasMore: boolean
}

export interface RenameConversationParams {
  userId: string
  conversationId: string
  name: string
  autoGenerate?: boolean
}

export interface StopMessageParams {
  userId: string
  taskId: string
}

export interface SubmitMessageFeedbackParams {
  messageId: string
  userId: string
  rating: 'like' | 'dislike' | null
  content?: string
}

export interface GetNextRoundSuggestionsParams {
  messageId: string
  userId: string
}

// 新增应用信息响应类型
export interface AppInfoResponse {
  name: string
  description: string
  tags: string[]
}

// 应用参数响应类型
export interface AppParametersResponse {
  opening_statement: string
  suggested_questions: string[]
  suggested_questions_after_answer: {
    enabled: boolean
  }
  speech_to_text: {
    enabled: boolean
  }
  text_to_speech: {
    enabled: boolean
  }
  retriever_resource: {
    enabled: boolean
  }
  annotation_reply: {
    enabled: boolean
  }
  user_input_form: Array<{
    'text-input'?: {
      label: string
      variable: string
      required: boolean
      default: string
    }
    paragraph?: {
      label: string
      variable: string
      required: boolean
      default: string
    }
    select?: {
      label: string
      variable: string
      required: boolean
      default: string
      options: string[]
    }
  }>
  file_upload: {
    enabled: boolean
    allowed_file_extensions?: string[]
    allowed_file_types: string[]
    allowed_file_upload_methods?: string[]
    number_limits: number,
    fileUploadConfig: {
      batch_count_limit: number
      file_size_limit: number
      image_file_size_limit: number
      audio_file_size_limit: number
      video_file_size_limit: number
      workflow_file_upload_limit: number
    }
  }
  system_parameters: {
    file_size_limit: number
    image_file_size_limit: number
    audio_file_size_limit: number
    video_file_size_limit: number
    workflow_file_upload_limit: number
  }
}

// 应用Meta信息响应类型
export interface AppMetaResponse {
  tool_icons: {
    [key: string]: {
      icon: string | {
        background: string;
        content: string;
      }
    }
  }
}

// 新增文件上传相关类型
export interface UploadFileParams {
  file: File
  userId: string
}

export interface UploadedFileResponse {
  id: string
  name: string
  size: number
  extension: string
  mime_type: string
  created_by: string
  created_at: string
  url?: string
}

// 新增文件上传配置接口
export interface FileUploadConfig {
  enabled: boolean
  allowedTypes: string[]
  allowedExtensions: string[]
  maxFiles: number
  maxSizeInMB: {
    default: number
    image: number
    audio: number
    video: number
    document: number
  }
  acceptString: string
}

export interface TextToAudioParams {
  messageId: string
  text: string
  userId: string
}