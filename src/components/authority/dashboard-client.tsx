'use client';

import { useState } from 'react';
import type { Report } from '@/lib/types';
import { ReportsTable } from './reports-table';
import { columns } from './columns';

export function DashboardClient({ initialReports }: { initialReports: Report[] }) {
  const [reports, setReports] = useState<Report[]>(initialReports);

  // In a real app, you might have functions here to refetch or update reports
  // For now, we'll just pass the initial data down.

  return <ReportsTable columns={columns} data={reports} />;
}
