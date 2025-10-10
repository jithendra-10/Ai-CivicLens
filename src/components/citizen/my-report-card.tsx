'use client';

import type { Report } from '@/lib/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { cva } from 'class-variance-authority';
import { AlertCircle, CheckCircle, Clock } from 'lucide-react';

const statusStyles = cva('flex items-center gap-2 capitalize', {
  variants: {
    status: {
      Submitted: 'text-blue-600',
      'In Progress': 'text-yellow-600',
      Resolved: 'text-green-600',
    },
  },
});

const statusIcons: Record<Report['status'], React.ReactNode> = {
    Submitted: <AlertCircle className="h-4 w-4" />,
    'In Progress': <Clock className="h-4 w-4" />,
    Resolved: <CheckCircle className="h-4 w-4" />,
}

export function MyReportCard({ report }: { report: Report }) {
  const formattedDate = formatDistanceToNow(new Date(report.createdAt), {
    addSuffix: true,
  });

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle className="font-headline">{report.issueType}</CardTitle>
        <CardDescription>
          Reported {formattedDate}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow space-y-4">
        <div className="relative aspect-video w-full">
          <Image
            src={report.imageUrl}
            alt={report.aiDescription}
            fill
            className="rounded-md object-cover"
          />
        </div>
        <p className="text-sm text-muted-foreground">{report.aiDescription}</p>
      </CardContent>
      <CardFooter className="flex justify-between items-center">
        <div className={statusStyles({ status: report.status })}>
            {statusIcons[report.status]}
            <span className="font-medium">{report.status}</span>
        </div>
        <Badge variant={report.severity === 'High' ? 'destructive' : 'secondary'}>{report.severity}</Badge>
      </CardFooter>
    </Card>
  );
}
