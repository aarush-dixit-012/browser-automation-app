import type { Edge, Node } from "@xyflow/react"
import { closeStagehand, createStagehand } from "@/lib/stagehand"
import { nodeRegistry, type StepNodeData, type StepNodeType } from "@/components/shared/workflow/nodes"
import * as startNode from "./nodes/start"
import * as endNode from "./nodes/end"
import * as openUrlNode from "./nodes/open-url"
import * as actNode from "./nodes/act"
import * as observeNode from "./nodes/observe"
import * as extractNode from "./nodes/extract"
import * as agentNode from "./nodes/agent"
import type {
  NodeContext,
  NodeParameters,
  NodeRunner,
} from "./nodes/types"
import { resolveTemplates } from "./nodes/types"

type GraphNode = Node<StepNodeData, StepNodeType>
type GraphEdge = Edge

const runners: Record<StepNodeType, NodeRunner> = {
  start: startNode.run,
  end: endNode.run,
  "open-url": openUrlNode.run,
  act: actNode.run,
  observe: observeNode.run,
  extract: extractNode.run,
  agent: agentNode.run,
}

export type ExecutionStep = {
  nodeId: string
  type: StepNodeType
  title: string
  ok: boolean
  error?: string
  output?: Record<string, unknown>
  durationMs: number
}

export type ExecutionResult = {
  ok: boolean
  sessionId: string | null
  sessionUrl: string | null
  steps: ExecutionStep[]
  output: Record<string, unknown>
  error?: string
}

function indexNodes(nodes: GraphNode[]): Map<string, GraphNode> {
  const map = new Map<string, GraphNode>()
  for (const node of nodes) map.set(node.id, node)
  return map
}

function adjacency(nodes: GraphNode[], edges: GraphEdge[]): Map<string, string[]> {
  const out = new Map<string, string[]>()
  for (const node of nodes) out.set(node.id, [])
  for (const edge of edges) {
    const targets = out.get(edge.source)
    if (targets && edge.target) targets.push(edge.target)
  }
  return out
}

function topologicalOrder(nodes: GraphNode[], edges: GraphEdge[]): GraphNode[] {
  const byId = indexNodes(nodes)
  const next = adjacency(nodes, edges)

  const inDegree = new Map<string, number>()
  for (const node of nodes) inDegree.set(node.id, 0)
  for (const edge of edges) {
    if (edge.target && byId.has(edge.target)) {
      inDegree.set(edge.target, (inDegree.get(edge.target) ?? 0) + 1)
    }
  }

  const queue: string[] = []
  for (const [id, degree] of inDegree) {
    if (degree === 0) queue.push(id)
  }

  const order: GraphNode[] = []
  while (queue.length > 0) {
    const id = queue.shift()!
    const node = byId.get(id)
    if (node) order.push(node)
    for (const target of next.get(id) ?? []) {
      const remaining = (inDegree.get(target) ?? 0) - 1
      inDegree.set(target, remaining)
      if (remaining === 0) queue.push(target)
    }
  }
  return order
}

function findStart(nodes: GraphNode[]): GraphNode | null {
  return nodes.find((node) => node.data?.type === "start") ?? null
}

export async function executeWorkflow(
  nodes: GraphNode[],
  edges: GraphEdge[]
): Promise<ExecutionResult> {
  const start = findStart(nodes)
  if (!start) {
    return {
      ok: false,
      sessionId: null,
      sessionUrl: null,
      steps: [],
      output: {},
      error: "Workflow has no Start node",
    }
  }

  const handle = await createStagehand()
  const page = await handle.stagehand.browser.context.activePage()
  if (!page) {
    await closeStagehand(handle)
    return {
      ok: false,
      sessionId: null,
      sessionUrl: null,
      steps: [],
      output: {},
      error: "Stagehand initialized without an active page",
    }
  }

  const sessionId = handle.browser.sessionId ?? null
  const sessionUrl = sessionId
    ? `https://www.browserbase.com/sessions/${sessionId}`
    : null

  const baseContext: NodeContext = {
    handle,
    page,
    sessionId,
    sessionUrl,
    variables: {},
    output: {},
  }

  const ordered = topologicalOrder(nodes, edges)
  const steps: ExecutionStep[] = []
  let context = baseContext
  let ok = true
  let firstError: string | undefined

  try {
    for (const node of ordered) {
      const type = node.data?.type
      if (!type || !(type in runners)) continue

      const parameters = (node.data?.parameters ?? {}) as NodeParameters
      const runner = runners[type]

      const passedParameters: NodeParameters = Object.fromEntries(
        Object.entries(parameters).map(([key, value]) => [
          key,
          resolveTemplates(String(value ?? ""), context),
        ])
      )

      const stepStart = performance.now()

      try {
        context = await runner(context, passedParameters)
        steps.push({
          nodeId: node.id,
          type,
          title: node.data?.title ?? nodeRegistry[type]?.name ?? type,
          ok: true,
          output: context.output,
          durationMs: Math.round(performance.now() - stepStart),
        })
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err)
        steps.push({
          nodeId: node.id,
          type,
          title: node.data?.title ?? nodeRegistry[type]?.name ?? type,
          ok: false,
          error: message,
          durationMs: Math.round(performance.now() - stepStart),
        })
        ok = false
        firstError = message
        break
      }
    }
  } finally {
    await closeStagehand(handle)
  }

  return {
    ok,
    sessionId,
    sessionUrl,
    steps,
    output: context.output,
    ...(firstError ? { error: firstError } : {}),
  }
}