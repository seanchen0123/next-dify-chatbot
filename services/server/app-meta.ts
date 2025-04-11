import serverClient from '@/lib/server-client'
import { AppMetaResponse } from '../types/common'

// 获取应用Meta信息
export async function getAppMeta(): Promise<AppMetaResponse> {
  try {
    const response = await serverClient.get<AppMetaResponse>('/meta')
    return response.data
  } catch (error) {
    console.error('获取应用Meta信息失败:', error)
    throw error
  }
}