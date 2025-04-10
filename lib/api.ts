import axios from 'axios';

// 创建前端 axios 实例
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  }
});

export default api;