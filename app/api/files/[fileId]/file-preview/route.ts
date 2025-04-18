import { NextRequest, NextResponse } from 'next/server'

// 标记此路由为动态路由，不进行静态生成
export const dynamic = 'force-dynamic'

export async function GET(
  req: NextRequest,
  { params }: { params: { fileId: string } }
) {
  try {
    const fileId = params.fileId
    
    if (!fileId) {
      return NextResponse.json({ error: '文件ID不能为空' }, { status: 400 })
    }

    const baseURL = process.env.CHAT_API_BASE_URL
    if (!baseURL) {
      return NextResponse.json({ error: 'API基础URL未配置' }, { status: 500 })
    }
    
    // 从请求URL中获取查询参数
    const timestamp = req.nextUrl.searchParams.get('timestamp')
    const nonce = req.nextUrl.searchParams.get('nonce')
    const sign = req.nextUrl.searchParams.get('sign')

    // 构建预览URL
    const previewUrl = `${baseURL.replace('/v1', '')}/files/${fileId}/file-preview?timestamp=${timestamp}&nonce=${nonce}&sign=${sign}`
    
    const response = await fetch(previewUrl, {
      headers: {
        // 如果需要，可以添加认证头
        'Authorization': `Bearer ${process.env.CHAT_API_KEY}`
      }
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('文件预览获取失败:', response.status, errorText)
      return NextResponse.json(
        { error: `获取文件预览失败: ${response.status}` },
        { status: response.status }
      )
    }
    
    // 获取内容类型
    const contentType = response.headers.get('content-type') || 'application/octet-stream'
    
    // 获取文件内容
    const fileData = await response.arrayBuffer()
    
    // 返回文件内容
    return new NextResponse(fileData, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400',
      },
    })
  } catch (error) {
    console.error('文件预览获取失败:', error)
    return NextResponse.json({ error: '获取文件预览失败' }, { status: 500 })
  }
}