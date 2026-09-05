import { WorkflowCanvas } from "@/components/shared/workflow-canvas"
import { getWorkflowById } from "@/lib/actions/workflows"
import type { Edge, Node } from "@xyflow/react"

export default async function WorkflowPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const workflow = await getWorkflowById(id)

  if (!workflow) {
    return (
      <div className="flex h-[calc(100vh-3.5rem)] items-center justify-center p-6">
        <p className="text-sm text-muted-foreground">Workflow not found</p>
      </div>
    )
  }

  const initialNodes = workflow.graph.nodes as unknown as Node[]
  const initialEdges = workflow.graph.edges as unknown as Edge[]

  return (
    <div className="flex h-[calc(100vh-3.5rem)] flex-col overflow-hidden">
      <header className="flex shrink-0 items-center border-b px-4 py-3">
        <h1 className="text-lg font-semibold uppercase">{workflow.title}</h1>
      </header>
      <div className="min-h-0 flex-1">
        <WorkflowCanvas initialNodes={initialNodes} initialEdges={initialEdges} />
      </div>
    </div>
  )
}