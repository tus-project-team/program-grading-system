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
import { components } from "openapi/schema"
import { useMemo, useState } from "react"

type Submission = components["schemas"]["Submission"]

const columnHelper = createColumnHelper<Submission>()

export default function ProblemList() {
  const [selectedProblems, setSelectedProblems] = useState<
    Submission | undefined
  >()
  const problems = $api.useSuspenseQuery("get", "/api/problems")

  const columns = useMemo(
    () => [
      columnHelper.accessor("id", {
        cell: (info) => info.getValue(),
        header: "ID",
      }),
      columnHelper.accessor("student_id", {
        cell: (info) => info.getValue(),
        header: "Student ID",
      }),
      columnHelper.accessor("problem_id", {
        cell: (info) => info.getValue(),
        header: "Problem ID",
      }),
      columnHelper.accessor("language", {
        cell: (info) => `${info.getValue().name} ${info.getValue().version}`,
        header: "Language",
      }),
      columnHelper.accessor("submitted_at", {
        cell: (info) => formatDate(info.getValue()),
        header: "Submitted At",
      }),
      columnHelper.accessor("result.status", {
        cell: (info) => (
          <Badge
            className={cn(
              getStatusColor(info.getValue()),
              "transition-colors duration-200",
            )}
          >
            {info.getValue()}
          </Badge>
        ),
        header: "Status",
      }),
      columnHelper.display({
        cell: (info) => (
          <Dialog>
            <DialogTrigger asChild>
              <Button
                onClick={() => setSelectedProblems(info.row.original)}
                size="sm"
                variant="outline"
              >
                View Details
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>Submission Details</DialogTitle>
              </DialogHeader>
              {selectedProblems && (
                <SubmissionDetails submission={selectedProblems} />
              )}
            </DialogContent>
          </Dialog>
        ),
        id: "actions",
      }),
    ],
    [selectedProblems],
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
      <h1 className="mb-4 text-2xl font-bold">Submission List</h1>
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
                            : "",
                        )}
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
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

function SubmissionDetails({ submission }: { submission: Submission }) {
  return (
    <div className="mt-4">
      <h3 className="mb-2 text-lg font-semibold">Code</h3>
      <ScrollArea className="h-40 rounded-md border p-4">
        <pre className="text-sm">{submission.code}</pre>
      </ScrollArea>
      <h3 className="mb-2 mt-4 text-lg font-semibold">Test Results</h3>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Test Case ID</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Message</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {submission.test_results.map((result) => (
            <TableRow key={result.test_case_id}>
              <TableCell>{result.test_case_id}</TableCell>
              <TableCell>
                <Badge
                  className={cn(
                    result.status === "Passed"
                      ? "bg-green-500 hover:bg-green-400"
                      : "bg-red-500 hover:bg-red-400",
                    "transition-colors duration-200",
                  )}
                >
                  {result.status}
                </Badge>
              </TableCell>
              <TableCell>{result.message || "-"}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleString()
}

function getStatusColor(status: string) {
  switch (status) {
    case "Accepted": {
      return "bg-green-500 hover:bg-green-400"
    }
    case "CompileError":
    case "RuntimeError": {
      return "bg-red-500 hover:bg-red-400"
    }
    case "WrongAnswer": {
      return "bg-yellow-500 hover:bg-yellow-400"
    }
    default: {
      return "bg-gray-500 hover:bg-gray-400"
    }
  }
}

export const Route = createLazyFileRoute("/admin/problems/")({
  component: ProblemList,
})
