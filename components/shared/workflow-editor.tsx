"use client"

import { useState } from "react"
import { ReactFlowProvider, useReactFlow, type Edge, type Node } from "@xyflow/react"
import { SaveIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { WorkflowCanvas } from "@/components/shared/workflow-canvas"
import { useApp } from "@/components/providers/app-context"
import type { Workflow, WorkflowGraph } from "@/lib/schema"

function SaveButton({ id }: { id: string }) {
  const { getNodes, getEdges } = useReactFlow()
  const { updateWorkflow } = useApp()
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    if (saving) return
    setSaving(true)
    try {
      const nodes = getNodes()
      const edges = getEdges()
      const graph: WorkflowGraph = {
        nodes,
        edges,
        jsonl: [
          ...nodes.map((node) => JSON.stringify(node)),
          ...edges.map((edge) => JSON.stringify(edge)),
        ].join("\n"),
      }
      await updateWorkflow(id, { graph })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Button type="button" onClick={handleSave} disabled={saving}>
      {saving ? <Spinner className="size-3.5" /> : <SaveIcon />}
      {saving ? "Saving..." : "Save"}
    </Button>
  )
}

export function WorkflowEditor({ workflow }: { workflow: Workflow }) {
  const initialNodes = (workflow.graph.nodes ?? []) as unknown as Node[]
  const initialEdges = (workflow.graph.edges ?? []) as unknown as Edge[]

  return (
    <ReactFlowProvider>
      <div className="flex h-[calc(100vh-3.5rem)] flex-col overflow-hidden">
        <header className="flex shrink-0 items-center justify-between gap-3 border-b px-4 py-3">
          <h1 className="text-lg font-semibold uppercase">{workflow.title}</h1>
          <SaveButton id={workflow.id} />
        </header>
        <div className="min-h-0 flex-1">
          <WorkflowCanvas
            initialNodes={initialNodes}
            initialEdges={initialEdges}
          />
        </div>
      </div>
    </ReactFlowProvider>
  )
}