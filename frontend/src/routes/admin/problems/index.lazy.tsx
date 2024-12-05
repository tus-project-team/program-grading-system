import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { $api } from "@/lib/api"
import { cn } from "@/lib/utils"
import { createLazyFileRoute } from "@tanstack/react-router"
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { ChevronDown, ChevronUp } from "lucide-react"
import { useMemo, useState } from "react"

// 問題の型定義（API仕様に基づく）
type Problem = {
  id: number
  body: string
  title: string
  supported_languages: { name: string; version: string }[]
  test_cases: { test_case_id: string; input: string; expected_output: string }[]
}

const columnHelper = createColumnHelper<Problem>()

export default function ProblemList() {
  const [selectedProblem, setSelectedProblem] = useState<Problem | undefined>()
  const problems = $api.useSuspenseQuery("get", "/api/problems")

  // テーブルの列定義
  const columns = useMemo(
    () => [
      columnHelper.accessor("id", {
        cell: (info) => info.getValue(),
        header: "ID",
      }),
      columnHelper.accessor("title", {
        cell: (info) => info.getValue(),
        header: "Title",
      }),
      columnHelper.accessor("body", {
        cell: (info) => (
          <div className="truncate w-40" title={info.getValue()}>
            {info.getValue()}
          </div>
        ),
        header: "Description",
      }),
      columnHelper.accessor("supported_languages", {
        cell: (info) =>
          info
            .getValue()
            .map((lang) => `${lang.name} ${lang.version}`)
            .join(", "),
        header: "Supported Languages",
      }),
      columnHelper.display({
        cell: (info) => (
          <Dialog>
            <DialogTrigger asChild>
              <Button
                onClick={() => setSelectedProblem(info.row.original)}
                size="sm"
                variant="outline"
              >
                View Details
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>Problem Details</DialogTitle>
              </DialogHeader>
              {selectedProblem && (
                <ProblemDetails problem={selectedProblem} />
              )}
            </DialogContent>
          </Dialog>
        ),
        id: "actions",
      }),
    ],
    [selectedProblem]
  )

  const table = useReactTable({
    columns,
    data: problems.data,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  })

  return (
    <div className="container mx-auto p-4">
      <h1 className="mb-4 text-2xl font-bold">Problem List</h1>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead className="px-4 py-2" key={header.id}>
                    {header.isPlaceholder ? undefined : (
                      <button
                        className={cn(
                          "flex flex-row items-center gap-1",
                          header.column.getCanSort()
                            ? "cursor-pointer select-none"
                            : ""
                        )}
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        {{
                          asc: <ChevronUp className="ml-2 inline h-4 w-4" />,
                          desc: <ChevronDown className="ml-2 inline h-4 w-4" />,
                        }[header.column.getIsSorted() as string] ?? undefined}
                      </button>
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell className="px-4 py-2" key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <Button
          disabled={!table.getCanPreviousPage()}
          onClick={() => table.previousPage()}
          size="sm"
          variant="outline"
        >
          Previous
        </Button>
        <Button
          disabled={!table.getCanNextPage()}
          onClick={() => table.nextPage()}
          size="sm"
          variant="outline"
        >
          Next
        </Button>
      </div>
    </div>
  )
}

// 詳細表示用コンポーネント
function ProblemDetails({ problem }: { problem: Problem }) {
  return (
    <div className="mt-4">
      <h3 className="mb-2 text-lg font-semibold">Description</h3>
      <p>{problem.body}</p>
      <h3 className="mb-2 mt-4 text-lg font-semibold">Test Cases</h3>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Test Case ID</TableHead>
            <TableHead>Input</TableHead>
            <TableHead>Expected Output</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {problem.test_cases.map((testCase) => (
            <TableRow key={testCase.test_case_id}>
              <TableCell>{testCase.test_case_id}</TableCell>
              <TableCell>{testCase.input}</TableCell>
              <TableCell>{testCase.expected_output}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}