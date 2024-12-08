import { createLazyFileRoute } from "@tanstack/react-router"

const Index = () => {
  return (
    <div className="p-2">
      <h1>Welcome Home!</h1>
    </div>
  )
}

export const Route = createLazyFileRoute("/(student)/(dashbord)/")({
  component: Index,
})
