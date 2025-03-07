'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Plus, MessageSquare, Settings, X, Trash2, Search, ChevronLeft, Loader2, Edit } from 'lucide-react'
import { Conversation } from '@/types/chat'
import { getConversations, createConversation, deleteConversation } from '@/services/api'
import { ThemeToggle } from '@/components/theme-toggle'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

// 导入 shadcn 的 Sidebar 组件
import {
  Sidebar as ShadcnSidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger
} from '@/components/ui/sidebar'
import { useIsMobile } from '@/hooks/use-mobile'

interface SidebarProps {
  onClose?: () => void
}

export function Sidebar({ onClose }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)

  const isMobile = useIsMobile()

  // 加载对话列表
  useEffect(() => {
    async function loadConversations() {
      setIsLoading(true)
      try {
        const data = await getConversations()
        setConversations(data)
      } catch (error) {
        console.error('加载对话列表失败:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadConversations()
  }, [])

  // 创建新对话
  const handleNewChat = async () => {
    try {
      // const newConversation = await createConversation()
      // setConversations(prev => [newConversation, ...prev])
      // router.push(`/chat/${newConversation.id}`)
      router.push(`/chat/1`)
      onClose && onClose() // 在移动设备上创建新对话后关闭侧边栏
    } catch (error) {
      console.error('创建新对话失败:', error)
    }
  }

  // 删除对话
  const handleDeleteConversation = async (id: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    try {
      await deleteConversation(id)
      setConversations(prev => prev.filter(conv => conv.id !== id))

      // 如果删除的是当前正在查看的对话，则重定向到新对话
      if (pathname === `/chat/${id}`) {
        router.push('/chat')
      }
    } catch (error) {
      console.error('删除对话失败:', error)
    }
  }

  // 搜索对话
  const handleSearch = () => {
    setIsSearching(!isSearching)
    if (!isSearching) {
      setSearchQuery('')
    }
  }

  // 过滤对话
  const filteredConversations = searchQuery.trim()
    ? conversations.filter(conv => conv.title.toLowerCase().includes(searchQuery.toLowerCase()))
    : conversations

  return (
    <ShadcnSidebar>
      <SidebarHeader className="h-14 border-b px-4">
        <div className="flex items-center justify-between w-full h-full">
          {isMobile && <SidebarTrigger />}

            <div className={cn('flex-1 flex', isMobile ? 'justify-end' : 'justify-start')}>
            <Button variant="ghost" size="icon" onClick={handleSearch}  className='h-7 w-7'>
              <Search />
            </Button>
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button onClick={handleNewChat} variant="ghost" size="icon" className={cn('h-7 w-7', isMobile ? 'ml-2' : 'ml-0')}>
                    <Edit />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">新建对话</TooltipContent>
              </Tooltip>
            </TooltipProvider>
        </div>
      </SidebarHeader>

      <SidebarContent>
        {isSearching && (
          <div className="p-4 border-b">
            <Input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="搜索对话..."
              className="w-full"
            />
          </div>
        )}

        <SidebarMenu className="px-2">
          {isLoading ? (
            <div className="flex justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="py-4 text-center text-sm text-muted-foreground">
              {searchQuery ? '没有找到匹配的对话' : '没有对话历史'}
            </div>
          ) : (
            <div className="space-y-1">
              {filteredConversations.map(conversation => (
                <SidebarMenuItem
                  key={conversation.id}
                  href={`/chat/${conversation.id}`}
                  isActive={pathname === `/chat/${conversation.id}`}
                  className="group"
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <MessageSquare className="h-4 w-4 flex-shrink-0" />
                      <span className="truncate">{conversation.title}</span>
                    </div>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={e => handleDeleteConversation(conversation.id, e)}
                            className="opacity-0 group-hover:opacity-100 h-8 w-8"
                          >
                            <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                            <span className="sr-only">删除对话</span>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="right">删除对话</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </SidebarMenuItem>
              ))}
            </div>
          )}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter></SidebarFooter>
    </ShadcnSidebar>
  )
}
