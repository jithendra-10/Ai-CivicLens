'use client';

import type { Report } from '@/lib/types';
import { useCollection, useMemoFirebase, useFirestore } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { ReportsTable } from './reports-table';
import { columns } from './columns';
import Loading from '@/app/loading';
import { StatCard } from './stat-card';
import { FileText, Clock, CheckCircle } from 'lucide-react';
import { AiSummary } from './ai-summary';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';

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
    return <Loading />;
  }

  const total = reports.length;
  const pending = reports.filter(r => r.status === 'Submitted' || r.status === 'In Progress').length;
  const resolved = reports.filter(r => r.status === 'Resolved').length;

  return (
    <Tabs defaultValue="overview" className="space-y-4">
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="reports">Manage Reports</TabsTrigger>
      </TabsList>
      <TabsContent value="overview" className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <StatCard icon={FileText} title="Total Reports" value={total} />
            <StatCard icon={Clock} title="Pending" value={pending} description="Submitted & In Progress" />
            <StatCard icon={CheckCircle} title="Resolved" value={resolved} />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <div className="lg:col-span-3">
                <AiSummary reports={reports} />
            </div>
            <Card className="lg:col-span-4">
                <CardHeader>
                    <CardTitle className="font-headline">Recent Reports</CardTitle>
                    <CardDescription>A quick look at the 5 most recently submitted issues.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ReportsTable columns={columns} data={reports.slice(0, 5)} />
                </CardContent>
            </Card>
        </div>
      </TabsContent>
      <TabsContent value="reports" className="space-y-4">
        <ReportsTable columns={columns} data={reports} />
      </TabsContent>
    </Tabs>
    );
}
