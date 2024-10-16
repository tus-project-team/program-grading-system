import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"
import { createLazyFileRoute } from "@tanstack/react-router"

import { CodePanel } from "./-components/code-panel"
import { InfoPanel } from "./-components/info-panel"
import { ProblemPanel } from "./-components/problem-panel"
import { ProblemProvider } from "./-contexts/problem-context"

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

export const Route = createLazyFileRoute("/problems/$problemId")({
  component: Problem,
  errorComponent: () => <div>Error</div>,
  pendingComponent: () => <div>Loading...</div>,
})
