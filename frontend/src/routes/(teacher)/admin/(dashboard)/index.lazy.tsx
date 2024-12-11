import { createLazyFileRoute } from "@tanstack/react-router"

export const Route = createLazyFileRoute("/(teacher)/admin/(dashboard)/")({
  component: RouteComponent,
})

function RouteComponent() {
  return "Hello /(teacher)/admin/(dashboard)/!"
}
