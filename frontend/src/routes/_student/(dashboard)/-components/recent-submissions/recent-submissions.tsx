import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { $api } from "@/lib/api"
import { cva } from "class-variance-authority"
import { components } from "openapi/schema"
import { FC, Suspense } from "react"

export const RecentSubmissions = () => {
  const submissions = $api.useSuspenseQuery("get", "/api/submissions")

  return (
    <div className="flex flex-col justify-between">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>問題</TableHead>
            <TableHead>状態</TableHead>
            <TableHead>提出日時</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {submissions.data
            .filter((_, i) => i < 10)
            .map((submission) => (
              <Suspense fallback={<SubmissionLoading />} key={submission.id}>
                <Submission submission={submission} />
              </Suspense>
            ))}
        </TableBody>
      </Table>
    </div>
  )
}

const Submission: FC<{ submission: components["schemas"]["Submission"] }> = ({
  submission,
}) => {
  const problem = $api.useSuspenseQuery("get", "/api/problems/{problemId}", {
    params: { path: { problemId: submission.problem_id } },
  })

  return (
    <TableRow>
      <TableCell>{problem.data.title}</TableCell>
      <TableCell>
        <StatusBadge status={submission.result.status} />
      </TableCell>
      <TableCell>
        {new Date(submission.submitted_at).toLocaleString()}
      </TableCell>
    </TableRow>
  )
}

const SubmissionLoading: FC = () => {
  return (
    <TableRow>
      <TableCell>
        <Skeleton className="h-5 w-32" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-5 w-16" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-5 w-32" />
      </TableCell>
    </TableRow>
  )
}

type Status = components["schemas"]["SubmissionResult"]["status"]

const statusBadgeVariant = cva<{ status: Record<Status, string> }>(
  "font-bold text-white",
  {
    variants: {
      status: {
        Accepted: "bg-green-500 hover:bg-green-600",
        CompileError: "bg-orange-500 hover:bg-orange-600",
        RuntimeError: "bg-orange-500 hover:bg-orange-600",
        WrongAnswer: "bg-red-500 hover:bg-red-600",
      },
    },
  },
)

const StatusBadge: FC<{ status: Status }> = ({ status }) => {
  return <Badge className={statusBadgeVariant({ status })}>{status}</Badge>
}
