/**
 * 应用配置工具
 * 根据 appId 获取对应的 API Key 和 Base URL
 */

// 定义应用配置类型
export interface AppConfig {
  apiKey: string
  baseUrl: string
}

/**
 * 获取应用配置
 * @param appId 应用ID
 * @returns 应用配置对象
 */
export function getAppConfig(appId?: string): AppConfig {
  // baseUrl在该项目中是一样的
  const baseUrl = process.env.CHAT_API_BASE_URL || ''
  // 如果没有提供 appId 或者 appId 为空，使用默认配置
  if (!appId) {
    return {
      apiKey: process.env.DEFAULT_CHAT_API_KEY || '',
      baseUrl
    }
  }

  // 构造环境变量名
  const apiKeyEnvName = `CHAT_API_KEY_${appId.toLowerCase()}`

  // 获取对应的环境变量值
  const apiKey = process.env[apiKeyEnvName]

  // 如果找不到对应的配置，使用默认配置
  if (!apiKey) {
    console.warn(`未找到应用 ${appId} 的配置，使用默认配置`)
    return {
      apiKey: process.env.DEFAULT_CHAT_API_KEY || '',
      baseUrl
    }
  }

  return { apiKey, baseUrl }
}
