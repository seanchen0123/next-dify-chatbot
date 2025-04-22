import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Message, DisplayMessage, MessageFile } from '@/types/message';
import { replacePreviewUrl } from './file-utils';


export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// 从url中获取参数
export function getParamFromUrl(url: string, paramName: string) {
  const regex = new RegExp(`[?&]${paramName}=([^&#]*)`);
  const result = regex.exec(url);
  return result ? decodeURIComponent(result[1]) : null;
}

// 处理流数据的辅助函数
export async function processStream(
  reader: ReadableStreamDefaultReader<Uint8Array>,
  writer: WritableStreamDefaultWriter<Uint8Array>
) {
  try {
    while (true) {
      const { done, value } = await reader.read();
      
      if (done) {
        break;
      }
      
      // 将数据块写入输出流
      await writer.write(value);
    }
  } finally {
    // 确保在完成或错误时关闭写入器
    await writer.close();
  }
}

/**
 * 将API返回的消息格式转换为前端显示所需的格式
 * @param messages API返回的原始消息列表
 * @returns 转换后的DisplayMessage列表
 */
export function formatMessagesToDisplay(messages: Message[]): DisplayMessage[] {
  return messages
    .filter(message => message.status === 'normal') // 只处理 status 为 normal 的消息
    .map(message => {
      // 创建用户消息
      let userFiles: MessageFile[] = []
      let assistantFiles: MessageFile[] = []
      if (message.message_files && message.message_files.length > 0) {
        message.message_files.forEach(file => {
          file.url = `/api${file.url}`
          if (file.belongs_to === 'user') {
            userFiles.push(file)
          } else {
            assistantFiles.push(file)
          }
        })
      }
      const userMessage: DisplayMessage = {
        id: `${message.id}-user`,
        role: 'user',
        content: message.query,
        createdAt: new Date(parseInt(message.created_at) * 1000),
        files: userFiles
      }

      // 创建助手消息（如果有回答）
      const assistantMessages: DisplayMessage[] = [];
      if (message.answer) {
        const assistantMessage: DisplayMessage = {
          id: `${message.id}-assistant`,
          role: 'assistant',
          content: replacePreviewUrl(message.answer),
          createdAt: new Date(parseInt(message.created_at) * 1000 + 1000), // 助手消息时间稍晚于用户消息
          files: assistantFiles
        }
        // 处理引用资源
        if (message.retriever_resources && message.retriever_resources.length > 0) {
          assistantMessage.retrieverResources = message.retriever_resources
        }
        assistantMessages.push(assistantMessage)
      }

      return [userMessage, ...assistantMessages]
    }).flat()
}

/**
 * 按时间顺序排序消息
 * @param messages 消息列表
 * @returns 排序后的消息列表
 */
export function sortMessagesByTime(messages: DisplayMessage[]): DisplayMessage[] {
  return [...messages].sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
}

export function removeMarkdownLinks(text: string) {
  return text.replace(/!?\[.*?\]\(.*?\)/g, '');
}
