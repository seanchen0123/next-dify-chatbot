'use client'

import { Suspense } from 'react'
import { redirect, useSearchParams } from 'next/navigation'

// 创建一个包含重定向逻辑的组件
function HomeRedirect() {
  const searchParams = useSearchParams()
  const userId = searchParams.get('userId')

  if (!userId) {
    redirect('/error?title=Missing User ID&errorCode=400')
  } else {
    redirect(`/chat?userId=${userId}`)
  }
  
  // 这一行永远不会执行，但需要返回一些内容以避免 TypeScript 错误
  return null
}

export default function HomePage() {
  return (
    <Suspense fallback={null}>
      <HomeRedirect />
    </Suspense>
  )
}
