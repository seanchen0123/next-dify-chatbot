import { NextRequest, NextResponse } from 'next/server'
import { getAppInfo } from '@/services/server/app-info'

export async function GET(req: NextRequest) {
  try {
    // 调用服务器端API获取应用信息
    const appInfo = await getAppInfo()

    // 返回应用信息
    return NextResponse.json(appInfo)
  } catch (error) {
    console.error('获取应用信息失败:', error)
    return NextResponse.json(
      { error: '获取应用信息失败' },
      { status: 500 }
    )
  }
}