// 在sendMessage函数中更新AI响应的获取方式
export async function sendMessage(
  conversationId: string, 
  content: string
): Promise<Message> {
  await delay(300);
  
  const conversation = conversations.find(c => c.id === conversationId);
  if (!conversation) {
    throw new Error("对话不存在");
  }
  
  // 创建用户消息
  const userMessage: Message = {
    id: `user-${Date.now()}`,
    role: "user",
    content,
    createdAt: new Date(),
  };
  
  // 添加用户消息到对话
  conversation.messages.push(userMessage);
  
  try {
    // 调用API获取AI响应
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: conversation.messages,
      }),
    });
    
    if (!response.ok) {
      throw new Error("API响应错误");
    }
    
    const assistantMessage = await response.json();
    
    // 添加AI响应到对话
    conversation.messages.push(assistantMessage);
    
    // 更新对话标题（如果是第一条消息）
    if (conversation.messages.filter(m => m.role === "user").length === 1) {
      conversation.title = content.slice(0, 30) + (content.length > 30 ? "..." : "");
    }
    
    // 更新对话时间
    conversation.updatedAt = new Date();
    
    return assistantMessage;
  } catch (error) {
    console.error("获取AI响应失败:", error);
    
    // 创建错误响应
    const errorMessage: Message = {
      id: `error-${Date.now()}`,
      role: "assistant",
      content: "抱歉，处理您的请求时出错了。请稍后再试。",
      createdAt: new Date(),
    };
    
    // 添加错误响应到对话
    conversation.messages.push(errorMessage);
    
    // 更新对话时间
    conversation.updatedAt = new Date();
    
    return errorMessage;
  }
}