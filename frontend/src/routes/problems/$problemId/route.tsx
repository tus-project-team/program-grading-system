import { $api } from "@/lib/api"
import { QueryClient } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"

const queryClient = new QueryClient()

export const Route = createFileRoute("/problems/$problemId")({
  loader: ({ params }) => {
    queryClient.ensureQueryData(
      $api.queryOptions("get", "/api/problems/{problemId}", {
        params: {
          path: { problemId: Number.parseInt(params.problemId) },
        },
      }),
    )
    queryClient.ensureQueryData(
      $api.queryOptions("get", "/api/problems/{problemId}/submissions", {
        params: {
          path: { problemId: Number.parseInt(params.problemId) },
        },
      }),
    )
  },
})
