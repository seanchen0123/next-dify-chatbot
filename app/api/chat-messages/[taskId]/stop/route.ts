import { NextRequest, NextResponse } from 'next/server'
import { stopMessageGeneration } from '@/services/server/messages'

export async function POST(request: NextRequest, { params }: { params: { taskId: string } }) {
  try {
    const { taskId } = params
    const body = await request.json()
    const { userId, appId } = body

    if (!userId) {
      return NextResponse.json({ error: '缺少用户ID' }, { status: 400 })
    }

    await stopMessageGeneration({
      userId,
      taskId,
      appId
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('停止生成失败:', error)
    return NextResponse.json({ error: '停止生成失败' }, { status: 500 })
  }
}
