"use client"

import Link from "next/link"
import { OrganizationSwitcher } from "@clerk/nextjs"
import {
  CreditCardIcon,
  LayoutDashboardIcon,
  PlusIcon,
  Trash2Icon,
  WorkflowIcon,
} from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { CreateWorkflowDialog } from "@/components/shared/dialog/create-workflow"
import { DeleteWorkflowDialog } from "@/components/shared/dialog/delete-workflow"
import { useApp } from "@/components/providers/app-context"
import Image from "next/image"

export function AppSidebar() {
  const { state } = useSidebar()
  const isCollapsed = state === "collapsed"
  const { workflows } = useApp()

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
          <CreateWorkflowDialog
            trigger={
              <SidebarGroupAction aria-label="Create workflow">
                <PlusIcon />
              </SidebarGroupAction>
            }
          />
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
                  {workflows.length === 0 ? (
                    <p className="px-2 py-1.5 text-sm text-muted-foreground">
                      No workflows yet
                    </p>
                  ) : (
                    workflows.map((workflow) => (
                      <div
                        key={workflow.id}
                        className="flex items-center gap-1 rounded-md hover:bg-sidebar-accent group"
                      >
                        <Link
                          href={`/workflows/${workflow.id}`}
                          className="flex min-w-0 flex-1 items-center gap-2 overflow-hidden rounded-md p-2 text-sm text-sidebar-foreground ring-sidebar-ring outline-hidden hover:bg-transparent hover:text-sidebar-accent-foreground focus-visible:ring-2"
                        >
                          <WorkflowIcon className="size-4 shrink-0" />
                          <span className="truncate">{workflow.title}</span>
                        </Link>
                        <DeleteWorkflowDialog
                          workflow={workflow}
                          trigger={
                            <button
                              type="button"
                              aria-label={`Delete ${workflow.title}`}
                              className="inline-flex shrink-0 items-center justify-center rounded-md p-1.5 text-sidebar-foreground opacity-0 transition-opacity ring-sidebar-ring outline-hidden group-hover:opacity-100 focus-visible:opacity-100 focus-visible:ring-2 hover:bg-sidebar-accent hover:text-destructive"
                            >
                              <Trash2Icon className="size-3.5" />
                            </button>
                          }
                        />
                      </div>
                    ))
                  )}
                </PopoverContent>
              </Popover>
            ) : (
              <SidebarMenu>
                {workflows.length === 0 ? (
                  <p className="px-2 py-1.5 text-sm text-muted-foreground">
                    No workflows yet
                  </p>
                ) : (
                  workflows.map((workflow) => (
                    <SidebarMenuItem key={workflow.id}>
                      <SidebarMenuButton
                        render={<Link href={`/workflows/${workflow.id}`} />}
                      >
                        <WorkflowIcon />
                        <span>{workflow.title}</span>
                      </SidebarMenuButton>
                      <DeleteWorkflowDialog
                        workflow={workflow}
                        trigger={
                          <SidebarMenuAction
                            showOnHover
                            aria-label={`Delete ${workflow.title}`}
                          >
                            <Trash2Icon />
                          </SidebarMenuAction>
                        }
                      />
                    </SidebarMenuItem>
                  ))
                )}
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
