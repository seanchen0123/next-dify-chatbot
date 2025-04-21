'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Trash2, Search, Loader2, Edit, MoreHorizontal, MessageCirclePlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

// 导入 shadcn 的 Sidebar 组件
import {
  Sidebar as ShadcnSidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar
} from '@/components/ui/sidebar'
import { useIsMobile } from '@/hooks/use-mobile'

// 导入 DropdownMenu 组件
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

// 导入 Dialog 组件
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'

// 导入 AlertDialog 组件
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog'

import { ApiConversation } from '@/types/conversation'
import { useChat } from '@/contexts/chat-context'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn' // 导入中文语言包
import relativeTime from 'dayjs/plugin/relativeTime' // 相对时间插件
import { renameConversation } from '@/services/client/conversations'
import { ThemeToggle } from '../theme-toggle'
import { useApp } from '@/contexts/app-context'
import { toast } from '../ui/custom-toast'

// 初始化 dayjs 插件
dayjs.extend(relativeTime)
dayjs.locale('zh-cn')
const year = dayjs().format('YYYY')

interface SidebarProps {}

export function Sidebar({}: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { setOpenMobile } = useSidebar()
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [renameDialogOpen, setRenameDialogOpen] = useState(false)
  const [currentConversation, setCurrentConversation] = useState<ApiConversation | null>(null)
  const [newConversationName, setNewConversationName] = useState('')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  const isMobile = useIsMobile()

  // 从 ChatContext 获取会话列表相关状态和方法
  const { startNewChat, conversations, isLoadingConversations, loadConversations, deleteConversation, userId } =
    useChat()

  const { appInfo } = useApp()
  const appName = appInfo?.name || ''

  // 重命名对话
  const handleRenameConversation = async () => {
    if (!currentConversation || !newConversationName.trim()) return

    try {
      await renameConversation({ conversationId: currentConversation.id, name: newConversationName, userId })

      // 重命名后需要重新加载会话列表
      loadConversations()

      setRenameDialogOpen(false)
      toast.success('对话重命名成功')
    } catch (error) {
      console.error('重命名对话失败:', error)
      toast.error('对话重命名失败')
    }
  }

  // 打开重命名对话框
  const openRenameDialog = (conversation: ApiConversation) => {
    setCurrentConversation(conversation)
    setNewConversationName(conversation.name)
    setRenameDialogOpen(true)
  }

  // 打开删除确认对话框
  const openDeleteDialog = (conversation: ApiConversation) => {
    setCurrentConversation(conversation)
    setDeleteDialogOpen(true)
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
    ? conversations.filter(conv => conv.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : conversations

  // 按时间分组对话
  const groupedConversations = useMemo(() => {
    if (!filteredConversations.length) return {}

    const today = dayjs().startOf('day')
    const yesterday = today.subtract(1, 'day')
    const lastWeek = today.subtract(7, 'day')
    const lastMonth = today.subtract(30, 'day')

    const groups: Record<string, ApiConversation[]> = {
      '今天': [],
      '昨天': [],
      '7天内': [],
      '30天内': []
    }

    // 其他日期分组
    const otherGroups: Record<string, ApiConversation[]> = {}

    filteredConversations.forEach(conv => {
      const createTime = dayjs(parseInt(conv.created_at) * 1000)

      if (createTime.isAfter(today)) {
        groups['今天'].push(conv)
      } else if (createTime.isAfter(yesterday)) {
        groups['昨天'].push(conv)
      } else if (createTime.isAfter(lastWeek)) {
        groups['7天内'].push(conv)
      } else if (createTime.isAfter(lastMonth)) {
        groups['30天内'].push(conv)
      } else {
        // 按年月日分组
        const dateKey = createTime.format('YYYY-MM-DD')
        if (!otherGroups[dateKey]) {
          otherGroups[dateKey] = []
        }
        otherGroups[dateKey].push(conv)
      }
    })

    // 合并所有分组
    const result: Record<string, ApiConversation[]> = {}

    // 只添加有内容的分组
    Object.entries(groups).forEach(([key, convs]) => {
      if (convs.length > 0) {
        result[key] = convs
      }
    })

    // 添加其他日期分组（按日期排序）
    Object.keys(otherGroups)
      .sort((a, b) => dayjs(b).unix() - dayjs(a).unix())
      .forEach(dateKey => {
        result[dateKey] = otherGroups[dateKey]
      })

    return result
  }, [filteredConversations])

  return (
    <ShadcnSidebar>
      <SidebarHeader className="h-14">
        <div className="flex items-center justify-between w-full h-full">
          {isMobile && <SidebarTrigger />}

          <div className="flex-1 flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={handleSearch} className="h-7 w-7">
              <Search className="scale-125" />
            </Button>
            {isSearching && (
              <div className="flex-1">
                <Input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="搜索对话..."
                  className="w-full"
                />
              </div>
            )}
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <div className="px-2 mt-2">
          <Button
            variant="outline"
            className="w-full bg-primary/10 hover:bg-primary/20 text-primary border-primary/20 flex items-center justify-center gap-2 py-4"
            onClick={async () => {
              await startNewChat()
              if (isMobile) {
                setOpenMobile(false)
              }
            }}
          >
            <MessageCirclePlus className="h-4 w-4" />
            <span className="font-medium">开启新对话</span>
          </Button>
        </div>

        <SidebarMenu className="px-2">
          {isLoadingConversations ? (
            <div className="flex justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : Object.keys(groupedConversations).length === 0 ? (
            <div className="py-4 text-center text-sm text-muted-foreground">
              {searchQuery ? '没有找到匹配的对话' : '没有对话历史'}
            </div>
          ) : (
            <div className="space-y-4">
              {Object.entries(groupedConversations).map(([groupName, convs]) => (
                <div key={groupName} className="space-y-1">
                  <div className="text-xs font-medium text-muted-foreground px-3 py-1">{groupName}</div>

                  {convs.map(conversation => (
                    <SidebarMenuItem
                      key={conversation.id}
                      className={cn(
                        'group rounded-md hover:bg-accent px-3 py-2',
                        pathname === `/chat/${conversation.id}` && 'bg-slate-500/10'
                      )}
                    >
                      <div className='cursor-pointer' onClick={() => {
                        router.push(`/chat/${conversation.id}?userId=${userId}`)
                        if (isMobile) {
                          setOpenMobile(false)
                        }
                      }}>
                        <div className="flex items-center justify-between w-full">
                          <span className="truncate font-medium text-sm">{conversation.name}</span>

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className={cn(
                                  'h-8 w-8',
                                  isMobile
                                    ? 'opacity-100'
                                    : 'opacity-0 group-hover:opacity-100 data-[state=open]:opacity-100'
                                )}
                                onClick={e => {
                                  e.stopPropagation() // 阻止事件冒泡
                                  e.preventDefault()
                                }}
                              >
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">打开菜单</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" onClick={e => e.stopPropagation()}>
                              <DropdownMenuItem
                                onClick={e => {
                                  e.stopPropagation(); // 阻止事件冒泡
                                  e.preventDefault()
                                  openRenameDialog(conversation)
                                }}
                              >
                                <Edit className="mr-2 h-4 w-4" />
                                <span>重命名</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-red-500 focus:text-red-500"
                                onClick={e => {
                                  e.stopPropagation(); // 阻止事件冒泡
                                  e.preventDefault()
                                  openDeleteDialog(conversation)
                                }}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                <span>删除</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </SidebarMenuItem>
                  ))}
                </div>
              ))}
            </div>
          )}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter>
        <div className='p-2 flex items-center justify-between'>
          <p className='text-sm text-muted-foreground opacity-70'>{appName && `© ${appName} ${year}`}</p>
          {isMobile && <ThemeToggle />}
        </div>
      </SidebarFooter>

      {/* 重命名对话框 */}
      <Dialog open={renameDialogOpen} onOpenChange={setRenameDialogOpen}>
        <DialogContent className='w-[96%] rounded-lg'>
          <DialogHeader>
            <DialogTitle>重命名对话</DialogTitle>
            <DialogDescription>请输入新的对话名称</DialogDescription>
          </DialogHeader>
          <Input
            value={newConversationName}
            onChange={e => setNewConversationName(e.target.value)}
            placeholder="对话名称"
            className="mt-4"
          />
          <DialogFooter className={cn(isMobile ? 'gap-2' : 'gap-0')}>
            <Button variant="outline" onClick={() => setRenameDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleRenameConversation}>保存</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 删除确认对话框 */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className='w-[96%] rounded-lg'>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>您确定要删除这个对话吗？此操作无法撤销。</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (currentConversation) {
                  try {
                    deleteConversation(currentConversation.id)
                    toast.success('对话删除成功')
                  } catch (error) {
                    console.error('删除对话失败:', error)
                    toast.error('删除对话失败')
                  }
                }
                setDeleteDialogOpen(false)
              }}
              className="bg-red-500 hover:bg-red-500/90"
            >
              删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </ShadcnSidebar>
  )
}
