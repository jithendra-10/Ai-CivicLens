'use client';

import { Pie, PieChart, Cell, Legend } from 'recharts';
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
import { CheckCircle, Clock, AlertTriangle } from 'lucide-react';

const STATUS_CONFIG = {
  Resolved: { color: 'hsl(140 90% 55%)', icon: CheckCircle },
  'In Progress': { color: 'hsl(50 90% 60%)', icon: Clock },
  Submitted: { color: 'hsl(207 90% 54%)', icon: AlertTriangle },
};

export function StatusBreakdownChart({ reports }: { reports: Report[] }) {
  const { chartData, chartConfig } = useMemo(() => {
    if (!reports) return { chartData: [], chartConfig: {} };

    const statusCounts = reports.reduce(
      (acc, report) => {
        acc[report.status] = (acc[report.status] || 0) + 1;
        return acc;
      },
      {} as Record<Report['status'], number>
    );

    const generatedChartData = Object.entries(statusCounts).map(
      ([status, count]) => ({
        status,
        count,
      })
    );

    const generatedChartConfig = Object.keys(STATUS_CONFIG).reduce((acc, status) => {
      acc[status] = {
        label: status,
        color: STATUS_CONFIG[status as Report['status']].color,
        icon: STATUS_CONFIG[status as Report['status']].icon,
      };
      return acc;
    }, {} as any);

    return { chartData: generatedChartData, chartConfig: generatedChartConfig };
  }, [reports]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline flex items-center gap-2">
            Status Breakdown
        </CardTitle>
        <CardDescription>
          A real-time overview of the current status of all reports.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={chartData}
              dataKey="count"
              nameKey="status"
              innerRadius={60}
              strokeWidth={5}
            >
              {chartData.map((entry) => (
                <Cell
                  key={`cell-${entry.status}`}
                  fill={chartConfig[entry.status]?.color}
                  stroke={chartConfig[entry.status]?.color}
                />
              ))}
            </Pie>
             <Legend
              content={({ payload }) => {
                return (
                  <ul className="grid gap-2 grid-cols-3">
                    {payload?.map((item, index) => {
                        const { name, color, payload: itemPayload } = item;
                        const Icon = chartConfig[name]?.icon;
                        const value = itemPayload?.value;
                      return (
                        <li key={`item-${name}-${index}`} className="flex items-center gap-2 text-sm font-medium">
                          <span className="flex h-2 w-2 shrink-0 rounded-full" style={{backgroundColor: color}} />
                          <div className="flex-1 truncate">{name} ({value})</div>
                        </li>
                      );
                    })}
                  </ul>
                );
              }}
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
