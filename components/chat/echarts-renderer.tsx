import React, { useEffect, useRef, memo, useState } from 'react'
import * as echarts from 'echarts'
import { useTheme } from 'next-themes'
import { AlertCircle } from 'lucide-react'
import { isEqual } from 'lodash'

interface EChartsRendererProps {
  options: any
  height?: number
  width?: string
  className?: string
}

export function EChartsRenderer({ options, height = 400, width = '100%', className = '' }: EChartsRendererProps) {
  const chartRef = useRef<HTMLDivElement>(null)
  const chartInstance = useRef<echarts.ECharts | null>(null)
  const { resolvedTheme } = useTheme()
  const [hasError, setHasError] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    // 初始化图表
    if (chartRef.current) {
      // 如果已经有实例，先销毁
      if (chartInstance.current) {
        chartInstance.current.dispose()
      }

      try {
        // 创建新实例
        chartInstance.current = echarts.init(chartRef.current, resolvedTheme === 'dark' ? 'dark' : undefined)

        // 监听 ECharts 的错误事件
        const errorHandler = (e: any) => {
          console.error('ECharts 错误事件:', e)
          setHasError(true)
          setErrorMessage(e.message || '未知错误')
        }

        chartInstance.current.on('rendererror', errorHandler)
        chartInstance.current.on('error', errorHandler)

        // 设置图表配置项
        chartInstance.current.setOption(options)

        // 检查是否有 Unknown series 错误
        if (options && options.series) {
          const validSeriesTypes = [
            'line',
            'bar',
            'pie',
            'scatter',
            'effectScatter',
            'radar',
            'tree',
            'treemap',
            'sunburst',
            'boxplot',
            'candlestick',
            'heatmap',
            'map',
            'parallel',
            'lines',
            'graph',
            'sankey',
            'funnel',
            'gauge',
            'pictorialBar',
            'themeRiver',
            'custom'
          ]

          const hasUnknownSeries = options.series.some(
            (series: any) => !series.type || !validSeriesTypes.includes(series.type)
          )

          if (hasUnknownSeries) {
            throw new Error('未知的图表类型')
          }
        }

        setHasError(false)
        console.log('ECharts渲染成功')
      } catch (error: any) {
        setHasError(true)
        setErrorMessage(error.message || '渲染错误')
        // console.error('ECharts渲染错误:', error)

        if (chartInstance.current) {
          chartInstance.current.dispose()
          chartInstance.current = null
        }
      }
    }

    // 组件卸载时销毁图表实例
    return () => {
      if (chartInstance.current) {
        chartInstance.current.dispose()
        chartInstance.current = null
      }
    }
  }, [options, resolvedTheme])

  // 监听窗口大小变化，调整图表大小
  useEffect(() => {
    const handleResize = () => {
      if (chartInstance.current) {
        chartInstance.current.resize()
      }
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  // 如果有错误，显示错误信息
  if (hasError) {
    return (
      <div
        className={`flex flex-col items-center justify-center border border-red-300 bg-red-50 dark:bg-red-950/20 rounded-md p-4 ${className}`}
        style={{ width, height: '180px' }}
      >
        <AlertCircle className="w-8 h-8 text-red-500 mb-2" />
        <p className="text-red-600 dark:text-red-400 text-sm font-medium">图表渲染失败</p>
        <p className="text-red-500/70 dark:text-red-400/70 text-xs mt-1">{errorMessage || '请检查图表配置是否正确'}</p>
      </div>
    )
  }

  return (
    <div
      ref={chartRef}
      className={`echarts-container ${className} rounded-md overflow-hidden`}
      style={{ width, height }}
    />
  )
}

export function EchartsRendererSkeleton({ width, height, className }: Omit<EChartsRendererProps, 'options'>) {
  return (
    <div
      className={`echarts-skeleton ${className} rounded-md overflow-hidden bg-gray-100 dark:bg-gray-800 animate-pulse`}
      style={{ width, height }}
    >
      <div className="h-full w-full flex items-center justify-center">
        <div className="text-gray-400 dark:text-gray-500 text-sm">图表加载中...</div>
      </div>
    </div>
  )
}

// 创建一个记忆化的 ECharts 渲染器组件
export const MemoizedEChartsRenderer = memo(EChartsRenderer, (prevProps, nextProps) => {
  // 使用深度比较来比较 options 对象
  return (
    isEqual(prevProps.options, nextProps.options) &&
    prevProps.height === nextProps.height &&
    prevProps.width === nextProps.width &&
    prevProps.className === nextProps.className
  )
})
