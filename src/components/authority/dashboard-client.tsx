'use client';

import { useState, useEffect } from 'react';
import type { Report } from '@/lib/types';
import { ReportsTable } from './reports-table';
import { columns } from './columns';
import { reports as initialReportsData } from '@/lib/data';

export function DashboardClient({ initialReports }: { initialReports: Report[] }) {
  const [reports, setReports] = useState<Report[]>(initialReports);

  useEffect(() => {
    // On the client, merge initial server data with localStorage data
    const storedReportsString = localStorage.getItem('reports');
    if (storedReportsString) {
      try {
        const storedReports = JSON.parse(storedReportsString);
        // Create a map of initial reports to avoid duplicates
        const reportMap = new Map(initialReports.map(r => [r.reportId, r]));
        // Add stored reports that are not already in the initial list
        storedReports.forEach((report: Report) => {
            if (!reportMap.has(report.reportId)) {
                reportMap.set(report.reportId, report);
            }
        });
         const combinedReports = Array.from(reportMap.values());
         combinedReports.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
         setReports(combinedReports);
      } catch (e) {
        console.error("Failed to parse reports from localStorage", e);
        // If parsing fails, initialize localStorage with server data
        localStorage.setItem('reports', JSON.stringify(initialReports));
      }
    } else {
        // If no reports in localStorage, initialize it with the server-side reports
        localStorage.setItem('reports', JSON.stringify(initialReportsData));
    }
  }, [initialReports]);


  return <ReportsTable columns={columns} data={reports} />;
}
