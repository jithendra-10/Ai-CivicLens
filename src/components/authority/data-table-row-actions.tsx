'use client';

import { Row } from '@tanstack/react-table';
import { MoreHorizontal, Pen } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Report } from '@/lib/types';
import { useState } from 'react';
import { ReportDetailsDialog } from './report-details-dialog';

interface DataTableRowActionsProps<TData> {
  row: Row<TData>;
}

export function DataTableRowActions<TData>({
  row,
}: DataTableRowActionsProps<TData>) {
  const report = row.original as Report;
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  return (
    <>
      <ReportDetailsDialog
        report={report}
        isOpen={isDetailsOpen}
        setIsOpen={setIsDetailsOpen}
      />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
          >
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[160px]">
          <DropdownMenuItem onClick={() => setIsDetailsOpen(true)}>
            <Pen className="mr-2 h-4 w-4" />
            View & Edit
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
