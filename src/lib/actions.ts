'use server';

import { revalidatePath } from 'next/cache';
import { reports, users } from './data';
import type { Report } from './types';
import { getCurrentUser } from './auth';

let mockReports: Report[] = [...reports];

export async function getReports(): Promise<Report[]> {
  // In a real app, you'd fetch this from a database.
  // We add a small delay to simulate network latency.
  await new Promise(resolve => setTimeout(resolve, 500));
  return mockReports.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function addReport(data: Omit<Report, 'reportId' | 'userId' | 'userFullName' | 'createdAt' | 'status'>): Promise<{ success: boolean, message: string }> {
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, message: 'Authentication required.' };
  }

  const newReport: Report = {
    ...data,
    reportId: `rep-${String(mockReports.length + 1).padStart(3, '0')}`,
    userId: user.uid,
    userFullName: user.fullName,
    createdAt: new Date().toISOString(),
    status: 'Submitted',
  };

  mockReports.unshift(newReport);
  revalidatePath('/dashboard');
  revalidatePath('/report');

  return { success: true, message: 'Report submitted successfully!' };
}

export async function updateReport(reportId: string, status: 'In Progress' | 'Resolved', resolvedImageUrl?: string, resolvedImageHint?: string): Promise<{ success: boolean, message: string }> {
    const user = await getCurrentUser();
    if (!user || user.role !== 'authority') {
        return { success: false, message: 'Unauthorized.' };
    }

    const reportIndex = mockReports.findIndex(r => r.reportId === reportId);
    if (reportIndex === -1) {
        return { success: false, message: 'Report not found.' };
    }

    mockReports[reportIndex] = {
        ...mockReports[reportIndex],
        status,
        resolvedImageUrl: resolvedImageUrl ?? mockReports[reportIndex].resolvedImageUrl,
        resolvedImageHint: resolvedImageHint ?? mockReports[reportIndex].resolvedImageHint,
        authorityId: user.uid,
    };

    revalidatePath('/dashboard');
    return { success: true, message: 'Report status updated.' };
}
