import { $api, APIError } from "@/lib/api"
import { createFileRoute, notFound } from "@tanstack/react-router"

export const Route = createFileRoute("/admin/problems/$problemId/")({
  loader: async ({ context: { queryClient }, params }) => {
    try {
      await queryClient.ensureQueryData(
        $api.queryOptions("get", "/api/problems/{problemId}", {
          params: {
            path: { problemId: Number.parseInt(params.problemId) },
          },
        }),
      )
    } catch (error) {
      if (error instanceof APIError && error.status === 404) {
        throw notFound({ routeId: "/admin/problems/$problemId/" })
      }
      throw error
    }
  },
})