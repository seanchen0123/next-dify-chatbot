import { getNextRoundSuggestions } from '@/services/server/messages'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest, { params }: { params: { messageId: string } }) {
  try {
    const { messageId } = params
    const body = await request.json()
    const { userId, appId } = body

    // 验证必要参数
    if (!messageId || !userId) {
      return NextResponse.json({ error: '缺少必要参数' }, { status: 400 })
    }

    // 调用服务端函数获取下一轮建议问题列表
    const response = await getNextRoundSuggestions({ messageId, userId, appId })

    return NextResponse.json(response)
  } catch (error) {
    console.error('处理反馈请求时出错:', error)
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 })
  }
}
