import { formatDistanceToNow } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { User, Bot, CopyIcon, PencilIcon, RefreshCwIcon, ThumbsUpIcon, ThumbsDownIcon, ChevronDownIcon, ChevronUpIcon } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import Image from 'next/image'
import { Button } from '../ui/button'
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/cjs/styles/prism'
import { oneLight } from 'react-syntax-highlighter/dist/cjs/styles/prism'
import { useRef, useState, useEffect } from 'react'
import { useTheme } from 'next-themes'
import { DisplayMessage } from '@/types/message'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'

interface ChatMessageProps {
  message: DisplayMessage
}

export function ChatMessage({ message: { role, content } }: ChatMessageProps) {
  const { resolvedTheme } = useTheme()
  const [processedContent, setProcessedContent] = useState<{ thinking: string | null; mainContent: string }>({
    thinking: null,
    mainContent: content
  })
  const [isThinkingOpen, setIsThinkingOpen] = useState(true)

  // 根据当前主题选择代码高亮样式
  const codeTheme = resolvedTheme === 'dark' ? oneDark : oneLight

  // 处理思考过程内容
  useEffect(() => {
    if (role === 'assistant') {
      // 检查是否包含思考过程的开始标签
      const hasOpeningTag = content.includes('<details')
      
      // 检查是否包含完整的思考过程（开始和结束标签）
      const hasClosingTag = content.includes('</details>')
      
      if (hasOpeningTag) {
        let thinkingContent = null
        let mainContent = ""
        
        if (hasClosingTag) {
          // 完整的思考过程
          const detailsStartIndex = content.indexOf('<details')
          const detailsEndIndex = content.indexOf('</details>') + '</details>'.length
          
          if (detailsStartIndex !== -1 && detailsEndIndex !== -1) {
            const detailsContent = content.substring(detailsStartIndex, detailsEndIndex)
            
            // 提取 summary 标签之后的内容
            const summaryEndIndex = detailsContent.indexOf('</summary>')
            if (summaryEndIndex !== -1) {
              thinkingContent = detailsContent
                .substring(summaryEndIndex + '</summary>'.length, detailsContent.length - '</details>'.length)
                .trim()
            } else {
              // 没有 summary 标签，直接提取 details 内容
              thinkingContent = detailsContent
                .substring(detailsContent.indexOf('>') + 1, detailsContent.length - '</details>'.length)
                .trim()
            }
            
            // 提取主要内容（details 标签之后的内容）
            mainContent = content.substring(detailsEndIndex).trim()
          }
        } else {
          // 不完整的思考过程（只有开始标签）
          const detailsStartIndex = content.indexOf('<details')
          
          if (detailsStartIndex !== -1) {
            const detailsContent = content.substring(detailsStartIndex)
            
            // 提取 summary 标签之后的内容
            const summaryEndIndex = detailsContent.indexOf('</summary>')
            if (summaryEndIndex !== -1) {
              thinkingContent = detailsContent
                .substring(summaryEndIndex + '</summary>'.length)
                .trim()
            } else {
              // 没有 summary 标签或者 summary 标签不完整
              const openTagEndIndex = detailsContent.indexOf('>')
              if (openTagEndIndex !== -1) {
                thinkingContent = detailsContent
                  .substring(openTagEndIndex + 1)
                  .trim()
              } else {
                thinkingContent = "思考中..."
              }
            }
          }
        }
        
        setProcessedContent({
          thinking: thinkingContent,
          mainContent: mainContent
        })
      } else {
        // 没有思考过程，全部作为主要内容
        setProcessedContent({
          thinking: null,
          mainContent: content
        })
      }
    } else {
      // 用户消息，不处理思考过程
      setProcessedContent({
        thinking: null,
        mainContent: content
      })
    }
  }, [content, role])

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
              <div className="h-10 w-10 p-1 border-2 border-primary/90 rounded-full shrink-0 flex items-center justify-center bg-primary/10">
                <Bot className="h-6 w-6 text-primary" />
              </div>
              <span className="ml-3 prose prose-sm dark:prose-invert max-w-none prose-pre:border-0 prose-pre:bg-transparent">
                {/* 思考过程部分 - 使用 Collapsible 组件 */}
                {processedContent.thinking && (
                  <Collapsible
                    open={isThinkingOpen}
                    onOpenChange={setIsThinkingOpen}
                    className="mb-3"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <CollapsibleTrigger asChild>
                        <Button variant="ghost" size="sm" className="p-0 h-6 hover:bg-transparent">
                          {isThinkingOpen ? (
                            <ChevronUpIcon className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <ChevronDownIcon className="h-4 w-4 text-muted-foreground" />
                          )}
                          <span className='text-xs text-muted-foreground font-medium'>思考过程 {isThinkingOpen ? '(点击折叠)' : '(点击展开)'}</span>
                        </Button>
                      </CollapsibleTrigger>
                    </div>
                    
                    <CollapsibleContent>
                      <div className="p-3 bg-muted/50 rounded-md border border-muted-foreground/20">
                        <div className="text-sm text-muted-foreground whitespace-pre-wrap">{processedContent.thinking}</div>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                )}
                
                {/* 主要内容部分 */}
                {processedContent.mainContent && (
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
                    {processedContent.mainContent}
                  </Markdown>
                )}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
