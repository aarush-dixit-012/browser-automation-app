"use client"

import { useCallback, useEffect, useState, type DragEvent } from "react"
import { useTheme } from "@teispace/next-themes"
import {
  BoxesIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
} from "lucide-react"
import {
  Background,
  BackgroundVariant,
  Controls,
  Panel,
  ReactFlow,
  addEdge,
  useEdgesState,
  useNodesState,
  useReactFlow,
  type Connection,
  type Edge,
  type Node,
  type OnConnect,
  type OnSelectionChangeFunc,
} from "@xyflow/react"
import "@xyflow/react/dist/style.css"
import { cn } from "@/lib/utils"
import { NodePropertiesPanel } from "@/components/shared/workflow/node-properties-panel"
import {
  nodeRegistry,
  nodeTypes,
  type StepNode,
  type StepNodeData,
  type StepNodeType,
} from "@/components/shared/workflow/nodes"

const EMPTY_NODE_PLACEMENT: Node[] = [
  {
    id: "start-1",
    type: "start",
    position: { x: 120, y: 120 },
    data: { type: "start", kind: "trigger", title: "Start" },
  },
]

function WorkflowCanvasInner({
  initialNodes,
  initialEdges,
}: {
  initialNodes: Node[]
  initialEdges: Edge[]
}) {
  const { resolvedTheme } = useTheme()
  const { screenToFlowPosition } = useReactFlow()
  const [hasMounted, setHasMounted] = useState(false)
  const [paletteOpen, setPaletteOpen] = useState(true)
  const [search, setSearch] = useState("")
  const [selectedNode, setSelectedNode] = useState<StepNode | null>(null)
  const paletteNodes = Object.values(nodeRegistry)
  const filteredNodes = paletteNodes.filter((node) =>
    node.name.toLowerCase().includes(search.trim().toLowerCase())
  )
  const [nodes, setNodes, onNodesChange] = useNodesState(
    initialNodes.length > 0 ? initialNodes : EMPTY_NODE_PLACEMENT
  )
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHasMounted(true)
  }, [])

  const onConnect: OnConnect = useCallback(
    (connection: Connection) => {
      setEdges((currentEdges) => addEdge(connection, currentEdges))
    },
    [setEdges]
  )

  const onSelectionChange = useCallback<OnSelectionChangeFunc>(
    ({ nodes }) => {
      setSelectedNode(nodes[0] ? (nodes[0] as StepNode) : null)
    },
    []
  )

  const handleSaveNodeParameters = useCallback(
    (nodeId: string, values: Record<string, string>) => {
      setNodes((currentNodes) =>
        currentNodes.map((currentNode) => {
          if (currentNode.id !== nodeId) return currentNode
          const data = currentNode.data as StepNodeData
          return {
            ...currentNode,
            data: {
              ...data,
              parameters: { ...(data.parameters ?? {}), ...values },
            },
          }
        })
      )
      setSelectedNode(null)
    },
    [setNodes]
  )

  const onDragOver = useCallback((event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = "move"
  }, [])

  const onDrop = useCallback(
    (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault()
      const nodeType = event.dataTransfer.getData(
        "application/reactflow"
      ) as StepNodeType
      const definition = nodeRegistry[nodeType]
      if (!definition) return

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      })

      const newNode: Node = {
        id: `${nodeType}-${crypto.randomUUID()}`,
        type: nodeType,
        position: {
          x: position.x + Math.random() * 40,
          y: position.y + Math.random() * 40,
        },
        data: {
          type: nodeType,
          kind: definition.kind,
          title: definition.name,
        },
      }

      setNodes((currentNodes) => currentNodes.concat(newNode))
    },
    [screenToFlowPosition, setNodes]
  )

  if (!hasMounted) {
    return <div className="h-full w-full" />
  }

  return (
    <div className="h-full w-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onSelectionChange={onSelectionChange}
        onDragOver={onDragOver}
        onDrop={onDrop}
        colorMode={resolvedTheme === "dark" ? "dark" : "light"}
        fitView
        minZoom={0.2}
        maxZoom={2}
        deleteKeyCode={["Backspace", "Delete"]}
        defaultEdgeOptions={{ type: "smoothstep", animated: true }}
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1.5} />
        <Panel position="top-right" className="m-3">
          {paletteOpen ? (
            <div className="flex w-60 flex-col gap-2 rounded-xl border bg-background/95 p-2 shadow-lg backdrop-blur">
              <div className="flex items-center justify-between px-1">
                <p className="text-xs font-medium text-muted-foreground">
                  Node palette
                </p>
                <button
                  type="button"
                  aria-label="Collapse node palette"
                  onClick={() => setPaletteOpen(false)}
                  className="inline-flex size-6 items-center justify-center rounded-md text-muted-foreground outline-none transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <ChevronsRightIcon className="size-4" />
                </button>
              </div>
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search nodes..."
                className="w-full rounded-md border border-border bg-transparent px-2.5 py-1.5 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
              />
              {filteredNodes.length === 0 ? (
                <p className="px-2 py-3 text-center text-xs text-muted-foreground">
                  No nodes found
                </p>
              ) : (
                filteredNodes.map((node) => {
                  const Icon = node.icon
                  return (
                    <button
                      key={node.type}
                      type="button"
                      draggable
                      onDragStart={(event) => {
                        event.dataTransfer.setData(
                          "application/reactflow",
                          node.type
                        )
                        event.dataTransfer.effectAllowed = "move"
                      }}
                      className="group flex w-full cursor-grab items-center gap-3 rounded-lg border border-transparent px-2.5 py-2 text-left outline-none transition-colors hover:border-accent hover:bg-accent active:cursor-grabbing focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <span
                        className={cn(
                          "flex size-7 shrink-0 items-center justify-center rounded-md",
                          node.accent
                        )}
                      >
                        <Icon className="size-4" />
                      </span>
                      <span className="flex min-w-0 flex-col">
                        <span className="text-sm font-medium">{node.name}</span>
                      </span>
                    </button>
                  )
                })
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1 rounded-xl border bg-background/95 p-1.5 shadow-lg backdrop-blur">
              <button
                type="button"
                aria-label="Expand node palette"
                onClick={() => setPaletteOpen(true)}
                className="flex w-full flex-col items-center gap-2 rounded-lg px-1 py-2 text-xs font-medium text-muted-foreground outline-none transition-colors hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
              >
                <BoxesIcon className="size-5" />
                <ChevronsLeftIcon className="size-3.5" />
                <span className="[writing-mode:vertical-rl]">Nodes</span>
              </button>
            </div>
          )}
        </Panel>
        <Controls position="bottom-right" showInteractive={false} />
        {selectedNode &&
        Object.keys(nodeRegistry[selectedNode.data.type]?.parameters ?? {})
          .length > 0 ? (
          <NodePropertiesPanel
            key={selectedNode.id}
            node={selectedNode}
            onSave={(values) =>
              handleSaveNodeParameters(selectedNode.id, values)
            }
            onClose={() => setSelectedNode(null)}
          />
        ) : null}
      </ReactFlow>
    </div>
  )
}

export function WorkflowCanvas({
  initialNodes,
  initialEdges,
}: {
  initialNodes: Node[]
  initialEdges: Edge[]
}) {
  return (
    <WorkflowCanvasInner
      initialNodes={initialNodes}
      initialEdges={initialEdges}
    />
  )
}