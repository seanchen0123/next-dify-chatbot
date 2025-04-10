import { NextRequest, NextResponse } from 'next/server'
import { deleteConversation } from '@/services/server/conversations'

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const conversationId = params.id
    // 解析请求体
    const body = await request.json()
    const { userId } = body

    if (!userId) {
      return NextResponse.json({ error: '缺少 userId 参数' }, { status: 400 })
    }

    await deleteConversation({
      userId,
      conversationId
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('API 路由删除会话失败:', error)
    return NextResponse.json({ error: '删除会话失败' }, { status: 500 })
  }
}
