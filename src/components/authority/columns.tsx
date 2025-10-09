'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Report } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { DataTableRowActions } from './data-table-row-actions';
import { Button } from '../ui/button';
import { ArrowUpDown, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { format } from 'date-fns';

const severityMap: {
  [key in Report['severity']]: {
    variant: 'destructive' | 'secondary' | 'default';
    className: string;
  };
} = {
  High: { variant: 'destructive', className: '' },
  Medium: { variant: 'secondary', className: 'bg-yellow-500/80 text-secondary-foreground hover:bg-yellow-500' },
  Low: { variant: 'default', className: 'bg-green-500/80 text-primary-foreground hover:bg-green-500' },
};

const statusIconMap: {
    [key in Report['status']]: React.ReactNode;
} = {
    'Submitted': <AlertCircle className="mr-2 h-4 w-4 text-blue-500" />,
    'In Progress': <Clock className="mr-2 h-4 w-4 text-yellow-500" />,
    'Resolved': <CheckCircle className="mr-2 h-4 w-4 text-green-500" />,
}

export const columns: ColumnDef<Report>[] = [
  {
    accessorKey: 'issueType',
    header: 'Issue Type',
    cell: ({ row }) => (
      <div className="capitalize font-medium">{row.getValue('issueType')}</div>
    ),
  },
  {
    accessorKey: 'severity',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Severity
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const severity = row.getValue('severity') as Report['severity'];
      const { variant, className } = severityMap[severity];
      return <Badge variant={variant} className={className}>{severity}</Badge>;
    },
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.getValue('status') as Report['status'];
      return (
        <div className="flex items-center">
        {statusIconMap[status]}
        <span>{status}</span>
        </div>
      );
    },
    filterFn: (row, id, value) => {
        return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: 'createdAt',
    header: 'Reported On',
    cell: ({ row }) => {
      return (
        <div className="text-sm text-muted-foreground">
          {format(new Date(row.getValue('createdAt')), 'MMM d, yyyy')}
        </div>
      );
    },
  },
  {
    accessorKey: 'userFullName',
    header: 'Reported By',
  },
  {
    id: 'actions',
    enableHiding: false,
    cell: ({ row }) => {
      return <DataTableRowActions row={row} />;
    },
  },
];
