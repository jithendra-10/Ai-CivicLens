import { ReportForm } from '@/components/citizen/report-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BrainCircuit } from 'lucide-react';

export default function ReportPage() {
  return (
    <div className="container mx-auto animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
       <div className="mb-8 flex items-center gap-2">
        <BrainCircuit className="w-8 h-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold font-headline">Report a New Issue</h1>
          <p className="text-muted-foreground">
            Upload an image of a civic issue, and our AI will help categorize it for you.
          </p>
        </div>
      </div>
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
            <CardTitle className="font-headline">Submit a Report</CardTitle>
            <CardDescription>Fill in the details below. Start by uploading a photo.</CardDescription>
        </CardHeader>
        <CardContent>
            <ReportForm />
        </CardContent>
      </Card>
    </div>
  );
}
