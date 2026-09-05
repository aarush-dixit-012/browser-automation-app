import { WorkflowEditor } from "@/components/shared/workflow-editor"
import { getWorkflowById } from "@/lib/actions/workflows"

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

  return <WorkflowEditor workflow={workflow} />
}