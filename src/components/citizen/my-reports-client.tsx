'use client';

import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, orderBy } from 'firebase/firestore';
import type { Report } from '@/lib/types';
import { MyReportCard } from './my-report-card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ListOrdered } from 'lucide-react';
import Loading from '@/app/loading';

export function MyReportsClient() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  const reportsQuery = useMemoFirebase(
    () =>
      firestore && user
        ? query(
            collection(firestore, 'reports'),
            where('userId', '==', user.uid),
            orderBy('createdAt', 'desc')
          )
        : null,
    [firestore, user]
  );

  const { data: reports, isLoading: areReportsLoading } =
    useCollection<Report>(reportsQuery);

  if (isUserLoading || areReportsLoading) {
    return <Loading />;
  }

  if (!reports || reports.length === 0) {
    return (
      <Alert>
        <ListOrdered className="h-4 w-4" />
        <AlertTitle>No Reports Yet!</AlertTitle>
        <AlertDescription>
          You haven't submitted any reports. Once you do, they will appear here.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {reports.map((report) => (
        <MyReportCard key={report.id} report={report} />
      ))}
    </div>
  );
}
