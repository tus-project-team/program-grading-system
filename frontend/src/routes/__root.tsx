import { Toaster } from "@/components/ui/sonner"
import { QueryClient } from "@tanstack/react-query"
import { createRootRouteWithContext, Outlet } from "@tanstack/react-router"
import { TanStackRouterDevtools } from "@tanstack/router-devtools"

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient
}>()({
  component: () => (
    <>
      <Outlet />
      <Toaster />
      <TanStackRouterDevtools />
    </>
  ),
  notFoundComponent: () => {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-6 text-center">
        <section className="space-y-2">
          <h1 className="text-2xl font-bold">Page not found</h1>
          <p className="text-muted-foreground">
            The page you are looking for does not exist.
          </p>
        </section>
      </div>
    )
  }
})
