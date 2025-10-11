'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Report } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { CitizenDataTableRowActions } from './citizen-data-table-row-actions';

const statusDisplay: {
  [key in Report['status']]: {
    icon: React.ReactNode;
    className: string;
    variant: 'default' | 'secondary' | 'destructive';
  };
} = {
  Submitted: {
    icon: <AlertCircle className="h-4 w-4" />,
    className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
    variant: 'default',
  },
  'In Progress': {
    icon: <Clock className="h-4 w-4" />,
    className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
    variant: 'secondary',
  },
  Resolved: {
    icon: <CheckCircle className="h-4 w-4" />,
    className: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
    variant: 'default',
  },
};

export const columns: ColumnDef<Report>[] = [
  {
    accessorKey: 'issueType',
    header: 'Issue',
    cell: ({ row }) => (
      <div className="capitalize font-medium">{row.getValue('issueType')}</div>
    ),
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.getValue('status') as Report['status'];
      const display = statusDisplay[status];
      return (
        <Badge
          variant={display.variant}
          className={display.className}
        >
          {display.icon}
          <span className="ml-1">{status}</span>
        </Badge>
      );
    },
  },
  {
    accessorKey: 'createdAt',
    header: 'Reported On',
    cell: ({ row }) => {
      const dateValue = row.getValue('createdAt') as string;
      return <div className="text-sm text-muted-foreground">{format(new Date(dateValue), 'MMM d, yyyy')}</div>;
    },
  },
  {
    id: 'actions',
    enableHiding: false,
    cell: ({ row }) => {
      return <CitizenDataTableRowActions row={row} />;
    },
  },
];
