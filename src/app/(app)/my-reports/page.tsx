import { MyReportsClient } from '@/components/citizen/my-reports-client';

export default function MyReportsPage() {
  return (
    <div className="container mx-auto animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-headline">My Submitted Reports</h1>
        <p className="text-muted-foreground">
          Here you can view and manage all the issues you've reported.
        </p>
      </div>
      <MyReportsClient />
    </div>
  );
}
