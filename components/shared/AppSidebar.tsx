"use client"

import Link from "next/link"
import { OrganizationSwitcher } from "@clerk/nextjs"
import { CreditCardIcon, LayoutDashboardIcon, WorkflowIcon } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import Image from "next/image"

const sampleWorkflows = [
  "Onboarding flow",
  "Order processing",
  "Email digest",
  "Invoice automation",
  "Data sync",
  "Lead scoring",
  "Slack notifications",
  "Report generation",
  "User import",
  "Backup routine",
  "Webhook relay",
  "Cold outreach",
]

export function AppSidebar() {
  const { state } = useSidebar()
  const isCollapsed = state === "collapsed"

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <Image
              width={2}
              height={2}
              draggable={false}
              src="/icon.svg"
              alt="Zest"
              className="size-10 shrink-0 rounded-md"
            />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton isActive render={<Link href="/" />}>
                  <LayoutDashboardIcon />
                  <span>Dashboard</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup className="max-h-[60vh] min-h-0 flex-none">
          <SidebarGroupLabel>Workflows</SidebarGroupLabel>
          <SidebarGroupContent className="min-h-0 overflow-y-auto">
            {isCollapsed ? (
              <Popover>
                <PopoverTrigger
                  openOnHover
                  closeDelay={200}
                  className="flex h-8 w-full items-center gap-2 rounded-md p-2 text-sm text-sidebar-foreground ring-sidebar-ring outline-hidden transition-[width,height,padding] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground"
                >
                  <WorkflowIcon />
                  <span className="sr-only">Workflows</span>
                </PopoverTrigger>
                <PopoverContent
                  side="right"
                  align="start"
                  sideOffset={8}
                  className="max-h-[90vh] w-56 overflow-y-auto p-1"
                >
                  <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                    Workflows
                  </div>
                  {sampleWorkflows.map((workflow) => (
                    <button
                      key={workflow}
                      className="flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-sm text-sidebar-foreground ring-sidebar-ring outline-hidden hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2"
                    >
                      <WorkflowIcon className="size-4 shrink-0" />
                      <span className="truncate">{workflow}</span>
                    </button>
                  ))}
                </PopoverContent>
              </Popover>
            ) : (
              <SidebarMenu>
                {sampleWorkflows.map((workflow) => (
                  <SidebarMenuItem key={workflow}>
                    <SidebarMenuButton>
                      <WorkflowIcon />
                      <span>{workflow}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            )}
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu className="gap-3">
          <SidebarMenuItem>
            <SidebarMenuButton render={<Link href="/billing" />}>
              <CreditCardIcon />
              <span>Billing</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <OrganizationSwitcher
              appearance={{
                elements: {
                  organizationSwitcherTrigger:
                    "flex h-8 w-full items-center gap-2 overflow-hidden rounded-md p-2 text-sm text-sidebar-foreground ring-sidebar-ring outline-hidden transition-[width,height,padding] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground group-data-[collapsible=icon]:size-8! group-data-[collapsible=icon]:justify-start! group-data-[collapsible=icon]:p-0",
                },
              }}
            />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
