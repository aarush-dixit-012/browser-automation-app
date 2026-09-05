import { Suspense } from "react"
import { Spinner } from "@/components/ui/spinner"

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className="flex min-h-svh items-center justify-center bg-muted/30 p-6">
      <Suspense
        fallback={
          <div className="flex min-h-svh items-center justify-center">
            <Spinner className="size-6" />
          </div>
        }
      >
        {children}
      </Suspense>
    </div>
  )
}