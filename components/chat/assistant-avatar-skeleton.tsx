export function AssistantAvatarSkeleton() {
  return (
    <div className="px-3 flex items-center space-x-1 text-muted-foreground">
      <div className="h-1 w-1 animate-bounce rounded-full bg-muted-foreground"></div>
      <div className="h-1 w-1 animate-bounce rounded-full bg-muted-foreground" style={{ animationDelay: '0.2s' }}></div>
      <div className="h-1 w-1 animate-bounce rounded-full bg-muted-foreground" style={{ animationDelay: '0.4s' }}></div>
    </div>   
  )
}