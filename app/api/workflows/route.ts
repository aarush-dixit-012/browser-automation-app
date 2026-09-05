import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import {
  createWorkflow,
  deleteWorkflow,
  getWorkflowById,
  getWorkflows,
  updateWorkflow,
} from "@/lib/actions/workflows"
import type { WorkflowGraph } from "@/lib/schema"

export async function GET(request: Request) {
  const { orgId } = await auth()
  if (!orgId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const url = new URL(request.url)
    const id = url.searchParams.get("id")
    if (id) {
      const workflow = await getWorkflowById(id)
      return NextResponse.json({ workflow })
    }
    const workflows = await getWorkflows()
    return NextResponse.json({ workflows })
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  const { orgId } = await auth()
  if (!orgId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = (await request.json()) as {
      title?: string
      graph?: WorkflowGraph
    }
    if (!body.title?.trim()) {
      return NextResponse.json(
        { error: "title is required" },
        { status: 400 }
      )
    }
    const workflow = await createWorkflow({
      title: body.title.trim(),
      graph: body.graph,
    })
    return NextResponse.json({ workflow }, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    )
  }
}

export async function PATCH(request: Request) {
  const { orgId } = await auth()
  if (!orgId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const url = new URL(request.url)
    const id = url.searchParams.get("id")
    if (!id) {
      return NextResponse.json(
        { error: "id query parameter is required" },
        { status: 400 }
      )
    }
    const body = (await request.json()) as {
      title?: string
      graph?: WorkflowGraph
    }
    const workflow = await updateWorkflow(id, body)
    return NextResponse.json({ workflow })
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  const { orgId } = await auth()
  if (!orgId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const url = new URL(request.url)
    const id = url.searchParams.get("id")
    if (!id) {
      return NextResponse.json(
        { error: "id query parameter is required" },
        { status: 400 }
      )
    }
    await deleteWorkflow(id)
    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    )
  }
}