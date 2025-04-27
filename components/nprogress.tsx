'use client'

import { usePathname, useSearchParams } from 'next/navigation'
import NProgress from 'nprogress'
import { useEffect } from 'react'

export function NavigationProgress() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // 初始化 NProgress 配置
  useEffect(() => {
    // 禁用加载旋转图标
    NProgress.configure({ 
      showSpinner: false,
      // 可以添加其他配置
      minimum: 0.1,
      easing: 'ease',
      speed: 300
    })

    // 添加自定义样式
    const style = document.createElement('style')
    style.textContent = `
      #nprogress .bar {
        background: hsl(var(--primary));
        height: 3px;
      }
      #nprogress .peg {
        box-shadow: 0 0 10px hsl(var(--primary)), 0 0 5px hsl(var(--primary));
      }
    `
    document.head.appendChild(style)

    return () => {
      // 清理样式
      if (document.head.contains(style)) {
        document.head.removeChild(style)
      }
    }
  }, [])

  // 监听路由变化
  useEffect(() => {
    // 当路径或搜索参数变化时显示进度条
    NProgress.start()
    
    // 短暂延迟后完成进度条
    const timer = setTimeout(() => {
      NProgress.done()
    }, 300)

    return () => {
      clearTimeout(timer)
      NProgress.done()
    }
  }, [pathname, searchParams])

  return null
}