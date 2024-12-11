import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createLazyFileRoute } from "@tanstack/react-router"

import { ProblemList } from "./-components/problem-list"
import { ProgressOverview } from "./-components/progress-overview"
import { RecentSubmissions } from "./-components/recent-submissions"

const Index = () => {
  return (
    <div className="@container container mx-auto p-6">
      <h1 className="mb-6 text-3xl font-bold">Dashboard</h1>
      <div className="@3xl:grid-cols-4 grid grid-cols-2 gap-6">
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>問題一覧</CardTitle>
          </CardHeader>
          <CardContent>
            <ProblemList />
          </CardContent>
        </Card>
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>最近の提出</CardTitle>
          </CardHeader>
          <CardContent>
            <RecentSubmissions />
          </CardContent>
        </Card>
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>進捗概要</CardTitle>
          </CardHeader>
          <CardContent>
            <ProgressOverview />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export const Route = createLazyFileRoute("/_student/(dashboard)/")({
  component: Index,
})
