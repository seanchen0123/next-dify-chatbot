# Next-Chatbot

这是一个借助Trae AI编辑器实现的聊天页面，主要功能是对接Dify Chat Workflow API。

## 技术栈
- Next.js 14
- Tailwind CSS v3
- TypeScript
- Shadcn UI
- Dify 0.15.3 ChatFlow

## 功能列表

### 已对接的接口
- ✅ 发送对话消息
- ✅ 停止响应
- ✅ 消息反馈（点赞）
- ✅ 获取会话历史消息
- ✅ 获取会话列表
- ✅ 删除会话
- ✅ 会话重命名
- ✅ 获取下一轮建议问题列表
- ✅ 获取应用基本信息
- ✅ 获取应用参数
- ✅ 获取应用Meta信息
- ✅ 上传文件
- ✅ 文字转语音
- ✅ 语音转文字

## 开始使用

### 环境变量
参考.env.example文件，创建.env文件，填写相关环境变量。

### 运行开发服务器：
```bash
npm install

npm run dev
```
在浏览器中打开 http://localhost:3000 查看结果。