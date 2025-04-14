import { SparklesIcon } from 'lucide-react'
import React from 'react'
import { Button } from '../ui/button'

const SuggestedQuestions = ({
  suggestedQuestions,
  onSendMessage
}: {
  suggestedQuestions: string[]
  onSendMessage: (prompt: string) => void
}) => {
  return (
    <div className="pt-0 pb-4 px-4">
      <div className="text-xs text-muted-foreground mb-3 flex items-center justify-center gap-1">
        <SparklesIcon className="w-3 h-3" />
        <span>试试问这些</span>
      </div>
      <div className="flex flex-wrap gap-2 justify-center">
        {suggestedQuestions.map((question, index) => (
          <Button
            key={index}
            variant={'outline'}
            size={'sm'}
            className="px-3 h-8 text-xs bg-muted/80 hover:bg-muted text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-500 rounded-full truncate max-w-[180px] sm:max-w-[220px] md:max-w-[250px] transition duration-200"
            onClick={() => {
              // 这里可以添加点击问题后的处理逻辑
              onSendMessage(question)
            }}
          >
            <span className="truncate block">{question}</span>
          </Button>
        ))}
      </div>
    </div>
  )
}

export default SuggestedQuestions
