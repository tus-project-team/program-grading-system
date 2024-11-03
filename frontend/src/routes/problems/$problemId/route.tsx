import { $api } from "@/lib/api"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/problems/$problemId")({
  loader: ({ context: { queryClient }, params }) => {
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
