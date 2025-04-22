import api from '@/lib/api'
import { AppMetaResponse } from '../types/common'

// 获取应用Meta信息
export async function getAppMeta(appId: string): Promise<AppMetaResponse> {
  try {
    const response = await api.get('/app-meta', { params: { appId: appId } })
    return response.data
  } catch (error) {
    console.error('获取应用Meta信息失败:', error)
    throw error
  }
}