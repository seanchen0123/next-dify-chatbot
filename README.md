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

### 设置应用列表(可选)
不配置将对接默认的应用，如需配置自定义应用列表，请按照以下步骤操作：
1. 复制 `/config/apps.data.example.ts` 文件并重命名为 `/config/apps.data.ts`
2. 在 `apps.data.ts` 文件中修改应用列表信息，包括应用ID、名称、描述和图标URL
3. 系统将自动加载您配置的应用列表并在首页显示

注意：`apps.data.ts` 文件已被添加到 `.gitignore` 中，不会被提交到代码仓库，这样您可以保持个人配置的私密性。

### 运行开发服务器：
```bash
npm install

npm run dev
```
在浏览器中打开 http://localhost:3000 查看结果。