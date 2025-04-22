import { createServerClient } from '@/lib/server-client'
import { AppInfoResponse } from '../types/common'

// 获取应用基本信息
export async function getAppInfo(appId: string): Promise<AppInfoResponse> {
  const serverClient = createServerClient(appId)
  try {
    const response = await serverClient.get<AppInfoResponse>('/info')
    return response.data
  } catch (error) {
    console.error('获取应用信息失败:', error)
    throw error
  }
}