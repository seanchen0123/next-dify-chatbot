import { toast as sonnerToast, type ToastOptions } from 'sonner'
import { CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react'

type ToastType = 'success' | 'error' | 'info' | 'warning'

interface CustomToastOptions extends ToastOptions {
  description?: string
}

const icons = {
  success: <CheckCircle className="h-5 w-5 text-green-500 dark:text-green-400" />,
  error: <AlertCircle className="h-5 w-5 text-red-500 dark:text-red-400" />,
  info: <Info className="h-5 w-5 text-blue-500 dark:text-blue-400" />,
  warning: <AlertTriangle className="h-5 w-5 text-yellow-500 dark:text-yellow-400" />
}

function showToast(type: ToastType, title: string, options?: CustomToastOptions) {
  const { description, ...restOptions } = options || {}
  
  sonnerToast[type](
    title,
    {
      ...restOptions,
      description: description,
      icon: icons[type]
    }
  )
}

export const toast = {
  success: (title: string, options?: CustomToastOptions) => 
    showToast('success', title, options),
  
  error: (title: string, options?: CustomToastOptions) => 
    showToast('error', title, options),
  
  info: (title: string, options?: CustomToastOptions) => 
    showToast('info', title, options),
  
  warning: (title: string, options?: CustomToastOptions) => 
    showToast('warning', title, options),
    
  // 保留原始 toast 的其他方法
  dismiss: sonnerToast.dismiss,
  promise: sonnerToast.promise,
  custom: sonnerToast.custom
}