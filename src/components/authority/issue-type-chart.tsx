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
  ChartConfig,
} from '@/components/ui/chart';
import type { Report } from '@/lib/types';
import { useMemo } from 'react';
import { TrendingUp } from 'lucide-react';

interface IssueTypeChartProps {
  reports: Report[];
}

const chartConfig = {
  Pothole: { label: 'Pothole', color: 'hsl(var(--chart-1))' },
  Graffiti: { label: 'Graffiti', color: 'hsl(var(--chart-2))' },
  'Waste Management': { label: 'Waste', color: 'hsl(var(--chart-3))' },
  'Broken Streetlight': { label: 'Streetlight', color: 'hsl(var(--chart-4))' },
  Other: { label: 'Other', color: 'hsl(var(--chart-5))' },
} satisfies ChartConfig;


export function IssueTypeChart({ reports }: IssueTypeChartProps) {
  const chartData = useMemo(() => {
    if (!reports) return [];
    const counts: { [key: string]: number } = {};
    for (const report of reports) {
      const issueKey = report.issueType in chartConfig ? report.issueType : 'Other';
      counts[issueKey] = (counts[issueKey] || 0) + 1;
    }
    return Object.entries(counts)
      .map(([name, total]) => ({ name, total, fill: `var(--color-${name.replace(/\s+/g, '-')})` }))
      .sort((a, b) => b.total - a.total);
  }, [reports]);

  return (
    <Card className="h-full rounded-lg shadow-lg bg-card/50">
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
            <BarChart accessibilityLayer data={chartData} layout="vertical">
              <CartesianGrid horizontal={false} />
              <YAxis
                dataKey="name"
                type="category"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                tickFormatter={(value) => chartConfig[value as keyof typeof chartConfig]?.label || value}
              />
              <XAxis dataKey="total" type="number" hide />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="line" />}
              />
              <Bar dataKey="total" layout="vertical" radius={4} />
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
