'use client'

import { redirect, useSearchParams } from 'next/navigation'

export default function HomePage() {
  const searchParams = useSearchParams()
  const userId = searchParams.get('userId')

  if (!userId) {
    redirect(
      '/error?title=Missing User ID&errorCode=400'
    )
  } else {
    redirect(
      `/chat?userId=${userId}`
    )
  }
}
