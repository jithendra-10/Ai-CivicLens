import { AnalyticsDashboard } from '@/components/authority/analytics-dashboard';

export default async function AuthorityDashboardPage() {
  return (
    <div className="container mx-auto animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-headline">Authority Dashboard</h1>
        <p className="text-muted-foreground">
          Analyze, manage, and resolve civic issues reported by citizens.
        </p>
      </div>
      <AnalyticsDashboard />
    </div>
  );
}
