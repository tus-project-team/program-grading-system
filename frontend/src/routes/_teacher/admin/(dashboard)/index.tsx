import { $api, APIError } from "@/lib/api"
import { createFileRoute, notFound } from "@tanstack/react-router"

export const Route = createFileRoute("/_teacher/admin/(dashboard)/")({
  loader: async ({ context: { queryClient } }) => {
    try {
      await queryClient.ensureQueryData(
        $api.queryOptions("get", "/api/problems"),
      )
      await queryClient.ensureQueryData(
        $api.queryOptions("get", "/api/submissions"),
      )
    } catch (error) {
      if (error instanceof APIError && error.status === 404) {
        throw notFound({ routeId: "/_teacher/admin/(dashboard)/" })
      }
    }
  },
})
