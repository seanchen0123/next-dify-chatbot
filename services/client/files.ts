import api from '@/lib/api'
import { UploadFileParams, UploadedFileResponse } from '../types/common'

// 上传文件
export async function uploadFile(params: UploadFileParams): Promise<UploadedFileResponse> {
  try {
    const { file, userId } = params
    
    const formData = new FormData()
    formData.append('file', file)
    formData.append('userId', userId)
    
    const response = await api.post('/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    
    return response.data
  } catch (error) {
    console.error('文件上传失败:', error)
    throw error
  }
}

export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      // 结果会是 "data:image/png;base64,xxxxx"
      resolve(reader.result as string);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}