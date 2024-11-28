import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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
import { createLazyFileRoute, Link } from "@tanstack/react-router"
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

type Submission = components["schemas"]["Submission"]

const columnHelper = createColumnHelper<Submission>()

const columns = [
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
      <Button asChild size="sm" variant="outline">
        <Link to={`/admin/submissions/${info.row.original.id}`}>
          View Details
        </Link>
      </Button>
    ),
    id: "actions",
  }),
]

export default function SubmissionList() {
  const submissions = $api.useSuspenseQuery("get", "/api/submissions")

  const table = useReactTable({
    columns,
    data: submissions.data,
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

export const Route = createLazyFileRoute("/admin/submissions/")({
  component: SubmissionList,
})
