import axios from 'axios'

// 创建一个 axios 实例，用于服务端请求
const serverClient = axios.create({
  baseURL: process.env.CHAT_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${process.env.CHAT_API_KEY}`
  }
})

// 添加请求拦截器，检查API密钥是否存在
serverClient.interceptors.request.use(
  config => {
    if (!process.env.CHAT_API_KEY) {
      throw new Error('CHAT_API_KEY 环境变量未设置，请在 .env 文件中配置有效的 API 密钥')
    }

    if (!process.env.CHAT_API_BASE_URL) {
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

export default serverClient
