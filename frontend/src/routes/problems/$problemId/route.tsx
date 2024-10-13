import { $api } from "@/lib/api"
import { QueryClient } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"

const queryClient = new QueryClient()

export const Route = createFileRoute("/problems/$problemId")({
  loader: ({ params }) => {
    queryClient.ensureQueryData(
      $api.queryOptions("get", "/api/problems/{id}", {
        params: {
          path: { id: Number.parseInt(params.problemId) },
        },
      }),
    )
    queryClient.ensureQueryData(
      $api.queryOptions("get", "/api/problems/{id}/submissions", {
        params: {
          path: { id: Number.parseInt(params.problemId) },
        },
      }),
    )
  },
})
