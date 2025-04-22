import { createServerClient } from '@/lib/server-client'
import { UploadedFileResponse } from '../types/common'

// 上传文件
export async function uploadFile(file: File, userId: string, appId: string): Promise<UploadedFileResponse> {
  try {
    const serverClient = createServerClient(appId)
    const formData = new FormData()
    formData.append('file', file)
    formData.append('user', userId)

    const response = await serverClient.post<UploadedFileResponse>('/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })

    return response.data
  } catch (error) {
    console.error('文件上传失败:', error)
    throw error
  }
}
