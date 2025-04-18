import serverClient from '@/lib/server-client'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    // 解析请求体
    const { messageId, text, userId } = await req.json()

    if (!userId) {
      return NextResponse.json({ error: '用户标识不能为空' }, { status: 400 })
    }

    if (!messageId && !text) {
      return NextResponse.json({ error: '必须提供 message_id 或 text 参数' }, { status: 400 })
    }

    const response = await serverClient.post('/text-to-audio', {
      message_id: messageId,
      text,
      user: userId
    }, {
      responseType: 'stream'
    })

    // 直接返回音频流
    return new NextResponse(response.data, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'no-cache'
      }
    })
  } catch (error) {
    console.error('Text to audio API error:', error)
    return NextResponse.json({ error: '文字转语音失败' }, { status: 500 })
  }
}