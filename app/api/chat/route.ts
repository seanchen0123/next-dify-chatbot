import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { messages } = await request.json()
    
    // 这里将来会调用实际的AI服务API
    // 现在只是简单地返回一个模拟响应
    
    // 模拟API延迟
    await new Promise((resolve) => setTimeout(resolve, 1000))
    
    const lastMessage = messages[messages.length - 1]
    
    return NextResponse.json({
      id: `response-${Date.now()}`,
      role: "assistant",
      content: `这是对"${lastMessage.content}"的回复。实际实现时，这里将是从AI服务获取的真实回复。`,
      createdAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Chat API error:", error)
    return NextResponse.json(
      { error: "处理请求时出错" },
      { status: 500 }
    )
  }
}