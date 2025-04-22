import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Paperclip, X, Image, File, Music, Video } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Progress } from '@/components/ui/progress'
import { useApp } from '@/contexts/app-context'
import { useChat } from '@/contexts/chat-context'
import { toast } from '@/components/ui/custom-toast'
import { validateFile } from '@/lib/file-utils'

export function FileUpload() {
  const { uploadConfig } = useApp()
  const { uploadFile, uploadedFiles, uploadingFiles, clearUploadedFiles } = useChat()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // 处理文件上传
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return
    
    // 检查是否超过最大文件数
    if (uploadedFiles.length + files.length > uploadConfig.maxFiles) {
      toast.error("文件数量超限", {
        description: `最多只能上传 ${uploadConfig.maxFiles} 个文件`
      })
      return
    }
    
    // 逐个上传文件
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      
      // 验证文件
      const validation = validateFile(file, uploadConfig)
      if (!validation.valid) {
        toast.error("文件验证失败", {
          description: validation.error
        })
        continue
      }
      
      try {
        await uploadFile(file)
        toast.success("文件上传成功", {
          description: `${file.name} 已上传`,
        })
      } catch (error) {
        console.error('文件上传失败:', error)
        toast.error("文件上传失败", {
          description: "请稍后重试"
        })
      }
    }
    
    // 清空文件输入框，以便可以再次选择同一文件
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }
  
  // 如果文件上传功能未启用，则不渲染任何内容
  if (!uploadConfig.enabled) {
    return null
  }
  
  return (
    <>
      {/* 隐藏的文件输入 */}
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={handleFileUpload}
        accept={uploadConfig.acceptString}
        multiple={uploadConfig.maxFiles > 1}
        disabled={uploadingFiles || uploadedFiles.length >= uploadConfig.maxFiles}
      />
  
      {/* 文件上传进度条 */}
      {uploadingFiles && (
        <div className="px-3 pt-2">
          <Progress value={50} className="h-1" />
          <p className="text-xs text-muted-foreground mt-1">正在上传文件...</p>
        </div>
      )}
      
      {/* 上传按钮 */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              type="button" 
              size="icon" 
              variant="ghost" 
              className="h-8 w-8 rounded-full opacity-80"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingFiles || uploadedFiles.length >= uploadConfig.maxFiles}
            >
              <Paperclip className="scale-125" />
              <span className="sr-only">上传附件</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top">
            {uploadedFiles.length >= uploadConfig.maxFiles 
              ? `已达到最大文件数 (${uploadConfig.maxFiles})`
              : `上传附件 (${uploadedFiles.length}/${uploadConfig.maxFiles})`
            }
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </>
  )
}