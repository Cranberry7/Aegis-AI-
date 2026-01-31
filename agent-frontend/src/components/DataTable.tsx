import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { useEffect, useState } from 'react';
import { axiosBackendInstance } from '@/utils/axiosInstance';
import { DateRange } from 'react-day-picker';
import { RefreshCcw, Trash2Icon } from 'lucide-react';
import { ConfirmDialog } from './ConfirmDialog';

export function DataTable<T extends { id: string }>(
  columnsDef: ColumnDef<T>[],
  route: string,
  filters?: Partial<T & { date: DateRange }>,
  hasDelete?: boolean,
  handleDelete?: (ids: string[]) => Promise<void>,
  reloadKey?: number,
) {
  const [paginatedData, setPaginatedData] = useState<T[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [totalRows, setTotalRows] = useState<number>(0);
  const [spinning, setSpinning] = useState<boolean>(false);
  const totalPages = Math.ceil(totalRows / rowsPerPage)
    ? Math.ceil(totalRows / rowsPerPage)
    : 1;

  const handleData = async () => {
    const currentData = (await getData()) as T[];
    setPaginatedData(currentData);
  };

  const getData = async () => {
    const fetchedData = await axiosBackendInstance.get(route, {
      params: {
        skip: (currentPage - 1) * rowsPerPage,
        limit: rowsPerPage,
        filters: filters,
      },
    });
    setTotalRows(fetchedData.data.data.numberOfRows);

    // Ensure non-existing rows are not selected
    setSelectedRows((prev) => {
      return prev.filter((id) =>
        fetchedData.data.data.rows
          .map((row: any) => String(row.id))
          .includes(id),
      );
    });

    return fetchedData.data.data.rows;
  };

  const handleRowsPerPageChange = (value: string) => {
    setRowsPerPage(Number(value));
    setCurrentPage(1);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRows(paginatedData.map((row) => String(row.id)));
    } else {
      setSelectedRows([]);
    }
  };

  const handleSelectRow = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedRows((prev) => [...prev, String(id)]);
    } else {
      setSelectedRows((prev) => prev.filter((rowId) => rowId !== String(id)));
    }
  };

  const handleDeleteSelected = async () => {
    await handleDelete?.(selectedRows);
    setSelectedRows([]);
    await handleData(); // reload data
  };

  const handleDeleteRow = async (id: string) => {
    await handleDelete?.([id]);
    await handleData(); //reload
  };

  const columns: ColumnDef<T>[] = [
    {
      id: 'select',
      header: () => (
        <Checkbox
          checked={
            paginatedData.length > 0 &&
            paginatedData.every((value) =>
              selectedRows.includes(String(value.id)),
            )
          }
          onCheckedChange={(checked) => handleSelectAll(checked as boolean)}
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={selectedRows.includes(String(row.original.id))}
          onCheckedChange={(checked) => {
            handleSelectRow(row.original.id, checked as boolean);
          }}
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    ...columnsDef,
    {
      accessorKey: 'actions',
      header: () => {
        if (hasDelete) {
          return (
            <div className="flex justify-center">
              <Button variant="ghost">Actions</Button>
            </div>
          );
        } else {
          return <></>;
        }
      },
      cell: ({ row }) => {
        if (hasDelete) {
          return (
            <div className="flex justify-center shrink">
              <ConfirmDialog
                trigger={
                  <Button className="w-9 bg-accent">
                    <Trash2Icon strokeWidth={3} className="text-red-500" />
                  </Button>
                }
                description="This will permanently delete the row."
                onConfirm={() => handleDeleteRow(row.original.id)}
              />
            </div>
          );
        } else {
          return <></>;
        }
      },
    },
  ];

  const table = useReactTable({
    data: paginatedData,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  useEffect(() => {
    handleData();
  }, [currentPage, rowsPerPage, filters, reloadKey]);

  return (
    <div className="w-full p-3">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={'header_' + headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.original.id}>
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
              <TableRow key={'no-results'}>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}

            <TableRow key={'footer'}>
              <TableCell colSpan={columns.length}>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground flex items-center gap-4">
                    {selectedRows.length} of {totalRows} row(s) selected.
                    {selectedRows.length > 0 && hasDelete && (
                      <ConfirmDialog
                        trigger={
                          <Button variant="destructive" size="sm">
                            Delete selected
                          </Button>
                        }
                        description="This will permanently delete all documents."
                        onConfirm={handleDeleteSelected}
                      />
                    )}
                  </div>
                  <div className="flex items-center space-x-6">
                    <Button
                      className="bg-transparent text-black dark:text-white hover:bg-accent w-fit"
                      variant="ghost"
                      onClick={() => {
                        handleData();
                        setSpinning(true);
                        setTimeout(() => setSpinning(false), 1000);
                      }}
                    >
                      <RefreshCcw
                        strokeWidth={3}
                        className={spinning ? 'animate-spin' : ''}
                      />
                    </Button>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">Rows per page</p>
                      <Select
                        value={rowsPerPage.toString()}
                        onValueChange={handleRowsPerPageChange}
                      >
                        <SelectTrigger className="h-8 w-[80px]">
                          <SelectValue placeholder={rowsPerPage.toString()} />
                        </SelectTrigger>
                        <SelectContent side="top">
                          {[10, 20, 30, 40].map((pageSize) => (
                            <SelectItem
                              key={pageSize}
                              value={pageSize.toString()}
                            >
                              {pageSize}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex w-[100px] items-center justify-center text-sm font-medium">
                      Page {currentPage} of {totalPages}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() =>
                          setCurrentPage((prev) => Math.max(prev - 1, 1))
                        }
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() =>
                          setCurrentPage((prev) =>
                            Math.min(prev + 1, totalPages),
                          )
                        }
                        disabled={currentPage === totalPages}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
