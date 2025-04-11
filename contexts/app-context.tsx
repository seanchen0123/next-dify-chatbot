'use client'

import { createContext, useContext } from 'react'
import { AppInfoResponse, AppParametersResponse, AppMetaResponse } from '@/services/types/common'

interface AppContextType {
  appInfo: AppInfoResponse | null
  appParameters: AppParametersResponse | null
  appMeta: AppMetaResponse | null
  isLoading: boolean
  error: Error | null
}

export const AppContext = createContext<AppContextType | undefined>(undefined)

export function useApp() {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider')
  }
  return context
}