import axios from 'axios'

// 创建一个 axios 实例，用于服务端请求
const serverClient = axios.create({
  baseURL: process.env.CHAT_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${process.env.CHAT_API_KEY}`
  }
})

export default serverClient
