import type { FC } from "react"

import { Button } from "@/components/ui/button"
import { $api } from "@/lib/api"
import { cn } from "@/lib/utils"
import { intlFormatDistance } from "date-fns"
import { CheckIcon, XIcon } from "lucide-react"
import { components } from "openapi/schema"

import { useProblem } from "../../-contexts/problem-context"

type Submission = components["schemas"]["Submission"]

export type SubmissionsProps = {
  className?: string
}

export const Submissions: FC<SubmissionsProps> = ({ className }) => {
  const { problem } = useProblem()
  const { data: submissions } = $api.useSuspenseQuery(
    "get",
    "/api/problems/{id}/submissions",
    {
      params: { path: { id: problem.id } },
    },
  )

  return (
    <div className={cn("grid grid-cols-[auto_1fr_auto]", className)}>
      {submissions?.map((submission) => (
        <Button
          className="col-span-3 grid grid-cols-subgrid"
          key={submission.id}
          onClick={() => {
            // todo: Display submission details
            alert("WIP: Display submission details")
          }}
          size="sm"
          variant="ghost"
        >
          <div className="flex flex-row gap-1">
            <StatusIcon status={submission.result.status} />
            <span className="font-semibold">{submission.result.status}</span>
          </div>
          <div>{submission.result.message}</div>
          <div className="text-right text-muted-foreground">
            {intlFormatDistance(new Date(submission.submitted_at), new Date())}
          </div>
        </Button>
      ))}
    </div>
  )
}

type StatusIconProps = {
  className?: string
  status: Submission["result"]["status"]
}

const StatusIcon: FC<StatusIconProps> = ({ className, status }) => {
  switch (status) {
    case "Accepted":
      return (
        <CheckIcon
          className={cn("text-green-600 dark:text-green-400", className)}
        />
      )
    default:
      return (
        <XIcon className={cn("text-red-600 dark:text-red-400", className)} />
      )
  }
}
