'use client'

import { MessageCirclePlusIcon } from 'lucide-react'
import { Sidebar } from './sidebar'
import { ThemeToggle } from '@/components/theme-toggle'
import { useChat } from '@/contexts/chat-context'

import { Button } from '@/components/ui/button'
import { SidebarProvider, SidebarTrigger } from '../ui/sidebar'
import { useIsMobile } from '@/hooks/use-mobile'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip'
import { cn } from '@/lib/utils'

interface ChatLayoutProps {
  children: React.ReactNode
}

export function ChatLayout({ children }: ChatLayoutProps) {
  const { startNewChat } = useChat()
  const isMobile = useIsMobile()

  // 创建新对话 - 使用共享逻辑
  const handleNewChat = async () => {
    await startNewChat()
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen overflow-hidden bg-background w-full">
        <Sidebar />

        {/* 主内容区 */}
        <div className="flex flex-1 flex-col overflow-hidden transition-all duration-300 ease-in-out">
          {/* 顶部导航栏 */}
          <header className="flex h-14 items-center justify-between border-b px-4">
            <SidebarTrigger />

            <div className=" text-xl text-foreground font-semibold">AI Chatbot</div>

            <div className="flex items-center space-x-2">
              {isMobile && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        onClick={handleNewChat}
                        variant="ghost"
                        size="icon"
                        className={cn('h-7 w-7', isMobile ? 'ml-2' : 'ml-0')}
                      >
                        <MessageCirclePlusIcon />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="right">新建对话</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              <ThemeToggle />
            </div>
          </header>

          {/* 页面内容 */}
          <main className="flex-1 overflow-auto">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  )
}
