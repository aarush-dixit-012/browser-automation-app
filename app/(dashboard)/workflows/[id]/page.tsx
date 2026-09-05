import { getWorkflowById } from "@/lib/actions/workflows"

export default async function WorkflowPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const workflow = await getWorkflowById(id)

  return (
    <div className="flex flex-1 items-center justify-center p-6">
      {workflow ? (
        <h1 className="text-lg font-semibold">{workflow.title}</h1>
      ) : (
        <p className="text-sm text-muted-foreground">Workflow not found</p>
      )}
    </div>
  )
}