import { createServerClient } from '@/lib/server-client'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    // 获取表单数据
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const userId = formData.get('userId') as string | null
    const appId = formData.get('appId') as string | ''

    // 验证请求参数
    if (!userId) {
      return NextResponse.json({ error: '用户标识不能为空' }, { status: 400 })
    }

    if (!file) {
      return NextResponse.json({ error: '语音文件不能为空' }, { status: 400 })
    }

    const serverClient = createServerClient(appId)

    // 验证文件类型
    const supportedFormats = ['mp3', 'mp4', 'mpeg', 'mpga', 'm4a', 'wav', 'webm']
    const fileExtension = file.name.split('.').pop()?.toLowerCase()
    
    if (!fileExtension || !supportedFormats.includes(fileExtension)) {
      return NextResponse.json({ 
        error: `不支持的文件格式，支持的格式: ${supportedFormats.join(', ')}` 
      }, { status: 400 })
    }

    // 验证文件大小 (15MB 限制)
    const maxSize = 15 * 1024 * 1024 // 15MB in bytes
    if (file.size > maxSize) {
      return NextResponse.json({ 
        error: '文件大小超过限制 (15MB)' 
      }, { status: 400 })
    }

    // 创建新的 FormData 发送到服务器
    const serverFormData = new FormData()
    serverFormData.append('file', file)
    serverFormData.append('user', userId)

    // 发送请求到后端服务
    const response = await serverClient.post('/audio-to-text', serverFormData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      }
    })
    console.log(response)

    // 返回结果
    return NextResponse.json(response.data)
  } catch (error) {
    console.error('Audio to text API error:', error)
    return NextResponse.json({ error: '语音转文字失败' }, { status: 500 })
  }
}