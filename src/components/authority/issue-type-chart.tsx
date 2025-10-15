'use client';

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Cell } from 'recharts';
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

const colorPalette = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
];

export function IssueTypeChart({ reports }: IssueTypeChartProps) {
  const { chartData, chartConfig } = useMemo(() => {
    if (!reports) return { chartData: [], chartConfig: {} };

    const counts: { [key: string]: number } = {};
    for (const report of reports) {
      counts[report.issueType] = (counts[report.issueType] || 0) + 1;
    }

    const uniqueIssueTypes = Object.keys(counts);
    const generatedChartConfig: ChartConfig = {};
    uniqueIssueTypes.forEach((issueType, index) => {
      generatedChartConfig[issueType] = {
        label: issueType,
        color: colorPalette[index % colorPalette.length],
      };
    });

    const generatedChartData = Object.entries(counts)
      .map(([name, total]) => ({
        name,
        total,
      }))
      .sort((a, b) => b.total - a.total);

    return { chartData: generatedChartData, chartConfig: generatedChartConfig };
  }, [reports]);

  return (
    <Card className="rounded-lg shadow-lg">
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
            <BarChart
              accessibilityLayer
              data={chartData}
              margin={{
                top: 20,
              }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="name"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                tickFormatter={(value) => value.slice(0, 3)}
              />
              <YAxis allowDecimals={false} />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="line" />}
              />
              <Bar dataKey="total" radius={8}>
                {chartData.map((entry) => (
                  <Cell
                    key={`cell-${entry.name}`}
                    fill={chartConfig[entry.name]?.color}
                  />
                ))}
              </Bar>
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
