'use client'

import { Suspense, useEffect, useState } from 'react'
import { redirect, useSearchParams } from 'next/navigation'
import { getAppList, hasDefinedAppList } from '@/config/apps'
import AppCard from '@/components/app-card'
import { AppList } from '@/types/app'
import { Loader2 } from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'
import { cn } from '@/lib/utils'
import { useTheme } from 'next-themes'

// 创建一个包含重定向逻辑的组件
function HomeRedirect() {
  const searchParams = useSearchParams()
  const userId = searchParams.get('userId')
  const appId = process.env.NEXT_PUBLIC_DEFAULT_APP_ID

  if (!appId) {
    redirect('/error?title=Please setting a default appId&errorCode=500')
  }

  if (!userId) {
    redirect('/error?title=Missing User ID&errorCode=400')
  } else {
    redirect(`/${appId}/chat?userId=${userId}`)
  }

  // 这一行永远不会执行，但需要返回一些内容以避免 TypeScript 错误
  return null
}

// 应用列表展示组件
function AppListDisplay() {
  const { resolvedTheme } = useTheme()
  const [apps, setApps] = useState<AppList>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 获取应用列表
    const appList = getAppList()
    setApps(appList)
    setLoading(false)
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="flex items-center gap-2">
          <Loader2 className="w-7 h-7 animate-spin text-primary" />
          <span className="text-sm text-primary">加载中...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen">
      {/* 固定的顶部标题栏 */}
      <div className={cn('sticky top-0 z-10 bg-background py-4 px-4', resolvedTheme === 'dark' ? 'shadow-md' : 'shadow-sm')}>
        <div className="container mx-auto flex items-center justify-between">
          <h1 className="text-xl font-bold">应用列表</h1>
          <ThemeToggle />
        </div>
      </div>
      
      {/* 可滚动的内容区域 */}
      <div className="flex-1 overflow-y-auto py-6 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
            {apps.map(app => (
              <AppCard key={app.id} app={app} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// 首页路由决策组件
function HomeRouteDecision() {
  const searchParams = useSearchParams()
  const userId = searchParams.get('userId')
  const hasApps = hasDefinedAppList()

  // 如果没有定义应用列表且有userId，则重定向到默认应用
  if (!hasApps && userId) {
    return <HomeRedirect />
  }

  // 如果没有userId但有应用列表，仍然显示应用列表
  // 用户点击应用时会提示需要userId
  return <AppListDisplay />
}

export default function HomePage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center h-screen">
          <div className="flex items-center gap-2">
            <Loader2 className="w-7 h-7 animate-spin text-primary" />
            <span className="text-sm text-primary">加载中...</span>
          </div>
        </div>
      }
    >
      <HomeRouteDecision />
    </Suspense>
  )
}
