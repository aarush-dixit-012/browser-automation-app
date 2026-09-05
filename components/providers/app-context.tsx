"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useTransition,
  useState,
} from "react"
import { useOrganization, useUser } from "@clerk/nextjs"
import { toast } from "@/components/ui/toast"
import {
  getCurrentUserPlan,
  type CurrentUserPlan,
} from "@/lib/actions/user"
import type { Workflow, WorkflowGraph } from "@/lib/schema"

type AppUser = {
  id: string | null
  firstName: string | null
  lastName: string | null
  fullName: string | null
  imageUrl: string | null
  email: string | null
} | null

type AppOrg = {
  id: string | null
  name: string | null
  slug: string | null
  imageUrl: string | null
} | null

type AppContextValue = {
  user: AppUser
  org: AppOrg
  plan: CurrentUserPlan | null
  planLoading: boolean
  workflows: Workflow[]
  workflowsLoading: boolean
  workflowsError: string | null
  refresh: () => Promise<void>
  refreshWorkflows: () => Promise<void>
  createWorkflow: (input: {
    title: string
    graph?: WorkflowGraph
  }) => Promise<Workflow>
  updateWorkflow: (
    id: string,
    input: { title?: string; graph?: WorkflowGraph }
  ) => Promise<Workflow>
  deleteWorkflow: (id: string) => Promise<void>
}

const AppContext = createContext<AppContextValue | null>(null)

async function callApi(url: string, init?: RequestInit) {
  const response = await fetch(url, init)
  const data = await response.json().catch(() => null)
  if (!response.ok) {
    throw new Error(data?.error ?? `Request failed (${response.status})`)
  }
  return data
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const { user: clerkUser, isLoaded: isUserLoaded } = useUser()
  const { organization, isLoaded: isOrgLoaded } = useOrganization()

  const userId = clerkUser?.id ?? null
  const orgId = organization?.id ?? null

  const [plan, setPlan] = useState<CurrentUserPlan | null>(null)
  const [planLoading, startPlanTransition] = useTransition()

  const [workflows, setWorkflows] = useState<Workflow[]>([])
  const [workflowsLoading, startWorkflowsTransition] = useTransition()
  const [workflowsError, setWorkflowsError] = useState<string | null>(null)

  const refreshPlan = useCallback(() => {
    return new Promise<void>((resolve) => {
      startPlanTransition(async () => {
        try {
          setPlan(await getCurrentUserPlan())
        } finally {
          resolve()
        }
      })
    })
  }, [])

  const refreshWorkflows = useCallback(() => {
    return new Promise<void>((resolve) => {
      startWorkflowsTransition(async () => {
        setWorkflowsError(null)
        try {
          const response = await fetch("/api/workflows", {
            cache: "no-store",
          })
          if (!response.ok) {
            throw new Error("Failed to load workflows")
          }
          const data = (await response.json()) as { workflows: Workflow[] }
          setWorkflows(data.workflows)
        } catch (error) {
          setWorkflowsError((error as Error).message)
        } finally {
          resolve()
        }
      })
    })
  }, [])

  useEffect(() => {
    if (!orgId) return
    void refreshWorkflows()
  }, [orgId, refreshWorkflows])

  useEffect(() => {
    if (!userId && !orgId) return
    startPlanTransition(async () => {
      setPlan(await getCurrentUserPlan())
    })
  }, [userId, orgId])

  const refresh = useCallback(async () => {
    await Promise.all([refreshWorkflows(), refreshPlan()])
  }, [refreshWorkflows, refreshPlan])

  const createWorkflow = useCallback(
    async (input: { title: string; graph?: WorkflowGraph }) => {
      try {
        const data = (await callApi("/api/workflows", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(input),
        })) as { workflow: Workflow }
        toast.add({
          type: "success",
          title: "Workflow created",
          description: `"${data.workflow.title}" was created`,
        })
        await refresh()
        return data.workflow
      } catch (error) {
        toast.add({
          type: "error",
          title: "Create failed",
          description: (error as Error).message,
        })
        throw error
      }
    },
    [refresh]
  )

  const updateWorkflow = useCallback(
    async (id: string, input: { title?: string; graph?: WorkflowGraph }) => {
      try {
        const data = (await callApi(`/api/workflows?id=${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(input),
        })) as { workflow: Workflow }
        toast.add({
          type: "success",
          title: "Workflow updated",
          description: `"${data.workflow.title}" was updated`,
        })
        await refresh()
        return data.workflow
      } catch (error) {
        toast.add({
          type: "error",
          title: "Update failed",
          description: (error as Error).message,
        })
        throw error
      }
    },
    [refresh]
  )

  const deleteWorkflow = useCallback(
    async (id: string) => {
      try {
        await callApi(`/api/workflows?id=${id}`, { method: "DELETE" })
        toast.add({
          type: "success",
          title: "Workflow deleted",
          description: "The workflow was deleted",
        })
        await refresh()
      } catch (error) {
        toast.add({
          type: "error",
          title: "Delete failed",
          description: (error as Error).message,
        })
        throw error
      }
    },
    [refresh]
  )

  const user = useMemo<AppUser>(
    () =>
      isUserLoaded && clerkUser
        ? {
            id: clerkUser.id,
            firstName: clerkUser.firstName,
            lastName: clerkUser.lastName,
            fullName: clerkUser.fullName,
            imageUrl: clerkUser.imageUrl,
            email: clerkUser.primaryEmailAddress?.emailAddress ?? null,
          }
        : null,
    [clerkUser, isUserLoaded]
  )

  const org = useMemo<AppOrg>(
    () =>
      isOrgLoaded && organization
        ? {
            id: organization.id,
            name: organization.name,
            slug: organization.slug,
            imageUrl: organization.imageUrl,
          }
        : null,
    [organization, isOrgLoaded]
  )

  const scopedWorkflows = useMemo(
    () => (orgId ? workflows.filter((w) => w.orgId === orgId) : []),
    [orgId, workflows]
  )

  const value = useMemo<AppContextValue>(
    () => ({
      user,
      org,
      plan,
      planLoading,
      workflows: scopedWorkflows,
      workflowsLoading,
      workflowsError,
      refresh,
      refreshWorkflows,
      createWorkflow,
      updateWorkflow,
      deleteWorkflow,
    }),
    [
      user,
      org,
      plan,
      planLoading,
      scopedWorkflows,
      workflowsLoading,
      workflowsError,
      refresh,
      refreshWorkflows,
      createWorkflow,
      updateWorkflow,
      deleteWorkflow,
    ]
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp(): AppContextValue {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error("useApp must be used within an AppProvider")
  }
  return context
}