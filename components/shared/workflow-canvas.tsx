"use client"

import { useEffect, useState } from "react"
import { useTheme } from "@teispace/next-themes"
import {
  Background,
  BackgroundVariant,
  Controls,
  ReactFlow,
  addEdge,
  useEdgesState,
  useNodesState,
  type Connection,
  type Edge,
  type Node,
  type OnConnect,
} from "@xyflow/react"
import "@xyflow/react/dist/style.css"

const EMPTY_NODE_PLACEMENT: Node[] = [
  {
    id: "trigger-1",
    position: { x: 120, y: 120 },
    data: { label: "Trigger" },
  },
]

export function WorkflowCanvas({
  initialNodes,
  initialEdges,
}: {
  initialNodes: Node[]
  initialEdges: Edge[]
}) {
  const { resolvedTheme } = useTheme()
  const [hasMounted, setHasMounted] = useState(false)
  const [nodes, , onNodesChange] = useNodesState(
    initialNodes.length > 0 ? initialNodes : EMPTY_NODE_PLACEMENT
  )
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)

  useEffect(() => {
    setHasMounted(true)
  }, [])

  const onConnect: OnConnect = (connection: Connection) => {
    setEdges((currentEdges) => addEdge(connection, currentEdges))
  }

  if (!hasMounted) {
    return <div className="h-full w-full" />
  }

  return (
    <div className="h-full w-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        colorMode={resolvedTheme === "dark" ? "dark" : "light"}
        fitView
        minZoom={0.2}
        maxZoom={2}
        defaultEdgeOptions={{ type: "smoothstep", animated: true }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1.5}
        />
        <Controls position="bottom-right" showInteractive={false} />
      </ReactFlow>
    </div>
  )
}