import { processStream } from '@/lib/utils'
import { NextRequest, NextResponse } from 'next/server'

// 从环境变量获取API密钥和基础URL
const API_KEY = process.env.CHAT_API_KEY
const API_BASE_URL = process.env.CHAT_API_BASE_URL

export const config = {
  runtime: 'edge'
}

export async function POST(req: NextRequest) {
  try {
    // 解析请求体
    const requestData = await req.json()

    // 获取必要参数
    const { query, files, conversation_id, user } = requestData

    if (!query || typeof query !== 'string') {
      return NextResponse.json({ error: 'Invalid query' }, { status: 400 })
    }

    if (!API_KEY) {
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 })
    }

    // 准备请求体
    const chatRequestBody = {
      inputs: requestData.inputs || {},
      query,
      response_mode: 'streaming',
      conversation_id: conversation_id || '',
      user: user || 'user-default',
      files: files || []
    }

    // 发送请求到实际API
    const response = await fetch(`${API_BASE_URL}/chat-messages`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(chatRequestBody)
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('API error:', response.status, errorText)
      return NextResponse.json(
        { error: `API request failed with status ${response.status}` },
        { status: response.status }
      )
    }

    // 创建一个转发流
    const transformStream = new TransformStream()
    const writer = transformStream.writable.getWriter()

    // 处理上游API返回的流
    if (response.body) {
      const reader = response.body.getReader()

      // 启动一个处理函数来传输数据
      processStream(reader, writer).catch(error => {
        console.error('Stream processing error:', error)
        writer.abort(error)
      })
    } else {
      writer.close()
    }

    // 返回流式响应
    return new NextResponse(transformStream.readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive'
      }
    })
  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json({ error: 'Failed to process chat request' }, { status: 500 })
  }
}
