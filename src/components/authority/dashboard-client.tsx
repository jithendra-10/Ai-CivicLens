'use client';

import type { Report } from '@/lib/types';
import { ReportsTable } from './reports-table';
import { columns } from './columns';
import { useCollection, useMemoFirebase, useFirestore } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import Loading from '@/app/loading';

export function DashboardClient() {
  const firestore = useFirestore();

  const reportsQuery = useMemoFirebase(
    () =>
      firestore
        ? query(collection(firestore, 'reports'), orderBy('createdAt', 'desc'))
        : null,
    [firestore]
  );
  
  const { data: reports, isLoading } = useCollection<Report>(reportsQuery);

  if (isLoading) {
    return <Loading />;
  }

  return <ReportsTable columns={columns} data={reports || []} />;
}
