import serverClient from '@/lib/server-client';
import { MessagesResponse } from '@/types/message';
import { GetMessagesParams, StopMessageParams } from '../types/common';

// 获取会话历史消息
export async function getMessages(params: GetMessagesParams): Promise<MessagesResponse> {
  try {
    const { conversationId, userId, firstId, limit = 20 } = params;
    
    const requestParams = {
      conversation_id: conversationId,
      user: userId,
      first_id: firstId,
      limit
    };

    const response = await serverClient.get<MessagesResponse>('/messages', { 
      params: requestParams 
    });
    
    return response.data;
  } catch (error) {
    console.error('获取历史消息失败:', error);
    throw error;
  }
}

// 停止消息生成
export async function stopMessageGeneration(params: StopMessageParams): Promise<void> {
  try {
    const { userId, taskId } = params

    await serverClient.post(`/chat-messages/${taskId}/stop`, {
      user: userId
    })
  } catch (error) {
    console.error('停止消息生成失败:', error)
    throw error
  }
}