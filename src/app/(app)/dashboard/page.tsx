import { getReports } from '@/lib/actions';
import { DashboardClient } from '@/components/authority/dashboard-client';

export default async function DashboardPage() {
  const reports = await getReports();

  return (
    <div className="container mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-headline">Authority Dashboard</h1>
        <p className="text-muted-foreground">
          View, manage, and resolve civic issues reported by citizens.
        </p>
      </div>
      <DashboardClient initialReports={reports} />
    </div>
  );
}
