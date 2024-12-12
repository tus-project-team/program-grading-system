import { $api } from "@/lib/api"
import { createLazyFileRoute } from "@tanstack/react-router"
import { toast } from "sonner"

import { ProblemForm } from "../-components/problem-form"

const Problem = () => {
  const { problemId } = Route.useParams()

  const problem = $api.useSuspenseQuery("get", "/api/problems/{problemId}", {
    params: {
      path: {
        problemId: Number.parseInt(problemId),
      },
    },
  })
  const updateProblem = $api.useMutation("put", "/api/problems/{problemId}")

  return (
    <div className="mx-auto w-full max-w-screen-xl px-4 py-6">
      <h1 className="mb-6 text-2xl font-semibold">問題の更新</h1>
      <ProblemForm
        onSubmit={(values) => {
          updateProblem.mutate({
            body: values,
            params: {
              path: {
                problemId: Number.parseInt(problemId),
              },
            },
          })
          toast("問題を更新しました", {
            closeButton: true,
          })
        }}
        problem={problem.data}
        submitButtonLabel="問題を更新"
        submitButtonSubmittingLabel="問題を更新中..."
      />
    </div>
  )
}

export const Route = createLazyFileRoute(
  "/_teacher/admin/problems/$problemId/",
)({
  component: Problem,
})
