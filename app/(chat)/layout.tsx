import { ChatLayout } from "@/components/layout/chat-layout"

export default function Layout({ children }: { children: React.ReactNode }) {
  return <ChatLayout>{children}</ChatLayout>
}