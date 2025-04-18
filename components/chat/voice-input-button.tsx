'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Mic, MicOff, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useIsMobile } from '@/hooks/use-mobile'
import { toast } from 'sonner'

// 修改接口定义，添加新的属性
interface VoiceInputButtonProps {
  onAudioCaptured: (audioBlob: Blob) => void
  disabled?: boolean
  onRecordingStateChange?: (isRecording: boolean) => void
  isTranscribing?: boolean
}

export function VoiceInputButton({ 
  onAudioCaptured, 
  disabled = false, 
  onRecordingStateChange,
  isTranscribing = false
}: VoiceInputButtonProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)
  const [recordingDuration, setRecordingDuration] = useState(0)
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const timerRef = useRef<number | null>(null)
  const longPressTimerRef = useRef<number | null>(null)
  
  // 请求麦克风权限
  const requestMicrophonePermission = async () => {
    try {
      setIsProcessing(true)
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      setHasPermission(true)
      setIsProcessing(false)
      return stream
    } catch (error) {
      console.error('麦克风权限获取失败:', error)
      setHasPermission(false)
      setIsProcessing(false)
      toast.error('无法访问麦克风', {
        description: '请确保您已授予麦克风访问权限'
      })
      return null
    }
  }

  // 开始录音
  const startRecording = async () => {
    const stream = await requestMicrophonePermission()
    if (!stream) return
    
    try {
      audioChunksRef.current = []
      const mediaRecorder = new MediaRecorder(stream)
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }
      
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' })
        onAudioCaptured(audioBlob)
        
        // 停止所有轨道
        stream.getTracks().forEach(track => track.stop())
        
        // 重置状态
        setIsRecording(false)
        setRecordingDuration(0)
        if (timerRef.current) {
          clearInterval(timerRef.current)
          timerRef.current = null
        }
      }
      
      // 开始录音
      mediaRecorder.start()
      mediaRecorderRef.current = mediaRecorder
      
      // 重置计时器
      setRecordingDuration(0)
      
      // 清除可能存在的旧计时器
      if (timerRef.current) {
        window.clearInterval(timerRef.current)
        timerRef.current = null
      }
      
      // 设置录音状态应该在计时器设置之后
      setIsRecording(true)
      // 通知父组件录音状态变化
      onRecordingStateChange?.(true)
      // 在状态更新后启动计时器
      setTimeout(() => {
        const timerId = window.setInterval(() => {
          setRecordingDuration(prev => {
            const newValue = prev + 1;
            return newValue;
          });
        }, 1000);
        
        timerRef.current = timerId;
      }, 0);
      
    } catch (error) {
      console.error('录音启动失败:', error)
      toast.error('录音启动失败')
    }
  }

  // 停止录音
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      // 通知父组件录音状态变化
      onRecordingStateChange?.(false)
    }
  }

  const handleClick = async () => {
    if (isRecording) {
      stopRecording()
    } else {
      await startRecording()
    }
  }

  // 组件卸载时清理资源
  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.stop()
      }
      
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
      
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current)
        longPressTimerRef.current = null
      }
    }
  }, [isRecording])

  // 格式化录音时间
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <Button
      type="button"
      size="icon"
      variant="ghost"
      className={cn(
        "h-8 w-8 rounded-full transition-all",
        isRecording ? "bg-red-500/20 text-red-500" : "opacity-80",
        isProcessing && "animate-pulse"
      )}
      disabled={disabled || isProcessing}
      onClick={handleClick}
      title="点击录音"
    >
      {isProcessing ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : isTranscribing ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : isRecording ? (
        <div className="flex items-center justify-center relative">
          <span className="absolute text-[8px] font-mono -mt-5">
            {formatDuration(recordingDuration)}
          </span>
          <MicOff className="h-4 w-4" />
        </div>
      ) : (
        <Mic className="scale-125" />
      )}
      <span className="sr-only">语音输入</span>
    </Button>
  )
}
