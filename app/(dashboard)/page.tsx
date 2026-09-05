import Image from "next/image"
import { PlusIcon } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function Page() {
  return (
    <div className="flex flex-1 items-center justify-center p-6">
      <div className="flex max-w-sm flex-col items-center gap-4 text-center">
        <Image
          width={64}
          height={64}
          draggable={false}
          src="/icon.svg"
          alt="Zest"
          className="size-16 shrink-0 rounded-xl"
        />
        <div className="flex flex-col gap-1.5">
          <h1 className="text-lg font-semibold tracking-tight">
            No workflow selected
          </h1>
          <p className="text-sm text-muted-foreground">
            Select a workflow from the sidebar to get started, or create a new
            one to begin automating.
          </p>
        </div>
        <Button className="mt-1">
          <PlusIcon className="size-4" />
          Create workflow
        </Button>
      </div>
    </div>
  )
}