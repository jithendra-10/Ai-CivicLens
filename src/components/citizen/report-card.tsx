import type { Report } from '@/lib/types';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { AlertCircle, CheckCircle, Clock } from 'lucide-react';

const statusMap: {
  [key in Report['status']]: {
    label: string;
    icon: React.ReactNode;
    color: string;
  };
} = {
  Submitted: { label: 'Submitted', icon: <AlertCircle className="h-4 w-4 mr-1.5" />, color: 'bg-blue-500' },
  'In Progress': { label: 'In Progress', icon: <Clock className="h-4 w-4 mr-1.5" />, color: 'bg-yellow-500' },
  Resolved: { label: 'Resolved', icon: <CheckCircle className="h-4 w-4 mr-1.5" />, color: 'bg-green-500' },
};


export function ReportCard({ report }: { report: Report }) {
    const statusInfo = statusMap[report.status];

  return (
    <Card className="flex flex-col overflow-hidden">
      <CardHeader className="p-0">
        <div className="relative aspect-video w-full">
            <Image
                src={report.imageUrl}
                alt={report.aiDescription}
                fill
                className="object-cover"
                data-ai-hint={report.imageHint}
            />
        </div>
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        <div className="flex justify-between items-start mb-2">
            <CardTitle className="text-lg font-headline mb-1">{report.issueType}</CardTitle>
            <Badge variant={report.severity === 'High' ? 'destructive' : report.severity === 'Medium' ? 'secondary' : 'default'}>
                {report.severity}
            </Badge>
        </div>
        <CardDescription className="line-clamp-3">{report.aiDescription}</CardDescription>
      </CardContent>
      <CardFooter className="p-4 bg-muted/50 flex justify-between items-center text-sm">
        <div className={`flex items-center text-white text-xs font-semibold px-2 py-1 rounded-full ${statusInfo.color}`}>
            {statusInfo.icon}
            <span>{statusInfo.label}</span>
        </div>
        <div className="text-muted-foreground">
            {formatDistanceToNow(new Date(report.createdAt), { addSuffix: true })}
        </div>
      </CardFooter>
    </Card>
  );
}
