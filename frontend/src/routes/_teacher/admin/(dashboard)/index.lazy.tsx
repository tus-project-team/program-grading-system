import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createLazyFileRoute } from "@tanstack/react-router"

import { ProblemList } from "./-components/problem-list"
import { RecentSubmissions } from "./-components/recent-submissions"

const AdminDashboard = () => {
  return (
    <div className="container mx-auto p-6 @container">
      <h1 className="mb-6 text-2xl font-bold">Admin Dashboard</h1>
      <div className="grid grid-cols-2 gap-6 @3xl:grid-cols-4">
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle className="text-xl">最近作成した問題一覧</CardTitle>
          </CardHeader>
          <CardContent>
            <ProblemList />
          </CardContent>
        </Card>
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle className="text-xl">最近の提出</CardTitle>
          </CardHeader>
          <CardContent>
            <RecentSubmissions />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export const Route = createLazyFileRoute("/_teacher/admin/(dashboard)/")({
  component: AdminDashboard,
})
