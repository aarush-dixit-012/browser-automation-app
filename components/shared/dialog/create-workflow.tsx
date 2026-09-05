"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { PlusIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import { useApp } from "@/components/providers/app-context"

export function CreateWorkflowDialog({
  trigger,
}: {
  trigger?: React.ReactElement
}) {
  const router = useRouter()
  const { createWorkflow } = useApp()
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState("")
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!title.trim() || submitting) return

    setSubmitting(true)
    try {
      const workflow = await createWorkflow({ title: title.trim() })
      setOpen(false)
      setTitle("")
      router.push(`/workflows/${workflow.id}`)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          trigger ?? (
            <Button className="mt-1">
              <PlusIcon />
              Create workflow
            </Button>
          )
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create workflow</DialogTitle>
          <DialogDescription>
            Give your new workflow a title to get started.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid gap-2">
            <Label htmlFor="workflow-title">Title</Label>
            <Input
              id="workflow-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="e.g., Order processing"
              autoFocus
              disabled={submitting}
            />
          </div>
          <DialogFooter showCloseButton>
            <Button type="submit" disabled={submitting || !title.trim()}>
              {submitting ? <Spinner className="size-3.5" /> : null}
              {submitting ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}