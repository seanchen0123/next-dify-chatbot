import { uploadFile } from '@/services/server/files'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    // 获取用户ID
    const formData = await req.formData()
    const user = formData.get('userId')
    const file = formData.get('file')
    const appId = formData.get('appId')

    if (!user || typeof user !== 'string') {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    if (typeof appId !== 'string') {
      return NextResponse.json({ error: 'AppID must be string' }, { status: 400 })
    }

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    // 发送请求到实际API
    const res = await uploadFile(file, user, appId)

    return NextResponse.json(res)
  } catch (error) {
    console.error('File upload error:', error)
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 })
  }
}