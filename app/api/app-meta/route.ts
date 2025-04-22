import { NextRequest, NextResponse } from 'next/server'
import { getAppMeta } from '@/services/server/app-meta'

// 标记此路由为动态路由，不进行静态生成
export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    // 从请求中获取应用ID
    const appId = req.nextUrl.searchParams.get('appId') || ''

    // 调用服务器端API获取应用Meta信息
    const appMeta = await getAppMeta(appId)

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