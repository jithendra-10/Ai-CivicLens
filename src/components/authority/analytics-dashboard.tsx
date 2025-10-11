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
    <div className="space-y-8">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <StatCard icon={FileText} title="Total Reports" value={total} />
            <StatCard icon={Clock} title="Pending" value={pending} description="Submitted & In Progress" />
            <StatCard icon={CheckCircle} title="Resolved" value={resolved} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
                <AiSummary reports={reports} />
            </div>
            <div className="lg:col-span-2">
                <ReportsTable columns={columns} data={reports} />
            </div>
        </div>
    </div>
    );
}
