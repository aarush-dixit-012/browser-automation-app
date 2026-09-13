import { executeWorkflow } from "../features/workflows/execute"

const nodes = [
  {
    id: "start-1",
    type: "start",
    position: { x: 0, y: 0 },
    data: { type: "start", kind: "trigger", title: "Start" },
  },
  {
    id: "open-1",
    type: "open-url",
    position: { x: 160, y: 0 },
    data: {
      type: "open-url",
      kind: "step",
      title: "Open URL",
      parameters: { url: "https://example.com" },
    },
  },
  {
    id: "extract-1",
    type: "extract",
    position: { x: 320, y: 0 },
    data: {
      type: "extract",
      kind: "step",
      title: "Extract title and heading",
      parameters: {
        instruction: "extract the page title and the main heading",
        fields: JSON.stringify({
          title: "the page <title>",
          heading: "the main h1 heading on the page",
        }),
      },
    },
  },
  {
    id: "end-1",
    type: "end",
    position: { x: 480, y: 0 },
    data: { type: "end", kind: "step", title: "End" },
  },
] as never

const edges = [
  { id: "e1", source: "start-1", target: "open-1" },
  { id: "e2", source: "open-1", target: "extract-1" },
  { id: "e3", source: "extract-1", target: "end-1" },
] as never

async function main(): Promise<void> {
  const result = await executeWorkflow(nodes, edges)
  console.log(JSON.stringify(result, null, 2))
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
