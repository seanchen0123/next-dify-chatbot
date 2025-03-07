import { Bot } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

interface EmptyScreenProps {
  onStartChat: (prompt: string) => void
}

export function EmptyScreen({ onStartChat }: EmptyScreenProps) {
  const examplePrompts = [
    "解释量子计算的基本原理",
    "帮我写一个简单的React组件",
    "如何提高英语口语水平？",
    "写一个关于未来科技的短篇故事"
  ]

  return (
    <div className="mx-auto flex h-full max-w-2xl flex-col items-center justify-center px-4">
      <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
        <Bot className="h-10 w-10 text-primary" />
      </div>
      
      <h1 className="mb-2 text-center text-2xl font-bold">
        欢迎使用AI聊天助手
      </h1>
      
      <p className="mb-8 text-center text-muted-foreground">
        开始一个新的对话，探索AI的无限可能
      </p>
      
      <div className="grid w-full gap-4 sm:grid-cols-2">
        {examplePrompts.map((prompt, i) => (
          <Card key={i} className="cursor-pointer hover:bg-muted/50" onClick={() => onStartChat(prompt)}>
            <CardHeader className="p-4">
              <CardTitle className="text-base">{prompt}</CardTitle>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  )
}