'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import type { Report } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';
import { AlertCircle, CheckCircle, Clock } from 'lucide-react';

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


export function RecentActivityTable({ reports }: { reports: Report[] }) {
  if (reports.length === 0) {
    return <p className="text-muted-foreground text-center py-8">You haven't reported any issues yet.</p>
  }
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Issue Type</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Last Updated</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {reports.map((report) => (
          <TableRow key={report.id}>
            <TableCell className="font-medium">{report.issueType}</TableCell>
            <TableCell>
              <Badge
                variant={statusDisplay[report.status].variant}
                className={statusDisplay[report.status].className}
              >
                {statusDisplay[report.status].icon}
                <span className="ml-1">{report.status}</span>
              </Badge>
            </TableCell>
            <TableCell className="text-right text-muted-foreground">
              {formatDistanceToNow(new Date(report.createdAt), {
                addSuffix: true,
              })}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
