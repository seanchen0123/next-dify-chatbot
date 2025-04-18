'use client'

import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"

interface ErrorPageProps {
  title?: string
  description?: string
  actionText?: string
  actionLink?: string
  errorCode?: string
}

export function ErrorPage({
  title = "page not found",
  description = "sorry about that!",
  actionText = "return home?",
  actionLink = "/",
  errorCode = "404"
}: ErrorPageProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // 从 URL 参数中获取错误信息（如果有）
  const urlTitle = searchParams.get('title')
  const urlDescription = searchParams.get('description')
  const urlActionText = searchParams.get('actionText')
  const urlActionLink = searchParams.get('actionLink')
  const urlErrorCode = searchParams.get('errorCode')
  
  // 优先使用 URL 参数中的值
  const displayTitle = urlTitle || title
  const displayDescription = urlDescription || description
  const displayActionText = urlActionText || actionText
  const displayActionLink = urlActionLink || actionLink
  const displayErrorCode = urlErrorCode || errorCode

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <div className="text-center">
        <div className="relative">
          <div className="flex items-center justify-center">
            <div className="text-left mr-8">
              <div className="text-muted-foreground">{displayErrorCode + ' Error'}</div>
              <div className="font-medium">{displayTitle}</div>
            </div>
            
            <div className="relative mx-2">
              <svg width="24" height="80" viewBox="0 0 24 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path 
                  d="M12 0L4 20L20 40L4 60L12 80" 
                  stroke="#EF4444" 
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            
            <div className="text-right ml-8">
              <div className="text-muted-foreground">{displayDescription}</div>
              <Link 
                href={displayActionLink} 
                className="font-medium hover:underline"
              >
                {displayActionText}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}