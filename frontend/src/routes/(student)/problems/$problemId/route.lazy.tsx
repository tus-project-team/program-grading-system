import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"
import { APIError } from "@/lib/api"
import { useQueryErrorResetBoundary } from "@tanstack/react-query"
import {
  createLazyFileRoute,
  ErrorRouteComponent,
  Link,
  NotFoundRouteComponent,
  useRouter,
} from "@tanstack/react-router"
import { RefreshCcwIcon } from "lucide-react"
import { useEffect } from "react"

import { CodePanel } from "./-components/code-panel"
import { InfoPanel } from "./-components/info-panel"
import { ProblemPanel } from "./-components/problem-panel"
import { ProblemProvider } from "./-context/problem-context"

const Problem = () => {
  const { problemId } = Route.useParams()

  return (
    <ProblemProvider problemId={Number.parseInt(problemId)}>
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel defaultSize={40}>
          <ProblemPanel />
        </ResizablePanel>
        <ResizableHandle />
        <ResizablePanel defaultSize={60}>
          <ResizablePanelGroup direction="vertical">
            <ResizablePanel defaultSize={75}>
              <CodePanel />
            </ResizablePanel>
            <ResizableHandle />
            <ResizablePanel defaultSize={25}>
              <InfoPanel />
            </ResizablePanel>
          </ResizablePanelGroup>
        </ResizablePanel>
      </ResizablePanelGroup>
    </ProblemProvider>
  )
}

const ProblemError: ErrorRouteComponent = ({ error }) => {
  const router = useRouter()
  const queryErrorResetBoundary = useQueryErrorResetBoundary()

  useEffect(() => {
    queryErrorResetBoundary.reset()
  }, [queryErrorResetBoundary])

  const message = error.message
  const body = error instanceof APIError ? error.body : undefined

  return (
    <div className="mx-auto flex h-full max-w-screen-sm flex-col items-center justify-center gap-6 text-center">
      <section className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">{message}</h1>
          <p className="text-muted-foreground">
            An error occurred while fetching the problem.
          </p>
        </div>
        <Button
          className="w-full"
          onClick={() => router.invalidate()}
          variant="default"
        >
          <RefreshCcwIcon className="mr-2 h-4 w-4" />
          Retry
        </Button>
      </section>
      {body && (
        <Accordion className="w-full" collapsible type="single">
          <AccordionItem className="border-0" value="error-message">
            <AccordionTrigger className="justify-center gap-2 text-muted-foreground">
              Error message
            </AccordionTrigger>
            <AccordionContent>
              <pre className="text-left">
                {JSON.stringify(body, undefined, 2)}
              </pre>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      )}
    </div>
  )
}

const ProblemNotFound: NotFoundRouteComponent = () => {
  const { problemId } = Route.useParams()

  return (
    <div className="flex h-full flex-col items-center justify-center gap-6 text-center">
      <section className="space-y-2">
        <h1 className="text-2xl font-bold">Problem not found</h1>
        <p className="text-muted-foreground">
          The problem with ID <code>{problemId}</code> does not exist.
        </p>
      </section>
      <Button asChild variant="link">
        <Link to="/problems">Back to problems</Link>
      </Button>
    </div>
  )
}

export const Route = createLazyFileRoute("/problems/$problemId")({
  component: Problem,
  errorComponent: ProblemError,
  notFoundComponent: ProblemNotFound,
  pendingComponent: () => <div>Loading...</div>,
})
