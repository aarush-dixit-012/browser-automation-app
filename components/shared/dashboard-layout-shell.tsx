"use client"

import { usePathname } from "next/navigation"
import { AppSidebar } from "@/components/shared/AppSidebar"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"

export function DashboardLayoutShell({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname()
  const isWorkflowPage = pathname.startsWith("/workflows")

  return (
    <SidebarProvider
      key={isWorkflowPage ? "workflow" : "app"}
      defaultOpen={!isWorkflowPage}
    >
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
        </header>
        {children}
      </SidebarInset>
    </SidebarProvider>
  )
}