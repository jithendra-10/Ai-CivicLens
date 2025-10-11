'use client';

import type { Report } from '@/lib/types';
import { useCollection, useMemoFirebase, useFirestore } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { ReportsTable } from '@/components/authority/reports-table';
import { columns } from '@/components/authority/columns';
import Loading from '@/app/loading';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function AuthorityReportsPage() {
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

  return (
    <div className="container mx-auto">
       <div className="mb-8">
        <h1 className="text-3xl font-bold font-headline">Manage Reports</h1>
        <p className="text-muted-foreground">
          View, update, and resolve all submitted civic issues.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>All Submitted Reports</CardTitle>
          <CardDescription>
            Filter, sort, and manage all reports from citizens.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ReportsTable columns={columns} data={reports} />
        </CardContent>
      </Card>
    </div>
  );
}
