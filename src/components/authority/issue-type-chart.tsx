'use client';

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import type { Report } from '@/lib/types';
import { useMemo } from 'react';
import { TrendingUp } from 'lucide-react';

interface IssueTypeChartProps {
  reports: Report[];
}

export function IssueTypeChart({ reports }: IssueTypeChartProps) {
  const chartData = useMemo(() => {
    if (!reports) return [];
    const counts: { [key: string]: number } = {};
    for (const report of reports) {
      counts[report.issueType] = (counts[report.issueType] || 0) + 1;
    }
    return Object.entries(counts)
      .map(([name, total]) => ({ name, total }))
      .sort((a, b) => b.total - a.total);
  }, [reports]);

  const chartConfig = {
    total: {
      label: 'Reports',
      color: 'hsl(var(--primary))',
    },
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="font-headline flex items-center gap-2">
            <TrendingUp className="text-primary" />
            <span>Report Breakdown</span>
        </CardTitle>
        <CardDescription>
          A summary of all submitted reports by issue type.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {chartData.length > 0 ? (
          <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
            <BarChart accessibilityLayer data={chartData}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="name"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                tickFormatter={(value) => value.slice(0, 10)}
              />
              <YAxis allowDecimals={false} />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="dot" />}
              />
              <Bar dataKey="total" fill="var(--color-total)" radius={4} />
            </BarChart>
          </ChartContainer>
        ) : (
          <div className="flex flex-col items-center justify-center text-center p-4 border-dashed border-2 border-muted-foreground/30 rounded-lg min-h-[200px]">
             <p className="text-sm text-muted-foreground">
                No reports found to generate a chart.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
