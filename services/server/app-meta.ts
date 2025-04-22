import { createServerClient } from '@/lib/server-client'
import { AppMetaResponse } from '../types/common'

// 获取应用Meta信息
export async function getAppMeta(appId: string): Promise<AppMetaResponse> {
  try {
    const serverClient = createServerClient(appId)
    const response = await serverClient.get<AppMetaResponse>('/meta')
    return response.data
  } catch (error) {
    console.error('获取应用Meta信息失败:', error)
    throw error
  }
}