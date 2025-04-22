'use client'

import { AppItem } from '@/types/app'
import Image from 'next/image'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Bot } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTheme } from 'next-themes'

interface AppCardProps {
  app: AppItem
}

export default function AppCard({ app }: AppCardProps) {
  const searchParams = useSearchParams()
  const userId = searchParams.get('userId')
  const { resolvedTheme } = useTheme()
  
  return (
    <Link 
      href={`/${app.id}/chat?userId=${userId || ''}`}
      className={cn(
        "block h-[144px] p-4 rounded-lg transition-all duration-300",
        "hover:scale-[1.02] hover:shadow-lg",
        "border border-border",
        resolvedTheme === 'dark' 
          ? "bg-card shadow-md shadow-black/20 hover:shadow-black/30" 
          : "bg-white shadow-md shadow-gray-200/70 hover:shadow-gray-300/70"
      )}
    >
      <div className="flex flex-col h-full">
        {/* 顶部：图标和应用名称 */}
        <div className="flex items-center space-x-3 mb-3">
          <div className="flex-shrink-0 w-10 h-10 relative">
            {app.iconUrl ? (
              <Image 
                src={app.iconUrl} 
                alt={app.name} 
                fill 
                className="rounded-md object-cover"
              />
            ) : (
              <div className={cn(
                "w-10 h-10 rounded-md flex items-center justify-center",
                resolvedTheme === 'dark' ? "bg-primary/20" : "bg-primary/10"
              )}>
                <Bot className="h-6 w-6 text-primary" />
              </div>
            )}
          </div>
          <h2 className="text-base font-medium text-foreground truncate">{app.name}</h2>
        </div>
        
        {/* 下部分：应用描述 */}
        <div className="flex-1">
          <p className={cn(
            "text-sm text-muted-foreground",
            "line-clamp-3 overflow-hidden"
          )}>
            {app.description}
          </p>
        </div>
      </div>
    </Link>
  )
}