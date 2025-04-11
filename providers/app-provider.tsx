'use client'

import { useState, useEffect, ReactNode } from 'react'
import { getAppInfo } from '@/services/client/app-info'
import { getAppParameters } from '@/services/client/app-parameters'
import { getAppMeta } from '@/services/client/app-meta'
import { AppInfoResponse, AppParametersResponse, AppMetaResponse } from '@/services/types/common'
import { AppContext } from '@/contexts/app-context'


export function AppProvider({ children }: { children: ReactNode }) {
  const [appInfo, setAppInfo] = useState<AppInfoResponse | null>(null)
  const [appParameters, setAppParameters] = useState<AppParametersResponse | null>(null)
  const [appMeta, setAppMeta] = useState<AppMetaResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchAppData = async () => {
      setIsLoading(true)
      setError(null)
      
      try {
        // 并行获取所有应用数据
        const [infoResponse, parametersResponse, metaResponse] = await Promise.all([
          getAppInfo(),
          getAppParameters(),
          getAppMeta()
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

  return (
    <AppContext.Provider value={{ appInfo, appParameters, appMeta, isLoading, error }}>
      {children}
    </AppContext.Provider>
  )
}