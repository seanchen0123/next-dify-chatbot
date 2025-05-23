import {
  Bot,
  CopyIcon,
  RefreshCwIcon,
  ThumbsUpIcon,
  ThumbsDownIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  CheckIcon,
  PlayIcon,
  PauseIcon,
  VolumeXIcon,
  Loader2,
  BarChart,
  AlertCircle
} from 'lucide-react'
import { cn, isValidEChartsOption, removeMarkdownLinks } from '@/lib/utils'
import { Button } from '../ui/button'
import Markdown, { Components, Options } from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/cjs/styles/prism'
import { materialLight } from 'react-syntax-highlighter/dist/cjs/styles/prism'
import { useState, useEffect, useRef, useMemo, memo } from 'react'
import { useTheme } from 'next-themes'
import { DisplayMessage } from '@/types/message'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { toast } from '@/components/ui/custom-toast'
import { submitMessageFeedback } from '@/services/client/messages'
import { CitationReferences } from './citation-references'
import { useIsMobile } from '@/hooks/use-mobile'
import { FilePreview } from './file-preview'
import { MemoizedEChartsRenderer } from './echarts-renderer'

interface ChatMessageProps {
  appId: string
  userId: string
  message: DisplayMessage
  showRetrieverResources?: boolean
  tts?: boolean
  generateLoading?: boolean
  regenerateMessage: (messageId: string) => Promise<void>
  textToSpeech?: (messageId?: string, text?: string) => Promise<string | null>
}

export function ChatMessageComponent({
  appId,
  userId,
  message: { id, role, content, retrieverResources, files },
  showRetrieverResources = false,
  tts = false,
  regenerateMessage,
  textToSpeech,
  generateLoading
}: ChatMessageProps) {
  const { resolvedTheme } = useTheme()
  const isMobile = useIsMobile()
  const [processedContent, setProcessedContent] = useState<{ thinking: string | null; mainContent: string }>({
    thinking: null,
    mainContent: content
  })
  const [isThinkingOpen, setIsThinkingOpen] = useState(true)
  const [isCopied, setIsCopied] = useState(false)
  const [feedback, setFeedback] = useState<'like' | 'dislike' | null>(null)
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false)
  const [isRegenerating, setIsRegenerating] = useState(false)
  // 添加代码块复制状态
  const [copiedCodeBlock, setCopiedCodeBlock] = useState<string | null>(null)

  // 使用 useRef 创建音频引用
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // 添加语音播放相关状态
  const [ttsLoading, setTtsLoading] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [audioError, setAudioError] = useState(false)
  // 添加音频缓存
  const audioCache = useRef<Map<string, string>>(new Map())

  // 根据当前主题选择代码高亮样式
  const codeTheme = resolvedTheme === 'dark' ? vscDarkPlus : materialLight

  // 处理思考过程内容
  useEffect(() => {
    if (role === 'assistant') {
      let thinkingContent: string | null = null
      let mainContent = content
      let processed = false // 标记是否已处理

      // 1. 检查 <think> 标签
      const thinkStartTag = '<think>'
      const thinkEndTag = '</think>'
      const thinkStartIndex = content.indexOf(thinkStartTag)
      const thinkEndIndex = content.indexOf(thinkEndTag)

      if (thinkStartIndex !== -1) {
        if (thinkEndIndex !== -1 && thinkEndIndex > thinkStartIndex) {
          // 找到完整的 <think>...</think>
          thinkingContent = content.substring(thinkStartIndex + thinkStartTag.length, thinkEndIndex).trim()
          mainContent = content.substring(thinkEndIndex + thinkEndTag.length).trim()
        } else {
          // 只有开始标签 <think>
          thinkingContent = content.substring(thinkStartIndex + thinkStartTag.length).trim()
          mainContent = '' // 假设开始标签后的所有内容都是思考过程，直到流结束
        }
        processed = true
      }

      // 2. 如果没有处理过 <think> 标签，则检查 <details> 标签 (现有逻辑)
      if (!processed) {
        const detailsStartTag = '<details' // 使用 '<details' 以匹配可能带属性的标签
        const detailsEndTag = '</details>'
        const detailsStartIndex = content.indexOf(detailsStartTag)
        const detailsEndIndex = content.indexOf(detailsEndTag)

        if (detailsStartIndex !== -1) {
          if (detailsEndIndex !== -1 && detailsEndIndex > detailsStartIndex) {
            // 完整的 <details>...</details>
            const detailsFullTagEndIndex = detailsEndIndex + detailsEndTag.length
            const detailsContent = content.substring(detailsStartIndex, detailsFullTagEndIndex)

            const summaryEndTag = '</summary>'
            const summaryEndIndex = detailsContent.indexOf(summaryEndTag)

            if (summaryEndIndex !== -1) {
              thinkingContent = detailsContent
                .substring(summaryEndIndex + summaryEndTag.length, detailsContent.length - detailsEndTag.length)
                .trim()
            } else {
              // 没有 summary 标签，直接提取 details 内容
              const openingTagEndIndex = detailsContent.indexOf('>')
              if (openingTagEndIndex !== -1) {
                thinkingContent = detailsContent
                  .substring(openingTagEndIndex + 1, detailsContent.length - detailsEndTag.length)
                  .trim()
              }
            }
            mainContent = content.substring(detailsFullTagEndIndex).trim()
          } else {
            // 不完整的 <details> 过程（只有开始标签）
            const detailsContent = content.substring(detailsStartIndex)
            const summaryEndTag = '</summary>'
            const summaryEndIndex = detailsContent.indexOf(summaryEndTag)

            if (summaryEndIndex !== -1) {
              thinkingContent = detailsContent.substring(summaryEndIndex + summaryEndTag.length).trim()
            } else {
              const openingTagEndIndex = detailsContent.indexOf('>')
              if (openingTagEndIndex !== -1) {
                thinkingContent = detailsContent.substring(openingTagEndIndex + 1).trim()
              } else {
                // 如果连 '>' 都找不到，可能标签不完整
                thinkingContent = '思考中...' // 或者取 <details 之后的所有内容
              }
            }
            mainContent = '' // 假设开始标签后的所有内容都是思考过程
          }
          processed = true
        }
      }

      // 更新状态
      setProcessedContent({
        thinking: thinkingContent,
        mainContent: mainContent
      })
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

  // 复制代码块内容
  const copyCodeBlock = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code)
      setCopiedCodeBlock(code)
      toast.success('代码已复制到剪贴板')

      // 3秒后重置复制状态
      setTimeout(() => {
        setCopiedCodeBlock(null)
      }, 3000)
    } catch (error) {
      console.error('复制代码失败:', error)
      toast.error('复制代码失败')
    }
  }

  // 提交反馈（点赞/点踩）
  const handleFeedback = async (rating: 'like' | 'dislike' | null) => {
    // 如果是用户消息或者正在提交反馈，则不处理
    if (role === 'user' || isSubmittingFeedback || !userId) return

    // 如果点击的是当前已选择的反馈，则取消反馈
    const newRating = rating === feedback ? null : rating

    // 提取消息ID（去掉后缀）
    const messageId = id.replace('-assistant', '')

    setIsSubmittingFeedback(true)

    try {
      await submitMessageFeedback({
        messageId,
        rating: newRating,
        userId,
        content: newRating === 'like' ? '有帮助' : newRating === 'dislike' ? '没有帮助' : '',
        appId
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

  // 处理语音播放
  const handleTextToSpeech = async () => {
    if (role !== 'assistant' || !textToSpeech) return
    try {
      // 如果已经在播放，则暂停
      if (isPlaying && audioRef.current) {
        audioRef.current.pause()
        setIsPlaying(false)
        return
      }

      // 提取消息ID（去掉后缀）
      const messageId = id.replace('-assistant', '')
      // 检查缓存中是否已有此消息的音频
      let url = audioCache.current.get(messageId) || null

      // 如果已经有音频URL但没有播放，则继续播放
      if (audioRef.current && url) {
        try {
          // 确保src是最新的
          if (audioRef.current.src !== url) {
            audioRef.current.src = url
          }

          await audioRef.current.play()
          setIsPlaying(true)
        } catch (error) {
          console.error('播放音频失败:', error)
          setAudioError(true)
          toast.error('音频播放失败')
        }
        return
      }

      // 否则，生成新的语音
      setAudioError(false)

      // 如果缓存中没有，则调用API生成
      if (!url) {
        try {
          setTtsLoading(true)
          const noLinksContent = removeMarkdownLinks(processedContent.mainContent)
          // 这里将messageId设置为空字符串，这样TTS会按text的内容来生成音频
          url = await textToSpeech('', noLinksContent)
        } catch {
          throw new Error('请求TTS接口失败')
        } finally {
          setTtsLoading(false)
        }

        if (!url) {
          throw new Error('生成语音失败')
        }

        // 将URL添加到缓存
        audioCache.current.set(messageId, url)
      }

      // 如果audioRef还没有关联到元素，创建一个新的
      if (!audioRef.current) {
        const audio = new Audio()
        audio.src = url

        // 设置音频事件
        audio.onplay = () => setIsPlaying(true)
        audio.onpause = () => setIsPlaying(false)
        audio.onended = () => {
          setIsPlaying(false)
        }
        audio.onerror = e => {
          console.error('音频错误:', e)
          setAudioError(true)
          setIsPlaying(false)
          toast.error('音频播放失败')
        }

        audioRef.current = audio
      }
      audioRef.current.src = url

      // 开始播放
      try {
        await audioRef.current.play()
        setIsPlaying(true)
      } catch (error) {
        console.error('播放音频失败:', error)
        setAudioError(true)
        toast.error('音频播放失败')
      }
    } catch (error) {
      console.error('语音播放失败:', error)
      setAudioError(true)
      toast.error('语音生成失败')
    }
  }

  // 组件卸载时清理资源
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
      }
      // 组件卸载时清理所有缓存的URL
      audioCache.current.forEach(url => {
        if (url.startsWith('blob:')) {
          URL.revokeObjectURL(url)
        }
      })
    }
  }, [])

  const renderCodeBlock = useMemo(() => {
    const CodeBlock: Components['code'] = ({ node, className, children, ...props }) => {
      // 检查是否是代码块（通过className判断）
      const match = /language-(\w+)/.exec(className || '')
      const codeContent = String(children).replace(/\n$/, '')

      // 检查是否是echarts代码块
      if (match && match[1] === 'echarts') {
        if (isValidEChartsOption(codeContent)) {
          // 如果能正常解析成json文件，则渲染图表
          const options = JSON.parse(codeContent)
          // 渲染图表
          return (
            <div className="w-full">
              <div className="flex items-center justify-between mb-2 bg-muted/50 shadow-sm p-2 rounded-md">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <BarChart className="w-4 h-4" />
                  <span>ECharts图表</span>
                </div>
                <button
                  onClick={() => copyCodeBlock(codeContent)}
                  className="flex items-center justify-center w-8 h-8 rounded-md bg-primary/10 hover:bg-primary/20 duration-200 text-primary"
                  title="复制配置"
                >
                  <CopyIcon className="w-4 h-4" />
                </button>
              </div>
              <MemoizedEChartsRenderer
                options={options}
                height={400}
                className="border border-muted-foreground/20 rounded-md"
              />
            </div>
          )
        } else {
          if (!generateLoading) {
            // 如果生成完成后仍然无法解析，则显示错误提示
            return (
              <div className="w-full">
                <div className="flex items-center justify-between mb-2 bg-muted/50 shadow-sm p-2 rounded-md">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <BarChart className="w-4 h-4" />
                    <span>ECharts图表</span>
                  </div>
                  <button
                    onClick={() => copyCodeBlock(codeContent)}
                    className="flex items-center justify-center w-8 h-8 rounded-md bg-primary/10 hover:bg-primary/20 duration-200 text-primary"
                    title="复制配置"
                  >
                    <CopyIcon className="w-4 h-4" />
                  </button>
                </div>
                <div
                  className={`relative flex flex-col items-center justify-center border border-red-300 bg-red-50 dark:bg-red-950/20 rounded-md p-4`}
                  style={{ width: '100%', height: '180px' }}
                >
                  <AlertCircle className="w-8 h-8 text-red-500 mb-2" />
                  <p className="text-red-600 dark:text-red-400 text-sm font-medium">图表渲染失败</p>
                  <p className="text-red-500/70 dark:text-red-400/70 text-xs mt-1">
                    请检查图表配置是否正确
                  </p>
                </div>
              </div>
            )
          } else {
            // 如果正在生成中，则显示loading
            return (
              <div className="my-4 w-full">
                <div className="p-2 flex items-center justify-center gap-1 text-xs text-primary bg-muted/50 shadow-md">
                  <BarChart className="w-4 h-4" />
                  <span>正在生成ECharts配置...</span>
                </div>
              </div>
            )
          }
        }
      }

      // 如果有language-前缀，说明是代码块，否则是行内代码
      if (match) {
        // 检查代码是否只有一行（不包含换行符）
        const isSingleLine = !codeContent.includes('\n');
        return (
          <div className="rounded-md overflow-hidden shadow-sm w-full relative">
            {/* 添加复制按钮 */}
            <div className="absolute top-2 right-2 z-10">
              <button
                onClick={() => copyCodeBlock(codeContent)}
                className="flex items-center justify-center w-8 h-8 rounded-md bg-primary/10 hover:bg-primary/20 transition-colors duration-200"
                title="复制代码"
              >
                <CopyIcon className="w-4 h-4 text-primary" />
              </button>
            </div>
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
                minHeight: isSingleLine ? '3rem' : 'auto'
              }}
            >
              {codeContent}
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
    return CodeBlock
  }, [codeTheme])

  return (
    <div className="flex flex-col items-center w-full max-w-3xl text-sm">
      <div className={cn('flex flex-col w-full mb-2', role === 'user' ? 'items-end pl-12' : 'items-start')}>
        <div
          className={cn(
            'group relative flex py-2 rounded-xl max-w-[90ch]',
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
                  {/* 添加语音播放按钮 */}
                  {tts && (
                    <button
                      onClick={handleTextToSpeech}
                      className={cn(
                        'flex items-center justify-center w-6 h-6 rounded-sm hover:bg-primary/20 p-1 duration-200 transition-all',
                        isPlaying && 'bg-primary/20 text-primary',
                        audioError && 'text-red-500'
                      )}
                      title={isPlaying ? '暂停播放' : ttsLoading ? '生成语音中...' : '播放语音'}
                      disabled={isRegenerating || ttsLoading}
                    >
                      {audioError ? (
                        <VolumeXIcon className="w-4 h-4" />
                      ) : ttsLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin text-primary" />
                      ) : isPlaying ? (
                        <PauseIcon className="w-4 h-4" />
                      ) : (
                        <PlayIcon className="w-4 h-4" />
                      )}
                    </button>
                  )}
                  <button
                    onClick={handleRegenerate}
                    className={cn(
                      'flex items-center justify-center w-6 h-6 rounded-sm hover:bg-primary/20 p-1 duration-200 transition-all',
                      isRegenerating && 'animate-spin text-primary'
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
            <div className='w-full' >
              {files && files.length > 0 && <FilePreview inputPreview={true} inputFiles={files} />}
              {content}
            </div>
          ) : (
            <div className="flex items-start w-full gap-3">
              <div className="h-10 w-10 p-1 border-2 border-primary/90 rounded-full shrink-0 flex items-center justify-center bg-primary/10">
                <Bot className="h-6 w-6 text-primary" />
              </div>
              <div className='prose prose-sm dark:prose-invert prose-pre:border-0 prose-pre:bg-transparent flex-1 min-w-0'>
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
                      // 虽然缓存了chat-message组件，但每次交互都会重新渲染，所以这里需要缓存code组件
                      code: renderCodeBlock
                    }}
                  >
                    {processedContent.mainContent}
                  </Markdown>
                )}

                {/* 引用内容部分 */}
                {showRetrieverResources && retrieverResources && retrieverResources.length > 0 && (
                  <CitationReferences resources={retrieverResources} />
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// 使用 memo 包装组件并导出
export const ChatMessage = memo(ChatMessageComponent, (prevProps, nextProps) => {
  // 只有在以下情况下才重新渲染:
  // 1. 消息内容变化
  // 2. 消息ID变化
  // 3. 重要的交互状态变化 (如 showRetrieverResources, tts)
  // 4. generateLoading 从 true 变为 false (消息生成完成)

  const prevMessage = prevProps.message
  const nextMessage = nextProps.message

  // 检查消息基本属性是否变化
  const messageChanged =
    prevMessage.id !== nextMessage.id ||
    prevMessage.content !== nextMessage.content ||
    prevMessage.role !== nextMessage.role

  // 检查文件是否变化
  const filesChanged = JSON.stringify(prevMessage.files) !== JSON.stringify(nextMessage.files)

  // 检查引用资源是否变化
  const resourcesChanged =
    JSON.stringify(prevMessage.retrieverResources) !== JSON.stringify(nextMessage.retrieverResources)

  // 检查功能开关是否变化
  const featuresChanged =
    prevProps.showRetrieverResources !== nextProps.showRetrieverResources || prevProps.tts !== nextProps.tts

  // 特殊处理 generateLoading:
  // 只有当 generateLoading 从 true 变为 false 时才触发重新渲染
  // 这样可以在生成完成时更新 UI，但在输入时不会触发重新渲染
  const loadingChanged = prevProps.generateLoading === true && nextProps.generateLoading === false

  // 如果任何一项变化，返回 false 表示需要重新渲染
  // 否则返回 true 表示可以使用缓存的组件
  return !(messageChanged || filesChanged || resourcesChanged || featuresChanged || loadingChanged)
})
