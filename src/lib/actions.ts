'use server';

import { revalidatePath } from 'next/cache';
import { reports as initialReports, users } from './data';
import type { Report } from './types';
import { getCurrentUser } from './auth';

// This is a server-side in-memory store. It's not suitable for production.
// In a real app, this would be a database.
let mockReports: Report[] = [...initialReports];

export async function getReports(): Promise<Report[]> {
  // In a real app, you'd fetch this from a database.
  // We add a small delay to simulate network latency.
  await new Promise(resolve => setTimeout(resolve, 500));
  return mockReports.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function addReport(reportData: Omit<Report, 'reportId' | 'userId' | 'userFullName' | 'createdAt' | 'status'>): Promise<{ success: boolean, message: string, newReport?: Report }> {
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, message: 'Authentication required.' };
  }

  const newReport: Report = {
    ...reportData,
    reportId: `rep-${Date.now()}`, // More unique ID
    userId: user.uid,
    userFullName: user.fullName,
    createdAt: new Date().toISOString(),
    status: 'Submitted',
  };

  // We can't reliably update server-side memory in a serverless environment for this demo.
  // So, we'll return the new report and let the client handle adding it to its state.
  // mockReports.unshift(newReport); 

  revalidatePath('/dashboard');

  return { success: true, message: 'Report submitted successfully!', newReport };
}

export async function updateReport(reportId: string, status: Report['status']): Promise<{ success: boolean, message: string }> {
    const user = await getCurrentUser();
    if (!user || user.role !== 'authority') {
        return { success: false, message: 'Unauthorized.' };
    }

    const reportIndex = mockReports.findIndex(r => r.reportId === reportId);
    if (reportIndex !== -1) {
        mockReports[reportIndex].status = status;
        mockReports[reportIndex].authorityId = user.uid;
    }

    revalidatePath('/dashboard');
    return { success: true, message: 'Report status updated.' };
}
