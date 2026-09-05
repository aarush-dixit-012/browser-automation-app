import { Suspense } from "react"
import { AppSidebar } from "@/components/shared/AppSidebar"
import { Spinner } from "@/components/ui/spinner"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
        </header>
        <Suspense
          fallback={
            <div className="flex flex-1 items-center justify-center">
              <Spinner className="size-6" />
            </div>
          }
        >
          {children}
        </Suspense>
      </SidebarInset>
    </SidebarProvider>
  )
}
