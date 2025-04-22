import { NextRequest, NextResponse } from 'next/server'
import { getAppInfo } from '@/services/server/app-info'

// 标记此路由为动态路由，不进行静态生成
export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    // 从请求中获取应用ID
    const appId = req.nextUrl.searchParams.get('appId') || ''
    // 调用服务器端API获取应用信息
    const appInfo = await getAppInfo(appId)

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