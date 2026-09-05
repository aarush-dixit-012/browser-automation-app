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
import {
  createWorkflow as createWorkflowAction,
  deleteWorkflow as deleteWorkflowAction,
  getWorkflows,
  updateWorkflow as updateWorkflowAction,
} from "@/lib/actions/workflows"
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

  const refreshWorkflows = useCallback(() => {
    return new Promise<void>((resolve) => {
      startWorkflowsTransition(async () => {
        setWorkflowsError(null)
        try {
          const rows = await getWorkflows()
          setWorkflows(rows)
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

  const createWorkflow = useCallback(
    async (input: { title: string; graph?: WorkflowGraph }) => {
      const workflow = await createWorkflowAction(input)
      await refreshWorkflows()
      return workflow
    },
    [refreshWorkflows]
  )

  const updateWorkflow = useCallback(
    async (
      id: string,
      input: { title?: string; graph?: WorkflowGraph }
    ) => {
      const workflow = await updateWorkflowAction(id, input)
      await refreshWorkflows()
      return workflow
    },
    [refreshWorkflows]
  )

  const deleteWorkflow = useCallback(
    async (id: string) => {
      await deleteWorkflowAction(id)
      await refreshWorkflows()
    },
    [refreshWorkflows]
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