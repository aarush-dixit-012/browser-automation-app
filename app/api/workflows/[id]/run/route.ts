import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { getWorkflowById } from "@/lib/actions/workflows"
import { executeWorkflow } from "@/features/workflows/execute"

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { orgId } = await auth()
  if (!orgId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await context.params
  const workflow = await getWorkflowById(id)
  if (!workflow) {
    return NextResponse.json({ error: "Workflow not found" }, { status: 404 })
  }

  try {
    const result = await executeWorkflow(
      (workflow.graph.nodes ?? []) as never,
      (workflow.graph.edges ?? []) as never
    )
    return NextResponse.json({ result })
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    )
  }
}