import "@/styles/global.css"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import { createRouter, RouterProvider } from "@tanstack/react-router"
import { StrictMode } from "react"
import ReactDOM from "react-dom/client"

// Import the generated route tree
import { routeTree } from "./route-tree.gen"

const queryClient = new QueryClient()

// Create a new router instance
const router = createRouter({
  context: { queryClient },
  defaultPreload: "intent",
  // Since we're using React Query, we don't want loader calls to ever be stale
  // This will ensure that the loader is always called when the route is preloaded or visited
  defaultPreloadStaleTime: 0,
  routeTree,
})

// Register the router instance for type safety
declare module "@tanstack/react-router" {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Register is merged with the existing interface
  interface Register {
    router: typeof router
  }
}

const enableMocking = async () => {
  if (
    import.meta.env.PROD ||
    import.meta.env.VITE_MSW_MOCK?.toLowerCase() === "false"
  ) {
    return
  }

  const { worker } = await import("./mocks/browser")

  // `worker.start()` returns a Promise that resolves
  // once the Service Worker is up and ready to intercept requests.
  return worker.start()
}

// Render the app
// eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- rootElement is always present
const rootElement = document.querySelector("#root")!
if (!rootElement.innerHTML) {
  await enableMocking()

  const root = ReactDOM.createRoot(rootElement)
  root.render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
        <ReactQueryDevtools buttonPosition="bottom-right" />
      </QueryClientProvider>
    </StrictMode>,
  )
}
