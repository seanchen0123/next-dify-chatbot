import { toast as sonnerToast } from 'sonner'
import { CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react'

interface ToastClassnames {
  toast?: string;
  title?: string;
  description?: string;
  loader?: string;
  closeButton?: string;
  cancelButton?: string;
  actionButton?: string;
  success?: string;
  error?: string;
  info?: string;
  warning?: string;
  loading?: string;
  default?: string;
  content?: string;
  icon?: string;
}

interface ToastOptions {
  className?: string;
  closeButton?: boolean;
  descriptionClassName?: string;
  style?: React.CSSProperties;
  cancelButtonStyle?: React.CSSProperties;
  actionButtonStyle?: React.CSSProperties;
  duration?: number;
  unstyled?: boolean;
  classNames?: ToastClassnames;
  closeButtonAriaLabel?: string;
}

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