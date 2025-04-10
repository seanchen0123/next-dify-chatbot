import { NextRequest, NextResponse } from 'next/server'
import { renameConversation } from '@/services/server/conversations'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { userId, name, auto_generate } = body
    
    if (!userId) {
      return NextResponse.json(
        { error: '缺少用户ID' },
        { status: 400 }
      )
    }

    await renameConversation({
      userId,
      conversationId: params.id,
      name,
      autoGenerate: auto_generate
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('重命名会话失败:', error)
    return NextResponse.json(
      { error: '重命名会话失败' },
      { status: 500 }
    )
  }
}