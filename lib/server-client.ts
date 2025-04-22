import axios, { AxiosInstance } from 'axios'
import { getAppConfig } from './app-config'

export function createServerClient(appId?: string): AxiosInstance {
  const { apiKey, baseUrl } = getAppConfig(appId)
  // 创建一个 axios 实例，用于服务端请求
  const serverClient = axios.create({
    baseURL: baseUrl,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`
    }
  })

  // 添加请求拦截器，检查API密钥是否存在
  serverClient.interceptors.request.use(
    config => {
      if (!apiKey) {
        throw new Error(`CHAT_API_KEY_${appId} 环境变量未设置，请在 .env 文件中配置有效的 API 密钥`)
      }

      if (!baseUrl) {
        throw new Error('CHAT_API_BASE_URL 环境变量未设置，请在 .env 文件中配置有效的 API 基础 URL')
      }

      return config
    },
    error => {
      return Promise.reject(error)
    }
  )

  // 添加响应拦截器，处理文件预览URL
  serverClient.interceptors.response.use(
    response => {
      if (response.config.responseType && ['blob', 'stream'].includes(response.config.responseType)) {
        return response
      }
      // 检查响应数据是否为字符串
      if (typeof response.data === 'string') {
        response.data = response.data.replace(response.data, '/api/files/$1/preview$2')
      }
      return response
    },
    error => {
      return Promise.reject(error)
    }
  )

  return serverClient
}

// 为了向后兼容，导出默认的客户端实例
const defaultServerClient = createServerClient()

export default defaultServerClient
