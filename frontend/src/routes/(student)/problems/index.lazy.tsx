import { createLazyFileRoute } from "@tanstack/react-router"

// todo: implement Problems
const Problems = () => {
  return "Hello /problems!"
}

export const Route = createLazyFileRoute("/(student)/problems/")({
  component: Problems,
})
