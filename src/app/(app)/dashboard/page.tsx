'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import {
  FileText,
  Clock,
  CheckCircle,
  BarChart,
  BrainCircuit,
  History,
} from 'lucide-react';
import { useUser, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import { useCollection } from '@/firebase/firestore/use-collection';
import type { Report } from '@/lib/types';
import { RecentActivityTable } from '@/components/citizen/recent-activity-table';
import { StatCard } from '@/components/citizen/stat-card';
import { Skeleton } from '@/components/ui/skeleton';
import AiAnimation from '@/components/ai-animation';

function DashboardSkeleton() {
  return (
    <div className="container mx-auto animate-pulse">
      <div className="mb-8">
        <Skeleton className="h-9 w-3/4 mb-2" />
        <Skeleton className="h-4 w-1/2" />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard.Skeleton />
        <StatCard.Skeleton />
        <StatCard.Skeleton />
        <StatCard.Skeleton />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-1/3 mb-2" />
              <Skeleton className="h-4 w-2/3" />
            </CardHeader>
            <CardContent>
              <RecentActivityTable.Skeleton />
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
               <Skeleton className="h-6 w-1/3 mb-2" />
            </CardHeader>
            <CardContent className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
               <Skeleton className="h-4 w-3/4" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function CitizenDashboardPage() {
  const { user } = useUser();
  const firestore = useFirestore();

  const reportsQuery = useMemoFirebase(
    () =>
      firestore && user
        ? query(
            collection(firestore, 'reports'),
            where('userId', '==', user.uid)
          )
        : null,
    [firestore, user]
  );

  const { data: reports, isLoading } = useCollection<Report>(reportsQuery);

  if (isLoading || !reports) {
    return <DashboardSkeleton />;
  }

  const total = reports.length;
  const submitted = reports.filter((r) => r.status === 'Submitted').length;
  const inProgress = reports.filter((r) => r.status === 'In Progress').length;
  const resolved = reports.filter((r) => r.status === 'Resolved').length;
  const recentReports = [...reports]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  return (
    <div className="container mx-auto animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-headline text-primary">
          AI CivicLens Dashboard
        </h1>
        <p className="text-muted-foreground">
          Your personal hub for civic engagement.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard icon={FileText} title="Total Reports" value={total} />
        <StatCard icon={Clock} title="Submitted" value={submitted} />
        <StatCard icon={BarChart} title="In Progress" value={inProgress} />
        <StatCard icon={CheckCircle} title="Resolved" value={resolved} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="font-headline">Recent Activity</CardTitle>
                <CardDescription>
                  The latest updates on your submitted reports.
                </CardDescription>
              </div>
              <Button asChild variant="outline">
                <Link href="/my-reports">View All</Link>
              </Button>
            </CardHeader>
            <CardContent>
              <RecentActivityTable reports={recentReports} />
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="bg-primary/5 border-primary/20">
            <CardHeader>
              <CardTitle className="font-headline flex items-center gap-2">
                <AiAnimation className="w-8 h-8" />
                <span>AI Insight</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                You've reported{' '}
                <span className="font-bold text-primary">{total}</span> issues.
                Keep up the great work! Your contributions are helping to build a
                better community. The most common issue you report is{' '}
                <span className="font-bold text-primary">Potholes</span>.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
        <Button asChild size="lg">
          <Link href="/report">Report New Issue</Link>
        </Button>
        <Button asChild size="lg" variant="outline">
          <Link href="/my-reports">View All My Reports</Link>
        </Button>
      </div>
    </div>
  );
}
