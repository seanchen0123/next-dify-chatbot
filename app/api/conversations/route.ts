import { NextRequest, NextResponse } from 'next/server';
import { getConversations } from '@/services/server/conversations';

export async function GET(request: NextRequest) {
  try {
    // 从 URL 参数中获取查询参数
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const lastId = searchParams.get('last_id') || undefined;
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const sortBy = searchParams.get('sort_by') || '-updated_at';

    if (!userId) {
      return NextResponse.json(
        { error: '缺少用户 ID 参数' },
        { status: 400 }
      );
    }

    // 调用 API 客户端获取会话列表
    const conversations = await getConversations({
      userId,
      lastId,
      limit,
      sortBy
    });

    return NextResponse.json(conversations);
  } catch (error) {
    console.error('API 路由获取会话列表失败:', error);
    return NextResponse.json(
      { error: '获取会话列表失败' },
      { status: 500 }
    );
  }
}