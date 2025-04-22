import { NextRequest, NextResponse } from 'next/server'
import { submitMessageFeedback } from '@/services/server/messages'

export async function POST(request: NextRequest, { params }: { params: { messageId: string } }) {
  try {
    const { messageId } = params
    const body = await request.json()
    const { userId, rating, content, appId } = body

    // 验证必要参数
    if (!messageId || !userId) {
      return NextResponse.json({ error: '缺少必要参数' }, { status: 400 })
    }

    // 调用服务端函数提交反馈
    await submitMessageFeedback({ messageId, rating, userId, content, appId })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('处理反馈请求时出错:', error)
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 })
  }
}
