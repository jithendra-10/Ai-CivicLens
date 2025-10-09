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
  // This is no longer the source of truth, but we keep it for now.
  return [];
}

export async function addReport(reportData: Omit<Report, 'reportId' | 'userId' | 'userFullName' | 'createdAt' | 'status'>): Promise<{ success: boolean, message: string, newReport?: Report }> {
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, message: 'Authentication required.' };
  }
  
  // This logic is now handled on the client with Firestore
  revalidatePath('/dashboard');

  return { success: true, message: 'Report submitted successfully!'};
}

export async function updateReport(reportId: string, status: Report['status']): Promise<{ success: boolean, message: string }> {
    const user = await getCurrentUser();
    if (!user || user.role !== 'authority') {
        return { success: false, message: 'Unauthorized.' };
    }

    // This logic is now handled on the client with Firestore
    revalidatePath('/dashboard');
    return { success: true, message: 'Report status updated.' };
}
