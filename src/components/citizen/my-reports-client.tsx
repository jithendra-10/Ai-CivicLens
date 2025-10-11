'use client';

import { useUser, useFirestore, useMemoFirebase, useCollection } from '@/firebase';
import { collection, query, where, orderBy } from 'firebase/firestore';
import type { Report } from '@/lib/types';
import Loading from '@/app/loading';
import { MyReportsTable } from './my-reports-table';
import { columns } from './my-reports-columns';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';

export function MyReportsClient() {
  const { user } = useUser();
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

  const { data: reports, isLoading } = useCollection<Report>(reportsQuery);

  if (isLoading || !reports) {
    return <Loading />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>All My Reports</CardTitle>
        <CardDescription>
            A complete history of your submissions.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <MyReportsTable columns={columns} data={reports} />
      </CardContent>
    </Card>
  );
}
