import { AppParametersResponse, FileUploadConfig } from '@/services/types/common'

// 文件类型到扩展名的映射
const fileTypeExtensionsMap: Record<string, string[]> = {
  image: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'],
  document: ['txt', 'md', 'markdown', 'pdf', 'html', 'xlsx', 'xls', 'docx', 'csv', 'eml', 'msg', 'pptx', 'ppt', 'xml', 'epub'],
  audio: ['mp3', 'm4a', 'wav', 'webm', 'amr'],
  video: ['mp4', 'mov', 'mpeg', 'mpga']
}

// 从文件扩展名确定文件类型
export function getFileTypeFromExtension(extension: string): string {
  const ext = extension.toLowerCase().replace('.', '')
  
  for (const [type, extensions] of Object.entries(fileTypeExtensionsMap)) {
    if (extensions.includes(ext)) {
      return type
    }
  }
  
  return 'custom'
}

// 从AppParameters生成文件上传配置
export function generateFileUploadConfig(appParams?: AppParametersResponse): FileUploadConfig {
  if (!appParams || !appParams.file_upload) {
    // 默认配置
    return {
      enabled: false,
      allowedTypes: [],
      allowedExtensions: [],
      maxFiles: 0,
      maxSizeInMB: {
        default: 10,
        image: 10,
        audio: 50,
        video: 100,
        document: 15
      },
      acceptString: ''
    }
  }
  
  const { file_upload } = appParams
  
  // 获取允许的文件扩展名
  let allowedExtensions: string[] = file_upload.allowed_file_extensions || []
  
  // 如果没有明确指定扩展名，则根据允许的文件类型生成
  if (allowedExtensions.length === 0 && file_upload.allowed_file_types) {
    file_upload.allowed_file_types.forEach(type => {
      if (fileTypeExtensionsMap[type]) {
        allowedExtensions = [...allowedExtensions, ...fileTypeExtensionsMap[type]]
      }
    })
  }
  
  // 生成accept字符串，用于文件输入框
  const acceptString = allowedExtensions.map(ext => `.${ext}`).join(',')
  
  return {
    enabled: file_upload.enabled,
    allowedTypes: file_upload.allowed_file_types || [],
    allowedExtensions,
    maxFiles: file_upload.number_limits || 1,
    maxSizeInMB: {
      default: file_upload.fileUploadConfig?.file_size_limit || 10,
      image: file_upload.fileUploadConfig?.image_file_size_limit || 10,
      audio: file_upload.fileUploadConfig?.audio_file_size_limit || 50,
      video: file_upload.fileUploadConfig?.video_file_size_limit || 100,
      document: file_upload.fileUploadConfig?.file_size_limit || 15
    },
    acceptString
  }
}

// 获取文件大小限制（MB）
export function getFileSizeLimit(fileType: string, config: FileUploadConfig): number {
  switch (fileType) {
    case 'image':
      return config.maxSizeInMB.image
    case 'audio':
      return config.maxSizeInMB.audio
    case 'video':
      return config.maxSizeInMB.video
    case 'document':
      return config.maxSizeInMB.document
    default:
      return config.maxSizeInMB.default
  }
}

// 检查文件是否符合上传要求
export function validateFile(file: File, config: FileUploadConfig): { valid: boolean; error?: string } {
  if (!config.enabled) {
    return { valid: false, error: '文件上传功能未启用' }
  }
  
  // 检查文件扩展名
  const extension = file.name.split('.').pop()?.toLowerCase() || ''
  if (config.allowedExtensions.length > 0 && !config.allowedExtensions.includes(extension)) {
    return { valid: false, error: `不支持的文件类型，请上传 ${config.allowedExtensions.join(', ')} 格式的文件` }
  }
  
  // 检查文件类型
  const fileType = getFileTypeFromExtension(extension)
  if (config.allowedTypes.length > 0 && !config.allowedTypes.includes(fileType)) {
    return { valid: false, error: `不支持的文件类型，请上传 ${config.allowedTypes.join(', ')} 类型的文件` }
  }
  
  // 检查文件大小
  const sizeLimit = getFileSizeLimit(fileType, config) * 1024 * 1024 // 转换为字节
  if (file.size > sizeLimit) {
    return { valid: false, error: `文件过大，${fileType} 类型文件大小不能超过 ${getFileSizeLimit(fileType, config)}MB` }
  }
  
  return { valid: true }
}

export function isBase64ImageUrl(url: string): boolean {
  return /^data:image\/[a-z]+;base64,/.test(url);
}

// 使用正则表达式替换所有匹配的文件预览URL
export function replacePreviewUrl(content: string): string {
  // 匹配 /files/{fileId}/file-preview 格式的URL
  const regex = /\/files\/([a-zA-Z0-9-]+)\/file-preview(\?[^"'\s]+)/g
  return content.replace(regex, '/api/files/$1/file-preview$2')
}