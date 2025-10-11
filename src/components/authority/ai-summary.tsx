'use client';

import { useState, useTransition } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { BrainCircuit, LoaderCircle, Lightbulb } from 'lucide-react';
import type { Report } from '@/lib/types';
import { summarizeCivicIssues } from '@/ai/flows/summarize-civic-issue-reports';
import { useToast } from '@/hooks/use-toast';

export function AiSummary({ reports }: { reports: Report[] }) {
    const [summary, setSummary] = useState<string>('');
    const [isGenerating, startTransition] = useTransition();
    const { toast } = useToast();

    const handleGenerateSummary = () => {
        if (reports.length === 0) {
            toast({
                variant: 'destructive',
                title: 'No Reports',
                description: 'There are no reports to summarize.',
            });
            return;
        }

        startTransition(async () => {
            try {
                const result = await summarizeCivicIssues({
                    reports: reports.map(r => ({
                        issueType: r.issueType,
                        severity: r.severity,
                        aiDescription: r.aiDescription,
                        location: r.location,
                    })),
                    areaDescription: 'the entire city',
                });
                setSummary(result.summary);
            } catch (error) {
                console.error('AI summary failed:', error);
                toast({
                    variant: 'destructive',
                    title: 'AI Summary Failed',
                    description: 'Could not generate summary. Please try again.',
                });
            }
        });
    }

  return (
    <Card className="bg-primary/5 border-primary/20 h-full">
      <CardHeader>
        <CardTitle className="font-headline flex items-center gap-2">
          <BrainCircuit className="text-primary" />
          <span>AI-Powered Summary</span>
        </CardTitle>
        <CardDescription>
          Get a high-level overview of all active issues.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col h-full">
        {summary ? (
            <div className="space-y-4 flex-grow">
                <div className="flex items-start gap-3 bg-accent/20 p-3 rounded-lg">
                    <Lightbulb className="h-5 w-5 text-accent-foreground mt-1 flex-shrink-0" />
                    <p className="text-sm text-accent-foreground/90">{summary}</p>
                </div>
                <Button variant="secondary" onClick={() => setSummary('')}>
                    Clear Summary
                </Button>
            </div>
        ) : (
            <div className="flex flex-col items-center justify-center text-center p-4 border-dashed border-2 border-muted-foreground/30 rounded-lg flex-grow">
                <p className="text-sm text-muted-foreground mb-4">
                    Click the button to generate an AI summary of common complaints and high-severity issues.
                </p>
                <Button onClick={handleGenerateSummary} disabled={isGenerating}>
                    {isGenerating ? (
                        <>
                            <LoaderCircle className="mr-2 animate-spin" />
                            Generating...
                        </>
                    ) : 'Generate Summary'}
                </Button>
            </div>
        )}
      </CardContent>
    </Card>
  );
}
