import { redirect } from "next/navigation"

export default function HomePage() {
  // 重定向到默认聊天页面
  redirect("/chat")
}