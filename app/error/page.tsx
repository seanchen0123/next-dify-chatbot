import { ErrorPage } from "@/components/error-page"
import { Suspense } from "react"

export default function ErrorRoute() {
  return <Suspense fallback={null}><ErrorPage /></Suspense>
}