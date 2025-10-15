import { AnalyticsDashboard } from '@/components/authority/analytics-dashboard';
import { BrainCircuit } from 'lucide-react';

export default async function AuthorityDashboardPage() {
  return (
    <div className="animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
      <div className="bg-slate-900 -m-8 -mt-8 p-8 rounded-b-3xl shadow-lg">
        <div className="container mx-auto">
          <div className="mb-8 flex items-center gap-2">
            <BrainCircuit className="w-8 h-8 text-primary/80 animate-ai-pulse" />
            <div>
              <h1 className="text-3xl font-bold font-headline text-primary-foreground">Authority Dashboard</h1>
              <p className="text-muted-foreground">
                Analyze, manage, and resolve civic issues reported by citizens.
              </p>
            </div>
          </div>
          <AnalyticsDashboard />
        </div>
      </div>
      {/* Add more content for the main area below if needed */}
    </div>
  );
}
