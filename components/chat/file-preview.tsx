import React from 'react'
import { X, FileText, FileSpreadsheet, FileAudio, FileVideo, Image as ImageIcon } from 'lucide-react'
import { UploadedFileResponse } from '@/services/types/common'
import { MessageFile } from '@/types/message'

interface RenderFile {
  extension: string
  name: string
  url: string
  size: number
  id: string
}

interface FilePreviewProps {
  files?: UploadedFileResponse[]
  onRemove?: (fileId: string) => void
  disabled?: boolean
  inputPreview?: boolean
  inputFiles?: MessageFile[]
}

export function FilePreview({
  files = [],
  onRemove,
  disabled = false,
  inputPreview = false,
  inputFiles = []
}: FilePreviewProps) {
  if (!files || !inputFiles) return null

  // 获取文件图标和颜色
  const getFileIconAndColor = (file: RenderFile): { icon: React.ReactNode; color: string; fileType: string } => {
    const extension = file.extension.toLowerCase()

    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(extension)) {
      return { icon: <ImageIcon className="h-4 w-4" />, color: 'text-blue-500', fileType: 'image' }
    } else if (['pdf'].includes(extension)) {
      return { icon: <FileText className="h-4 w-4" />, color: 'text-red-500', fileType: 'pdf' }
    } else if (['xlsx', 'xls', 'csv'].includes(extension)) {
      return { icon: <FileSpreadsheet className="h-4 w-4" />, color: 'text-green-500', fileType: 'spreadsheet'}
    } else if (['mp3', 'wav', 'm4a', 'ogg', 'webm', 'amr'].includes(extension)) {
      return { icon: <FileAudio className="h-4 w-4" />, color: 'text-purple-500', fileType: 'audio' }
    } else if (['mp4', 'mov', 'avi', 'webm', 'mpeg', 'mpga'].includes(extension)) {
      return { icon: <FileVideo className="h-4 w-4" />, color: 'text-orange-500', fileType: 'video'}
    } else {
      return { icon: <FileText className="h-4 w-4" />, color: 'text-gray-500', fileType: 'other'}
    }
  }

  // 格式化文件大小
  const formatFileSize = (size: number) => {
    if (size < 1024) {
      return `${size}B`
    } else if (size < 1024 * 1024) {
      return `${(size / 1024).toFixed(2)}KB`
    } else {
      return `${(size / (1024 * 1024)).toFixed(2)}MB`
    }
  }

  let renderFiles: RenderFile[] = []
  if (inputPreview && inputFiles && inputFiles.length > 0) {
    renderFiles = inputFiles.map(file => ({
      extension: file.filename.split('.')[1] || '',
      name: file.filename,
      url: file.url,
      size: file.size,
      id: file.id
    }))
  } else {
    renderFiles = files.map(file => ({
      extension: file.extension,
      name: file.name,
      url: file.url || '',
      size: file.size,
      id: file.id
    }))
  }

  return (
    <div className="flex flex-wrap gap-2">
      {renderFiles.map(file => {
        const { icon, color, fileType } = getFileIconAndColor(file)
        const isImage = fileType === 'image'

        return (
          <div
            key={file.id}
            className="group flex flex-col border border-accent rounded-md bg-background shadow-sm relative cursor-pointer"
            style={{ width: isImage ? '74px' : '144px', height: '74px' }}
          >
            {!inputPreview && !disabled && (
              <button
                type="button"
                onClick={() => onRemove && onRemove(file.id)}
                className="bg-background border border-accent rounded-full shadow-md p-1 absolute -top-2.5 -right-2.5 opacity-0 group-hover:opacity-100 transition duration-200 text-muted-foreground hover:text-foreground flex-shrink-0"
                disabled={disabled}
              >
                <X className="h-4 w-4" />
              </button>
            )}
            {/* 文件预览区域 */}
            {isImage ? (
              <div className="w-full flex items-center justify-center overflow-hidden h-full">
                <img
                  src={file.url}
                  alt={file.name}
                  className="max-w-full max-h-full object-contain rounded-md"
                  onError={e => {
                    e.currentTarget.style.display = 'none'
                    const parent = e.currentTarget.parentElement
                    if (parent) {
                      const fallback = document.createElement('div')
                      fallback.className = 'flex flex-col items-center justify-center h-full w-full'

                      // 创建图标元素
                      const iconElement = document.createElement('div')
                      iconElement.className = color

                      // 创建文件扩展名元素
                      const extensionElement = document.createElement('span')
                      extensionElement.className = 'text-xs mt-1 uppercase font-semibold text-muted-foreground'
                      extensionElement.textContent = file.extension

                      // 将图标和扩展名添加到fallback元素中
                      fallback.appendChild(iconElement)
                      fallback.appendChild(extensionElement)

                      // 将fallback添加到父元素中
                      parent.appendChild(fallback)

                      // 使用更安全的方式渲染图标
                      // 由于无法直接在DOM中渲染React组件，我们可以使用一个简单的SVG或文本替代
                      iconElement.innerHTML = '📄'
                    }
                  }}
                />
              </div>
            ) : (
              <div className="w-full p-2 overflow-hidden h-full">
                <div className="flex flex-col h-full justify-between">
                    <p
                      className="text-xs font-medium line-clamp-2"
                      title={file.name}
                      style={{ wordBreak: 'break-word' }}
                    >
                      {file.name}
                    </p>
                    <div className="flex items-center justify-between mt-1">
                      <span className={`text-xs ${color} flex items-center`}>
                        {icon}
                        <span className="ml-1">{file.extension.toUpperCase()}</span>
                      </span>
                      <span className="text-xs text-muted-foreground ml-2">{formatFileSize(file.size)}</span>
                    </div>
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}