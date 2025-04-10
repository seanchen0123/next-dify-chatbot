import { formatDistanceToNow } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { User, Bot, CopyIcon, PencilIcon, RefreshCwIcon, ThumbsUpIcon, ThumbsDownIcon } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import Image from 'next/image'
import { Button } from '../ui/button'
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/cjs/styles/prism'
import { oneLight } from 'react-syntax-highlighter/dist/cjs/styles/prism'
import { useRef } from 'react'
import { useTheme } from 'next-themes'
import { DisplayMessage } from '@/types/message'

interface ChatMessageProps {
  message: DisplayMessage
}

export function ChatMessage({ message: { role, content } }: ChatMessageProps) {
  const { theme, resolvedTheme } = useTheme()

  // 根据当前主题选择代码高亮样式
  const codeTheme = resolvedTheme === 'dark' ? oneDark : oneLight

  return (
    <div className="flex flex-col items-center w-full max-w-3xl text-sm">
      <div className={cn('flex flex-col w-full mb-2', role === 'user' ? 'items-end' : 'items-start')}>
        <div
          className={cn(
            'group relative flex max-w-2xl py-2 rounded-xl',
            role === 'user' ? 'bg-sky-600/10 px-3' : 'bg-background'
          )}
        >
          <div
            className={cn(
              'opacity-0 group-hover:opacity-100 absolute transition-all',
              role === 'user' ? '-left-16 top-2' : 'left-12 -bottom-6'
            )}
          >
            <div className="flex items-center opacity-70 gap-2">
              {role === 'user' ? (
                <div className="flex items-center gap-2">
                  <CopyIcon className="w-6 h-6 cursor-pointer rounded-sm hover:bg-primary/20 p-1 duration-200 transition-all" />

                  <PencilIcon className="w-6 h-6 cursor-pointer rounded-sm hover:bg-primary/20 p-1 duration-200 transition-all" />
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <CopyIcon className="w-6 h-6 cursor-pointer rounded-sm hover:bg-primary/20 p-1 duration-200 transition-all" />

                  <RefreshCwIcon className="w-6 h-6 cursor-pointer rounded-sm hover:bg-primary/20 p-1 duration-200 transition-all" />

                  <ThumbsUpIcon className="w-6 h-6 cursor-pointer rounded-sm hover:bg-primary/20 p-1 duration-200 transition-all" />

                  <ThumbsDownIcon className="w-6 h-6 cursor-pointer rounded-sm hover:bg-primary/20 p-1 duration-200 transition-all" />
                </div>
              )}
            </div>
          </div>
          {role === 'user' ? (
            <span className="">
              <Markdown>{content}</Markdown>
            </span>
          ) : (
            <div className="flex items-start">
              {/* <Image
                src={'/next.svg'}
                width={40}
                height={40}
                alt="logo"
                className="h-10 w-10 p-1 border-2 border-primary/90 rounded-full shrink-0"
              /> */}
              <div className="h-10 w-10 p-1 border-2 border-primary/90 rounded-full shrink-0 flex items-center justify-center bg-primary/10">
                <Bot className="h-6 w-6 text-primary" />
              </div>
              <span className="ml-3 prose prose-sm dark:prose-invert max-w-none prose-pre:border-0 prose-pre:bg-transparent">
                <Markdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    code({ node, className, children, ...props }) {
                      // 检查是否是代码块（通过className判断）
                      const match = /language-(\w+)/.exec(className || '')

                      // 如果有language-前缀，说明是代码块，否则是行内代码
                      if (match) {
                        return (
                          <div className="rounded-md my-2 overflow-hidden shadow-sm">
                            <SyntaxHighlighter
                              style={codeTheme}
                              language={match[1]}
                              PreTag="div"
                              wrapLines={true}
                              customStyle={{
                                margin: 0,
                                borderRadius: '0.375rem',
                                border: 'none'
                              }}
                            >
                              {String(children).replace(/\n$/, '')}
                            </SyntaxHighlighter>
                          </div>
                        )
                      } else {
                        return (
                          <code
                            className={cn(className, 'bg-muted px-1.5 py-0.5 rounded-sm font-mono text-sm')}
                            {...props}
                          >
                            {children}
                          </code>
                        )
                      }
                    }
                  }}
                >
                  {content}
                </Markdown>
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
