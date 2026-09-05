import { Suspense } from "react"
import { DashboardLayoutShell } from "@/components/shared/dashboard-layout-shell"
import { Spinner } from "@/components/ui/spinner"

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <DashboardLayoutShell>
      <Suspense
        fallback={
          <div className="flex flex-1 items-center justify-center">
            <Spinner className="size-6" />
          </div>
        }
      >
        {children}
      </Suspense>
    </DashboardLayoutShell>
  )
}