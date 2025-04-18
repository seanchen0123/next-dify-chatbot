import { NextRequest, NextResponse } from 'next/server'
import { getMessages } from '@/services/server/messages'

// 标记此路由为动态路由，不进行静态生成
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // 从 URL 参数中获取查询参数
    const searchParams = request.nextUrl.searchParams
    const conversationId = searchParams.get('conversation_id')
    const userId = searchParams.get('user')
    const firstId = searchParams.get('first_id') || undefined
    const limit = parseInt(searchParams.get('limit') || '20', 10)

    if (!conversationId) {
      return NextResponse.json({ error: '缺少会话ID参数' }, { status: 400 })
    }

    if (!userId) {
      return NextResponse.json({ error: '缺少用户ID参数' }, { status: 400 })
    }

    // 调用 API 客户端获取历史消息
    const messages = await getMessages({
      conversationId,
      userId,
      firstId,
      limit
    })

    return NextResponse.json(messages)
  } catch (error) {
    console.error('API 路由获取历史消息失败:', error)
    return NextResponse.json({ error: '获取历史消息失败' }, { status: 500 })
  }
}
