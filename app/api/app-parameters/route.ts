import { NextRequest, NextResponse } from 'next/server'
import { getAppParameters } from '@/services/server/app-parameters'

// 标记此路由为动态路由，不进行静态生成
export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    // 从请求中获取应用ID
    const appId = req.nextUrl.searchParams.get('appId') || ''

    // 调用服务器端API获取应用参数
    const appParameters = await getAppParameters(appId)

    // 返回应用参数
    return NextResponse.json(appParameters)
  } catch (error) {
    console.error('获取应用参数失败:', error)
    return NextResponse.json(
      { error: '获取应用参数失败' },
      { status: 500 }
    )
  }
}