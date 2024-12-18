import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { ComponentPropsWithoutRef, memo } from "react"

type DataTableProps<TData, TValue> = ComponentPropsWithoutRef<"div"> & {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
}

export const DataTable = memo(
  <TData, TValue>({
    children,
    className,
    columns,
    data,
    ...props
  }: DataTableProps<TData, TValue>) => {
    const table = useReactTable({
      columns,
      data,
      getCoreRowModel: getCoreRowModel(),
    })

    return (
      <div className={cn("rounded-md border", className)} {...props}>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const className =
                    header.column.columnDef.meta != undefined &&
                    "className" in header.column.columnDef.meta
                      ? String(header.column.columnDef.meta.className)
                      : ""
                  return (
                    <TableHead className={className} key={header.id}>
                      {header.isPlaceholder
                        ? undefined
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  data-state={row.getIsSelected() && "selected"}
                  key={row.id}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  className="h-24 text-center"
                  colSpan={columns.length}
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        {children}
      </div>
    )
  },
)
DataTable.displayName = "DataTable"
