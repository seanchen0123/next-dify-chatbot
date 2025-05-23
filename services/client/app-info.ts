import api from '@/lib/api'
import { AppInfoResponse } from '../types/common'

// 获取应用基本信息
export async function getAppInfo(appId: string): Promise<AppInfoResponse> {
  try {
    const response = await api.get('/app-info', { params: { appId } })
    return response.data
  } catch (error) {
    console.error('获取应用信息失败:', error)
    throw error
  }
}