'use client';

import type { Report } from '@/lib/types';
import { useCollection, useMemoFirebase, useFirestore } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { StatCard } from './stat-card';
import { FileText, Clock, CheckCircle } from 'lucide-react';
import { ConversationalAnalytics } from './conversational-analytics';
import { IssueTypeChart } from './issue-type-chart';
import { Skeleton } from '../ui/skeleton';
import { Card, CardContent, CardHeader } from '../ui/card';

function AnalyticsDashboardSkeleton() {
    return (
        <div className="space-y-4 animate-pulse">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <StatCard.Skeleton />
                <StatCard.Skeleton />
                <StatCard.Skeleton />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card>
                    <CardHeader>
                        <Skeleton className="h-6 w-1/3 mb-2" />
                        <Skeleton className="h-4 w-2/3" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-56 w-full" />
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <Skeleton className="h-6 w-1/3 mb-2" />
                        <Skeleton className="h-4 w-2/3" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-56 w-full" />
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

export function AnalyticsDashboard() {
  const firestore = useFirestore();

  const reportsQuery = useMemoFirebase(
    () =>
      firestore
        ? query(collection(firestore, 'reports'), orderBy('createdAt', 'desc'))
        : null,
    [firestore]
  );
  
  const { data: reports, isLoading } = useCollection<Report>(reportsQuery);

  if (isLoading || !reports) {
    return <AnalyticsDashboardSkeleton />;
  }

  const total = reports.length;
  const pending = reports.filter(r => r.status === 'Submitted' || r.status === 'In Progress').length;
  const resolved = reports.filter(r => r.status === 'Resolved').length;

  return (
    <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <StatCard icon={FileText} title="Total Reports" value={total} />
            <StatCard icon={Clock} title="Pending" value={pending} description="Submitted & In Progress" />
            <StatCard icon={CheckCircle} title="Resolved" value={resolved} />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <IssueTypeChart reports={reports} />
            <ConversationalAnalytics reports={reports} />
        </div>
    </div>
    );
}
