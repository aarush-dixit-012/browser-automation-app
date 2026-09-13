import { executeWorkflow } from "../features/workflows/execute"

const nodes = [
  {
    id: "start-1",
    type: "start",
    position: { x: 0, y: 0 },
    data: { type: "start", kind: "trigger", title: "Start" },
  },
  {
    id: "agent-1",
    type: "agent",
    position: { x: 200, y: 0 },
    data: {
      type: "agent",
      kind: "step",
      title: "Agent",
      parameters: {
        task: "go to example.com and return the main h1 heading text",
        maxSteps: "10",
      },
    },
  },
  {
    id: "end-1",
    type: "end",
    position: { x: 400, y: 0 },
    data: { type: "end", kind: "step", title: "End" },
  },
] as never

const edges = [
  { id: "e1", source: "start-1", target: "agent-1" },
  { id: "e2", source: "agent-1", target: "end-1" },
] as never

async function main(): Promise<void> {
  const result = await executeWorkflow(nodes, edges)
  console.log(JSON.stringify(result, null, 2))
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
