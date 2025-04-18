import { Bot, MessageCirclePlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { useApp } from '@/contexts/app-context'

interface EmptyScreenProps {
  appName: string
  appDescription: string
  openingQuestions: string[]
  onStartChat: (prompt: string) => void
}

export function EmptyScreen({ appName, appDescription, openingQuestions, onStartChat }: EmptyScreenProps) {

  return (
    <div className="mx-auto flex h-full max-w-2xl flex-col items-center justify-center px-4">
      <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
        <Bot className="h-10 w-10 text-primary" />
      </div>

      <h1 className="mb-2 text-center text-2xl font-bold">欢迎使用{appName}</h1>

      <p className="mb-8 text-center text-muted-foreground">{appDescription}</p>

      <div className="grid w-full gap-4 sm:grid-cols-2">
        {openingQuestions.map((prompt, i) => (
          <Card key={i} className="cursor-pointer hover:bg-muted/50" onClick={() => onStartChat(prompt)}>
            <CardHeader className="p-4">
              <CardTitle className="text-base">{prompt}</CardTitle>
            </CardHeader>
          </Card>
        ))}
      </div>
      <Button
        variant="outline"
        className="mt-6 py-4 bg-primary/10 hover:bg-primary/20 text-primary border-primary/20 flex items-center justify-center gap-2"
        onClick={() => onStartChat('')}
      >
        <MessageCirclePlus />
        <span className="font-medium">开始聊天</span>
      </Button>
    </div>
  )
}
