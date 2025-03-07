'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { Menu, ChevronDown } from 'lucide-react'
import { Sidebar } from './sidebar'
import { ThemeToggle } from '@/components/theme-toggle'
import { UserAvatar } from '@/components/user-avatar'

import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { SidebarProvider, SidebarTrigger } from '../ui/sidebar'
import { useIsMobile } from '@/hooks/use-mobile'

interface ChatLayoutProps {
  children: React.ReactNode
}

export function ChatLayout({ children }: ChatLayoutProps) {

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
