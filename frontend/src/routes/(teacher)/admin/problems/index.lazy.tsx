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

type Problem = components["schemas"]["Problem"]

const columnHelper = createColumnHelper<Problem>()

const columns = [
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
      <div className="w-40 truncate" title={info.getValue()}>
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
      <Button asChild size="sm" variant="outline">
        <Link to={`/admin/problems/${info.row.original.id}`}>View Details</Link>
      </Button>
    ),
    id: "actions",
  }),
]

const ProblemList = () => {
  const problems = $api.useSuspenseQuery("get", "/api/problems")

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

export const Route = createLazyFileRoute("/(teacher)/admin/problems/")({
  component: ProblemList,
})
