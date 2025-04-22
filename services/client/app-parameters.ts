import api from '@/lib/api'
import { AppParametersResponse } from '../types/common'

// 获取应用参数
export async function getAppParameters(appId: string): Promise<AppParametersResponse> {
  try {
    const response = await api.get('/app-parameters', { params: { appId: appId } })
    return response.data
  } catch (error) {
    console.error('获取应用参数失败:', error)
    throw error
  }
}