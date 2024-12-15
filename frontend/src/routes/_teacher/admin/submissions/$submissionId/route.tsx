import { $api, APIError } from "@/lib/api"
import { createFileRoute, notFound } from "@tanstack/react-router"

export const Route = createFileRoute(
  "/_teacher/admin/submissions/$submissionId",
)({
  loader: async ({ context: { queryClient }, params }) => {
    try {
      await queryClient.ensureQueryData(
        $api.queryOptions("get", "/api/submissions/{submissionId}", {
          params: {
            path: { submissionId: Number.parseInt(params.submissionId) },
          },
        }),
      )
    } catch (error) {
      if (error instanceof APIError && error.status === 404) {
        throw notFound({
          routeId: "/_teacher/admin/submissions/$submissionId",
        })
      }
      throw error
    }
  },
  notFoundComponent: () => {
    return "Submission not found"
  },
})
