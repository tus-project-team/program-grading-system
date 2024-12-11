import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { APIError } from "@/lib/api"
import { useQueryErrorResetBoundary } from "@tanstack/react-query"
import { createLazyFileRoute } from "@tanstack/react-router"
import { useRouter } from "@tanstack/react-router"
import { Link } from "@tanstack/react-router"
import { RefreshCcwIcon } from "lucide-react"
import { useEffect } from "react"

import { useProblemsContext } from "./-contexts"
import { ProblemsProvider } from "./-contexts/problems-context"

const ProblemList = () => {
  const { problems } = useProblemsContext()

  if (problems.isLoading) {
    return <p>Loading...</p>
  }

  if (problems.isError && problems.error) {
    return <ProblemError error={problems.error} />
  }

  const problemData = problems.data || []

  return (
    <div className="p-4">
      <h1 className="mb-4 text-lg font-bold">問題一覧</h1>
      <Card>
        <table className="min-w-full border-collapse border border-gray-300 bg-white">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 px-4 py-2 font-semibold">
                問題ID
              </th>
              <th className="border border-gray-300 px-4 py-2 font-semibold">
                問題名
              </th>
            </tr>
          </thead>
          <tbody>
            {problemData.map((problem) => (
              <tr key={problem.id}>
                <td className="border border-gray-300 px-4 py-2">
                  {problem.id}
                </td>
                <td className="border border-gray-300 px-4 py-2 text-blue-500 underline">
                  <Link to={`/problems/${problem.id}`}>{problem.title}</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  )
}

const ProblemError = ({ error }: { error: APIError }) => {
  const router = useRouter()
  const queryErrorResetBoundary = useQueryErrorResetBoundary()

  useEffect(() => {
    queryErrorResetBoundary.reset()
  }, [queryErrorResetBoundary])

  const message = error.message
  const body = error.body

  return (
    <div className="mx-auto flex h-full max-w-screen-sm flex-col items-center justify-center gap-6 text-center">
      <section className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">{message}</h1>
          <p className="text-muted-foreground">
            An error occurred while fetching the problems.
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

const Problems = () => {
  return (
    <ProblemsProvider>
      <ProblemList />
    </ProblemsProvider>
  )
}

export const Route = createLazyFileRoute("/problems")({
  component: Problems,
})
