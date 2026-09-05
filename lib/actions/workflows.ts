"use server"

import { and, desc, eq } from "drizzle-orm"
import { auth } from "@clerk/nextjs/server"
import { db } from "@/lib/db"
import {
  workflows,
  type NewWorkflow,
  type Workflow,
  type WorkflowGraph,
} from "@/lib/schema"

function requireOrgId(
  orgId: string | null | undefined
): asserts orgId is string {
  if (!orgId) {
    throw new Error("Unauthorized: no active organization")
  }
}

export async function getWorkflows(): Promise<Workflow[]> {
  const { orgId } = await auth()
  requireOrgId(orgId)
  return db
    .select()
    .from(workflows)
    .where(eq(workflows.orgId, orgId))
    .orderBy(desc(workflows.createdAt))
}

export async function getWorkflowById(id: string): Promise<Workflow | null> {
  const { orgId } = await auth()
  requireOrgId(orgId)
  const [workflow] = await db
    .select()
    .from(workflows)
    .where(and(eq(workflows.id, id), eq(workflows.orgId, orgId)))
    .limit(1)
  return workflow ?? null
}

export async function createWorkflow(input: {
  title: string
  graph?: WorkflowGraph
}): Promise<Workflow> {
  const { orgId } = await auth()
  requireOrgId(orgId)

  const row: NewWorkflow = {
    title: input.title,
    orgId,
    graph: input.graph ?? { nodes: [], edges: [] },
  }

  const [workflow] = await db.insert(workflows).values(row).returning()
  return workflow
}

export async function updateWorkflow(
  id: string,
  input: { title?: string; graph?: WorkflowGraph }
): Promise<Workflow> {
  const { orgId } = await auth()
  requireOrgId(orgId)

  const [workflow] = await db
    .update(workflows)
    .set(input)
    .where(and(eq(workflows.id, id), eq(workflows.orgId, orgId)))
    .returning()

  if (!workflow) {
    throw new Error("Workflow not found")
  }
  return workflow
}

export async function deleteWorkflow(id: string): Promise<{ id: string }> {
  const { orgId } = await auth()
  requireOrgId(orgId)

  const [deleted] = await db
    .delete(workflows)
    .where(and(eq(workflows.id, id), eq(workflows.orgId, orgId)))
    .returning({ id: workflows.id })

  if (!deleted) {
    throw new Error("Workflow not found")
  }
  return deleted
}