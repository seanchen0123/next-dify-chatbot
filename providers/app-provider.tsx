'use client'

import { useState, useEffect, ReactNode } from 'react'
import { getAppInfo } from '@/services/client/app-info'
import { getAppParameters } from '@/services/client/app-parameters'
import { getAppMeta } from '@/services/client/app-meta'
import { AppInfoResponse, AppParametersResponse, AppMetaResponse, FileUploadConfig } from '@/services/types/common'
import { AppContext } from '@/contexts/app-context'
import { generateFileUploadConfig } from '@/lib/file-utils'


export function AppProvider({ children, appId }: { children: ReactNode, appId: string }) {
  const [appInfo, setAppInfo] = useState<AppInfoResponse | null>(null)
  const [appParameters, setAppParameters] = useState<AppParametersResponse | null>(null)
  const [appMeta, setAppMeta] = useState<AppMetaResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [uploadConfig, setUploadConfig] = useState<FileUploadConfig>(generateFileUploadConfig())

  useEffect(() => {
    const fetchAppData = async () => {
      setIsLoading(true)
      setError(null)
      
      try {
        // 并行获取所有应用数据
        const [infoResponse, parametersResponse, metaResponse] = await Promise.all([
          getAppInfo(appId),
          getAppParameters(appId),
          getAppMeta(appId)
        ])
        
        setAppInfo(infoResponse)
        setAppParameters(parametersResponse)
        setAppMeta(metaResponse)
      } catch (err) {
        console.error('获取应用数据失败:', err)
        setError(err instanceof Error ? err : new Error('获取应用数据失败'))
      } finally {
        setIsLoading(false)
      }
    }

    fetchAppData()
  }, [])

  useEffect(() => {
    // 当 appParameters 更新时，重新生成上传配置
    if (appParameters) {
      setUploadConfig(generateFileUploadConfig(appParameters))
    }
  }, [appParameters])

  return (
    <AppContext.Provider value={{ appId, appInfo, appParameters, appMeta, isLoading, error, uploadConfig }}>
      {children}
    </AppContext.Provider>
  )
}