import {
  Bot,
  CopyIcon,
  RefreshCwIcon,
  ThumbsUpIcon,
  ThumbsDownIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  CheckIcon
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '../ui/button'
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/cjs/styles/prism'
import { materialLight } from 'react-syntax-highlighter/dist/cjs/styles/prism'
import { useState, useEffect } from 'react'
import { useTheme } from 'next-themes'
import { DisplayMessage } from '@/types/message'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { useChat } from '@/contexts/chat-context'
import { toast } from 'sonner'
import { submitMessageFeedback } from '@/services/client/messages'
import { CitationReferences } from './citation-references'
import { useIsMobile } from '@/hooks/use-mobile'
import { FilePreview } from './file-preview'

interface ChatMessageProps {
  message: DisplayMessage
  showRetrieverResources?: boolean
  showSuggestedQuestions?: boolean
  suggestedQuestions?: string[]
}

export function ChatMessage({ message: { id, role, content, retrieverResources, files }, showRetrieverResources = false}: ChatMessageProps) {
  const { resolvedTheme } = useTheme()
  const isMobile = useIsMobile()
  const { userId, regenerateMessage } = useChat()
  const [processedContent, setProcessedContent] = useState<{ thinking: string | null; mainContent: string }>({
    thinking: null,
    mainContent: content
  })
  const [isThinkingOpen, setIsThinkingOpen] = useState(true)
  const [isCopied, setIsCopied] = useState(false)
  const [feedback, setFeedback] = useState<'like' | 'dislike' | null>(null)
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false)
  const [isRegenerating, setIsRegenerating] = useState(false)

  // 根据当前主题选择代码高亮样式
  const codeTheme = resolvedTheme === 'dark' ? vscDarkPlus : materialLight

  // 处理思考过程内容
  useEffect(() => {
    if (role === 'assistant') {
      // 检查是否包含思考过程的开始标签
      const hasOpeningTag = content.includes('<details')

      // 检查是否包含完整的思考过程（开始和结束标签）
      const hasClosingTag = content.includes('</details>')

      if (hasOpeningTag) {
        let thinkingContent = null
        let mainContent = ''

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
              thinkingContent = detailsContent.substring(summaryEndIndex + '</summary>'.length).trim()
            } else {
              // 没有 summary 标签或者 summary 标签不完整
              const openTagEndIndex = detailsContent.indexOf('>')
              if (openTagEndIndex !== -1) {
                thinkingContent = detailsContent.substring(openTagEndIndex + 1).trim()
              } else {
                thinkingContent = '思考中...'
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

  // 复制消息内容
  const copyMessageContent = async () => {
    try {
      // 复制主要内容，不包括思考过程
      await navigator.clipboard.writeText(processedContent.mainContent || content)
      setIsCopied(true)
      toast.success('已复制到剪贴板')

      // 3秒后重置复制状态
      setTimeout(() => {
        setIsCopied(false)
      }, 3000)
    } catch (error) {
      console.error('复制失败:', error)
      toast.error('复制失败')
    }
  }

  // 提交反馈（点赞/点踩）
  const handleFeedback = async (rating: 'like' | 'dislike' | null) => {
    // 如果是用户消息或者正在提交反馈，则不处理
    if (role === 'user' || isSubmittingFeedback || !userId) return

    // 如果点击的是当前已选择的反馈，则取消反馈
    const newRating = rating === feedback ? null : rating

    // 提取消息ID（去掉前缀）
    const messageId = id.replace('-assistant', '')

    setIsSubmittingFeedback(true)

    try {
      await submitMessageFeedback({
        messageId,
        rating: newRating,
        userId,
        content: newRating === 'like' ? '有帮助' : newRating === 'dislike' ? '没有帮助' : ''
      })

      // 更新反馈状态
      setFeedback(newRating)

      // 显示提示
      if (newRating === 'like') {
        toast.success('感谢您的反馈！')
      } else if (newRating === 'dislike') {
        toast.success('感谢您的反馈，我们会继续改进')
      } else {
        toast.success('已撤销反馈')
      }
    } catch (error) {
      console.error('提交反馈失败:', error)
      toast.error('提交反馈失败')
    } finally {
      setIsSubmittingFeedback(false)
    }
  }

  // 重新生成回答
  const handleRegenerate = async () => {
    if (isRegenerating || role !== 'assistant') return

    setIsRegenerating(true)
    try {
      await regenerateMessage(id)
    } catch (error) {
      console.error('重新生成失败:', error)
    } finally {
      setIsRegenerating(false)
    }
  }

  return (
    <div className="flex flex-col items-center w-full max-w-3xl text-sm">
      <div className={cn('flex flex-col w-full mb-2', role === 'user' ? 'items-end' : 'items-start')}>
        <div
          className={cn(
            'group relative flex py-2 rounded-xl',
            role === 'user' ? 'bg-sky-600/10 px-3' : 'bg-background w-full'
          )}
        >
          <div
            className={cn(
              'opacity-0 group-hover:opacity-100 absolute transition-all',
              role === 'user' ? '-left-8 top-2' : 'left-12 -bottom-6'
            )}
          >
            <div className="flex items-center opacity-70 gap-2">
              {role === 'user' ? (
                <div className="flex items-center gap-2">
                  <button
                    onClick={copyMessageContent}
                    className="flex items-center justify-center w-6 h-6 rounded-sm hover:bg-primary/20 p-1 duration-200 transition-all"
                    title="复制"
                  >
                    {isCopied ? <CheckIcon className="w-4 h-4 text-green-500" /> : <CopyIcon className="w-4 h-4" />}
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={copyMessageContent}
                    className="flex items-center justify-center w-6 h-6 rounded-sm hover:bg-primary/20 p-1 duration-200 transition-all"
                    title="复制"
                  >
                    {isCopied ? <CheckIcon className="w-4 h-4 text-green-500" /> : <CopyIcon className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={handleRegenerate}
                    className={cn(
                      "flex items-center justify-center w-6 h-6 rounded-sm hover:bg-primary/20 p-1 duration-200 transition-all",
                      isRegenerating && "animate-spin text-primary"
                    )}
                    title="重新生成"
                    disabled={isRegenerating}
                  >
                    <RefreshCwIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleFeedback('like')}
                    className={cn(
                      'flex items-center justify-center w-6 h-6 rounded-sm hover:bg-primary/20 p-1 duration-200 transition-all',
                      feedback === 'like' && 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
                    )}
                    title="有帮助"
                    disabled={isSubmittingFeedback}
                  >
                    <ThumbsUpIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleFeedback('dislike')}
                    className={cn(
                      'flex items-center justify-center w-6 h-6 rounded-sm hover:bg-primary/20 p-1 duration-200 transition-all',
                      feedback === 'dislike' && 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                    )}
                    title="没有帮助"
                    disabled={isSubmittingFeedback}
                  >
                    <ThumbsDownIcon className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {role === 'user' ? (
            <div className="max-w-prose">
              {files && files.length > 0 && (<FilePreview inputPreview={true} inputFiles={files} />)}
              <Markdown>{content}</Markdown>
            </div>
          ) : (
            <div className="flex items-start w-full gap-3">
              <div className="h-10 w-10 p-1 border-2 border-primary/90 rounded-full shrink-0 flex items-center justify-center bg-primary/10">
                <Bot className="h-6 w-6 text-primary" />
              </div>
              <div className={cn("prose prose-sm dark:prose-invert prose-pre:border-0 prose-pre:bg-transparent", isMobile ? 'pr-14' : 'pr-0')}>
                {/* 思考过程部分 - 使用 Collapsible 组件 */}
                {processedContent.thinking && (
                  <div className="pt-2 px-2 bg-muted/50 rounded-md border border-muted-foreground/20 w-full">
                    <Collapsible open={isThinkingOpen} onOpenChange={setIsThinkingOpen} className="mb-3">
                      <div className="flex items-center gap-2 mb-1 w-full">
                        <CollapsibleTrigger asChild>
                          <Button variant="ghost" size="sm" className="p-0 h-6 hover:bg-transparent">
                            {isThinkingOpen ? (
                              <ChevronUpIcon className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <ChevronDownIcon className="h-4 w-4 text-muted-foreground" />
                            )}
                            <span className="text-xs text-muted-foreground font-medium">
                              思考过程 {isThinkingOpen ? '(点击折叠)' : '(点击展开)'}
                            </span>
                          </Button>
                        </CollapsibleTrigger>
                      </div>

                      <CollapsibleContent>
                        <div className="text-sm text-muted-foreground whitespace-pre-wrap">
                          {processedContent.thinking}
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  </div>
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
                            <div className="rounded-md overflow-hidden shadow-sm w-full">
                              <SyntaxHighlighter
                                style={codeTheme}
                                language={match[1]}
                                PreTag="div"
                                wrapLines={true}
                                customStyle={{
                                  width: '100%', // 设置宽度为100%以填充父元素的宽度
                                  margin: 0,
                                  padding: '0.5rem',
                                  borderRadius: '0.5rem',
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

                {/* 引用内容部分 */}
                {showRetrieverResources && retrieverResources && retrieverResources.length > 0 && <CitationReferences resources={retrieverResources} />}                
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
