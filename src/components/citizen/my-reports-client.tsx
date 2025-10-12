'use client';

import { useUser, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where, orderBy } from 'firebase/firestore';
import { useCollection } from '@/firebase/firestore/use-collection';
import type { Report } from '@/lib/types';
import Loading from '@/app/loading';
import { MyReportsTable } from './my-reports-table';
import { columns } from './my-reports-columns';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

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

  const { data: reports, isLoading: isReportsLoading } = useCollection<Report>(reportsQuery);

  if (isUserLoading || isReportsLoading || !reports) {
    return <Loading />;
  }

  return (
    <Card>
        <CardHeader>
            <CardTitle>Your Reports</CardTitle>
            <CardDescription>A list of all the civic issues you have submitted.</CardDescription>
        </CardHeader>
        <CardContent>
            <MyReportsTable columns={columns} data={reports} />
        </CardContent>
    </Card>
  );
}
