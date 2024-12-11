import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useEffect, useState } from "react"

type Submission = {
  id: number
  problemTitle: string
  status: "処理中" | "失敗" | "成功"
  submittedAt: string
}

export const RecentSubmissions = () => {
  const [submissions, setSubmissions] = useState<Submission[]>([])

  useEffect(() => {
    // ここで最近の提出を取得するAPIを呼び出す
    // 仮のデータを使用
    setSubmissions([
      {
        id: 1,
        problemTitle: "問題1",
        status: "成功",
        submittedAt: "2023-05-01 10:00",
      },
      {
        id: 2,
        problemTitle: "問題2",
        status: "失敗",
        submittedAt: "2023-05-02 11:30",
      },
      {
        id: 3,
        problemTitle: "問題3",
        status: "処理中",
        submittedAt: "2023-05-03 14:15",
      },
    ])
  }, [])

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>問題</TableHead>
          <TableHead>状態</TableHead>
          <TableHead>提出日時</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {submissions.map((submission) => (
          <TableRow key={submission.id}>
            <TableCell>{submission.problemTitle}</TableCell>
            <TableCell>
              <Badge
                variant={
                  submission.status === "成功"
                    ? "outline" // todo: change color
                    : submission.status === "失敗"
                      ? "destructive"
                      : "default"
                }
              >
                {submission.status}
              </Badge>
            </TableCell>
            <TableCell>{submission.submittedAt}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
