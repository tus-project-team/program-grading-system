import { $api } from "@/lib/api"
import { createLazyFileRoute } from "@tanstack/react-router"
import { Suspense } from "react"

const Index = () => {
  return (
    <div className="p-2">
      <h1>Welcome Home!</h1>
      <Suspense fallback={<div>Loading...</div>}>
        <Problems />
      </Suspense>
    </div>
  )
}

const Problems = () => {
  const { data } = $api.useSuspenseQuery("get", "/api/problems/")
  return (
    <div className="p-2">
      <h3>Problems:</h3>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  )
}

export const Route = createLazyFileRoute("/")({
  component: Index,
})
