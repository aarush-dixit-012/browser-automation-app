"use client"

import { memo } from "react"
import {
  Handle,
  NodeToolbar,
  Position,
  useReactFlow,
  type Node as ReactFlowNode,
  type NodeProps,
  type NodeTypes,
} from "@xyflow/react"
import {
  BotIcon,
  EyeIcon,
  FlagIcon,
  PlayIcon,
  SparklesIcon,
  Trash2Icon,
  ZapIcon,
  type LucideIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"

export type Node = {
  name: string
  parameters: Record<string, unknown>
  execution: (parameters: Record<string, unknown>) => void
}

export type StepNodeType =
  | "start"
  | "end"
  | "act"
  | "observe"
  | "agent"
  | "ai"

export type StepNodeData = {
  type: StepNodeType
  kind: "trigger" | "step"
  title: string
  parameters?: Record<string, string>
}

export type StepNode = ReactFlowNode<StepNodeData, StepNodeType>

export type NodeDefinition = Omit<Node, "execution"> & {
  type: StepNodeType
  kind: "trigger" | "step"
  icon: LucideIcon
  accent: string
}

export const nodeRegistry: Record<StepNodeType, NodeDefinition> = {
  start: {
    type: "start",
    name: "Start",
    kind: "trigger",
    parameters: {},
    icon: PlayIcon,
    accent: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  },
  end: {
    type: "end",
    name: "End",
    kind: "step",
    parameters: {},
    icon: FlagIcon,
    accent: "bg-rose-500/15 text-rose-600 dark:text-rose-400",
  },
  act: {
    type: "act",
    name: "Act",
    kind: "step",
    parameters: { text: "string" },
    icon: ZapIcon,
    accent: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
  },
  observe: {
    type: "observe",
    name: "Observe",
    kind: "step",
    parameters: { text: "string" },
    icon: EyeIcon,
    accent: "bg-violet-500/15 text-violet-600 dark:text-violet-400",
  },
  agent: {
    type: "agent",
    name: "Agent",
    kind: "step",
    parameters: { text: "string" },
    icon: BotIcon,
    accent: "bg-cyan-500/15 text-cyan-600 dark:text-cyan-400",
  },
  ai: {
    type: "ai",
    name: "AI",
    kind: "step",
    parameters: { text: "string" },
    icon: SparklesIcon,
    accent: "bg-fuchsia-500/15 text-fuchsia-600 dark:text-fuchsia-400",
  },
}

export function getNodeType(name: string): string {
  return name.toLowerCase()
}

export function getNodeLabel(type: string): string {
  return nodeRegistry[type as StepNodeType]?.name ?? "Node"
}

export function formatParameters(
  parameters: Record<string, unknown>
): string {
  const entries = Object.entries(parameters)
  if (entries.length === 0) return "No parameters"
  return entries.map(([key, value]) => `${key}: ${value}`).join(", ")
}

function StepNodeComponent({ id, data, selected }: NodeProps<StepNode>) {
  const { type, kind, title } = data
  const def = nodeRegistry[type]
  const Icon = def.icon
  const { deleteElements } = useReactFlow()

  // A trigger starts the flow and takes no input, so it has no target handle.
  const hasTarget = kind !== "trigger"

  return (
    <div>
      <NodeToolbar position={Position.Top} isVisible={selected} offset={12}>
        <button
          type="button"
          aria-label={`Delete ${title}`}
          onClick={() => deleteElements({ nodes: [{ id }] })}
          className="nodrag inline-flex size-7 items-center justify-center rounded-md border bg-background text-muted-foreground shadow-sm outline-none transition-colors hover:bg-destructive hover:text-destructive-foreground focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Trash2Icon className="size-4" />
        </button>
      </NodeToolbar>
      <div
        className={cn(
          "min-w-50 max-w-80 rounded-(--radius) border-2 border-border bg-card text-card-foreground",
          selected && "ring-2 ring-ring ring-offset-2 ring-offset-background"
        )}
      >
      {hasTarget && (
        <Handle
          type="target"
          position={Position.Left}
          style={{ transform: "translate(-100%, -50%)" }}
          className="h-3.5! w-1.5! min-w-0! rounded-l-xs! rounded-r-none! border-0! bg-border!"
        />
      )}

      <div className="flex items-center gap-2.5 px-3 py-2.5">
        <div
          className={cn(
            "flex size-7 shrink-0 items-center justify-center rounded-md",
            def.accent
          )}
        >
          <Icon className="size-4" />
        </div>
        <span className="text-sm font-semibold">{title}</span>
      </div>

      <Handle
        type="source"
        position={Position.Right}
        style={{ transform: "translate(100%, -50%)" }}
        className="h-3.5! w-1.5! min-w-0! rounded-l-none! rounded-r-xs! border-0! bg-border!"
      />
      </div>
    </div>
  )
}

export const StepNode = memo(StepNodeComponent)

export const nodeTypes = {
  start: StepNode,
  end: StepNode,
  act: StepNode,
  observe: StepNode,
  agent: StepNode,
  ai: StepNode,
} satisfies NodeTypes