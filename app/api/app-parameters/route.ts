import { NextRequest, NextResponse } from 'next/server'
import { getAppParameters } from '@/services/server/app-parameters'

export async function GET(req: NextRequest) {
  try {
    // 调用服务器端API获取应用参数
    const appParameters = await getAppParameters()

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