import { NextRequest, NextResponse } from 'next/server'
import { getAppMeta } from '@/services/server/app-meta'

export async function GET(req: NextRequest) {
  try {
    // 调用服务器端API获取应用Meta信息
    const appMeta = await getAppMeta()

    // 返回应用Meta信息
    return NextResponse.json(appMeta)
  } catch (error) {
    console.error('获取应用Meta信息失败:', error)
    return NextResponse.json(
      { error: '获取应用Meta信息失败' },
      { status: 500 }
    )
  }
}