import { createLazyFileRoute } from "@tanstack/react-router"

export const Route = createLazyFileRoute("/_teacher/admin/(dashboard)/")({
  component: RouteComponent,
})

function RouteComponent() {
  return "Hello /(teacher)/admin/(dashboard)/!"
}
