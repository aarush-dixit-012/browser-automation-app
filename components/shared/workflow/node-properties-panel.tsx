"use client"

import { useState } from "react"
import { XIcon } from "lucide-react"
import { Panel } from "@xyflow/react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  nodeRegistry,
  type StepNode,
} from "@/components/shared/workflow/nodes"

export function NodePropertiesPanel({
  node,
  onSave,
  onClose,
}: {
  node: StepNode
  onSave: (values: Record<string, string>) => void
  onClose: () => void
}) {
  const def = nodeRegistry[node.data.type]
  const [values, setValues] = useState<Record<string, string>>(() => {
    const existing = (node.data.parameters ?? {}) as Record<string, string>
    return Object.fromEntries(
      Object.keys(def?.parameters ?? {}).map((key) => [key, existing[key] ?? ""])
    )
  })

  if (!def || Object.keys(def.parameters).length === 0) return null

  const Icon = def.icon

  return (
    <Panel position="bottom-left" className="m-3">
      <div className="w-72 rounded-xl border bg-background/95 p-4 shadow-lg backdrop-blur">
        <div className="mb-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div
              className={cn(
                "flex size-7 shrink-0 items-center justify-center rounded-md",
                def.accent
              )}
            >
              <Icon className="size-4" />
            </div>
            <h2 className="text-sm font-semibold">{def.name}</h2>
          </div>
          <button
            type="button"
            aria-label={`Close ${def.name} properties`}
            onClick={onClose}
            className="inline-flex size-6 items-center justify-center rounded-md text-muted-foreground outline-none transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring"
          >
            <XIcon className="size-4" />
          </button>
        </div>
        <div className="flex flex-col gap-3">
          {Object.entries(def.parameters).map(([key, type]) => (
            <label key={key} className="grid gap-1">
              <span className="text-xs font-medium capitalize text-muted-foreground">
                {key}
              </span>
              <input
                type="text"
                value={values[key] ?? ""}
                placeholder={`${String(type)}`}
                onChange={(event) =>
                  setValues((current) => ({
                    ...current,
                    [key]: event.target.value,
                  }))
                }
                className="w-full rounded-md border border-border bg-transparent px-2.5 py-1.5 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
              />
            </label>
          ))}
          <Button type="button" className="mt-1" onClick={() => onSave(values)}>
            Save
          </Button>
        </div>
      </div>
    </Panel>
  )
}