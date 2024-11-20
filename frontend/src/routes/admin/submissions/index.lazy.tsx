import { useState, useMemo } from "react"
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table"
import { ChevronDown, ChevronUp } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { createLazyFileRoute } from "@tanstack/react-router"
import { $api } from "@/lib/api"
import { cn } from "@/lib/utils"
import { components } from "openapi/schema"

type Submission = components["schemas"]["Submission"]

const columnHelper = createColumnHelper<Submission>()

export default function SubmissionList() {
  const [selectedSubmission, setSelectedSubmission] =
    useState<Submission | null>(null)
  const submissions = $api.useSuspenseQuery("get", "/api/submissions")

  const columns = useMemo(
    () => [
      columnHelper.accessor("id", {
        header: "ID",
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor("student_id", {
        header: "Student ID",
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor("problem_id", {
        header: "Problem ID",
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor("language", {
        header: "Language",
        cell: (info) => `${info.getValue().name} ${info.getValue().version}`,
      }),
      columnHelper.accessor("submitted_at", {
        header: "Submitted At",
        cell: (info) => formatDate(info.getValue()),
      }),
      columnHelper.accessor("result.status", {
        header: "Status",
        cell: (info) => (
          <Badge className={cn(getStatusColor(info.getValue()), "transition-colors duration-200")}>
            {info.getValue()}
          </Badge>
        ),
      }),
      columnHelper.display({
        id: "actions",
        cell: (info) => (
          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedSubmission(info.row.original)}
              >
                View Details
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>Submission Details</DialogTitle>
              </DialogHeader>
              {selectedSubmission && (
                <SubmissionDetails submission={selectedSubmission} />
              )}
            </DialogContent>
          </Dialog>
        ),
      }),
    ],
    [selectedSubmission],
  )

  const table = useReactTable({
    data: submissions.data,
    columns,
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
      <h1 className="text-2xl font-bold mb-4">Submission List</h1>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="px-4 py-2">
                    {header.isPlaceholder ? null : (
                      <div
                        {...{
                          className: header.column.getCanSort()
                            ? "cursor-pointer select-none"
                            : "",
                          onClick: header.column.getToggleSortingHandler(),
                        }}
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                        {{
                          asc: <ChevronUp className="ml-2 h-4 w-4 inline" />,
                          desc: <ChevronDown className="ml-2 h-4 w-4 inline" />,
                        }[header.column.getIsSorted() as string] ?? null}
                      </div>
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
                  <TableCell key={cell.id} className="px-4 py-2">
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
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
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
      <h3 className="text-lg font-semibold mb-2">Code</h3>
      <ScrollArea className="h-40 rounded-md border p-4">
        <pre className="text-sm">{submission.code}</pre>
      </ScrollArea>
      <h3 className="text-lg font-semibold mt-4 mb-2">Test Results</h3>
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
                  className={
                    cn(result.status === "Passed" ? "bg-green-500 hover:bg-green-400" : "bg-red-500 hover:bg-red-400", "transition-colors duration-200")
                  }
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
    case "Accepted":
      return "bg-green-500 hover:bg-green-400"
    case "WrongAnswer":
      return "bg-yellow-500 hover:bg-yellow-400"
    case "RuntimeError":
    case "CompileError":
      return "bg-red-500 hover:bg-red-400"
    default:
      return "bg-gray-500 hover:bg-gray-400"
  }
}

export const Route = createLazyFileRoute("/admin/submissions/")({
  component: SubmissionList,
})
