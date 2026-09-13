"use client"

import { useState } from "react"
import { ReactFlowProvider, useReactFlow, type Edge, type Node } from "@xyflow/react"
import { PlayIcon, SaveIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { WorkflowCanvas } from "@/components/shared/workflow-canvas"
import { useApp } from "@/components/providers/app-context"
import type { ExecutionResult } from "@/features/workflows/execute"
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

function RunButton({ id }: { id: string }) {
  const { getNodes, getEdges } = useReactFlow()
  const [running, setRunning] = useState(false)
  const [result, setResult] = useState<ExecutionResult | null>(null)
  const [open, setOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleRun() {
    if (running) return
    setRunning(true)
    setError(null)
    setResult(null)
    setOpen(true)
    try {
      const nodes = getNodes()
      const edges = getEdges()
      const graph: WorkflowGraph = { nodes, edges }
      await updateWorkflowIfNeeded(id, graph)

      const response = await fetch(`/api/workflows/${id}/run`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ graph }),
      })
      const data = (await response.json().catch(() => null)) as
        | { result?: ExecutionResult; error?: string }
        | null

      if (!response.ok) {
        throw new Error(data?.error ?? `Request failed (${response.status})`)
      }
      if (data?.result) setResult(data.result)
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setRunning(false)
    }
  }

  return (
    <>
      <Button type="button" onClick={handleRun} disabled={running}>
        {running ? <Spinner className="size-3.5" /> : <PlayIcon />}
        {running ? "Running..." : "Run"}
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {running ? "Running workflow..." : result?.ok ? "Workflow finished" : "Workflow failed"}
            </DialogTitle>
            <DialogDescription>
              {running
                ? "Driving a Browserbase cloud browser through your steps."
                : result?.sessionUrl
                  ? "Watch the cloud browser live or replay it from the session link below."
                  : "Run started."}
            </DialogDescription>
          </DialogHeader>
          {result?.sessionUrl ? (
            <a
              href={result.sessionUrl}
              target="_blank"
              rel="noreferrer"
              className="break-all rounded-md border bg-muted/40 px-3 py-2 text-xs font-mono text-foreground underline-offset-4 hover:underline"
            >
              {result.sessionUrl}
            </a>
          ) : null}
          {error ? (
            <p className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
              {error}
            </p>
          ) : null}
          {result && result.steps.length > 0 ? (
            <ul className="flex max-h-72 flex-col gap-1.5 overflow-y-auto rounded-md border bg-muted/30 p-2 text-xs">
              {result.steps.map((step) => (
                <li
                  key={step.nodeId}
                  className="flex items-center justify-between gap-2 rounded px-2 py-1"
                >
                  <span className="font-medium">
                    {step.title}{" "}
                    <span className="font-mono text-muted-foreground">({step.type})</span>
                  </span>
                  <span className="text-muted-foreground">
                    {step.ok ? "ok" : "failed"} · {step.durationMs}ms
                  </span>
                </li>
              ))}
            </ul>
          ) : null}
          {result?.output && Object.keys(result.output).length > 0 ? (
            <pre className="max-h-40 overflow-y-auto rounded-md border bg-muted/40 p-2 text-xs">
              {JSON.stringify(result.output, null, 2)}
            </pre>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  )
}

async function updateWorkflowIfNeeded(
  id: string,
  graph: WorkflowGraph
): Promise<void> {
  const response = await fetch(`/api/workflows?id=${id}`, {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ graph }),
  })
  if (!response.ok) {
    throw new Error(`Failed to save workflow before run (${response.status})`)
  }
}

export function WorkflowEditor({ workflow }: { workflow: Workflow }) {
  const initialNodes = (workflow.graph.nodes ?? []) as unknown as Node[]
  const initialEdges = (workflow.graph.edges ?? []) as unknown as Edge[]

  return (
    <ReactFlowProvider>
      <div className="flex h-[calc(100vh-3.5rem)] flex-col overflow-hidden">
        <header className="flex shrink-0 items-center justify-between gap-3 border-b px-4 py-3">
          <h1 className="text-lg font-semibold uppercase">{workflow.title}</h1>
          <div className="flex items-center gap-2">
            <SaveButton id={workflow.id} />
            <RunButton id={workflow.id} />
          </div>
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