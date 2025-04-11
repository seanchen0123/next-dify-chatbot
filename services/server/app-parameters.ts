import serverClient from '@/lib/server-client'
import { AppParametersResponse } from '../types/common'

// 获取应用参数
export async function getAppParameters(): Promise<AppParametersResponse> {
  try {
    const response = await serverClient.get<AppParametersResponse>('/parameters')
    return response.data
  } catch (error) {
    console.error('获取应用参数失败:', error)
    throw error
  }
}