'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import type { Report } from '@/lib/types';
import { cn } from '@/lib/utils';
import {
  eachDayOfInterval,
  format,
  startOfWeek,
  endOfWeek,
  subWeeks,
  isSameDay,
  getDay,
  startOfMonth,
  isSameMonth,
  getMonth,
} from 'date-fns';
import { CalendarDays } from 'lucide-react';

const WEEK_COUNT = 16;
const DAY_LABELS = ['S', 'M', 'T', 'W', 'Th', 'F', 'S'];

function getColor(count: number): string {
  if (count === 0) return 'bg-muted/50 dark:bg-muted/30';
  if (count < 2) return 'bg-blue-300 dark:bg-blue-800';
  if (count < 4) return 'bg-blue-400 dark:bg-blue-600';
  if (count < 6) return 'bg-blue-500 dark:bg-blue-500';
  return 'bg-blue-600 dark:bg-blue-400';
}

export function ReportDistributionChart({ reports }: { reports: Report[] }) {
  const today = new Date();
  const weekStart = startOfWeek(subWeeks(today, WEEK_COUNT - 1));
  const days = eachDayOfInterval({ start: weekStart, end: today });

  const data = days.map((day) => ({
    date: day,
    count: reports.filter((report) => isSameDay(new Date(report.createdAt), day)).length,
  }));

  const monthlyData = Array.from({ length: WEEK_COUNT }, (_, i) => {
    const weekStartDate = new Date(weekStart);
    weekStartDate.setDate(weekStart.getDate() + i * 7);
    return {
      month: getMonth(weekStartDate),
      label: format(weekStartDate, 'MMM'),
    };
  }).reduce((acc, { month, label }) => {
    if (!acc.find(item => item.month === month)) {
      acc.push({ month, label, weekIndex: acc.length });
    }
    return acc;
  }, [] as { month: number; label: string, weekIndex: number }[]);


  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline flex items-center gap-2">
          <CalendarDays className="text-primary" />
          <span>Report Distribution</span>
        </CardTitle>
        <CardDescription>
          Daily report submission activity over the last {WEEK_COUNT} weeks.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <TooltipProvider>
          <div className="flex gap-2 items-start">
            <div className="flex flex-col gap-1 mt-6 text-xs text-muted-foreground">
               {DAY_LABELS.map((label, index) => (
                <div key={`${label}-${index}`}>{label}</div>
               ))}
            </div>
            <div className="flex flex-col gap-1 overflow-x-auto pb-2">
               <div className="grid grid-flow-col gap-x-6">
                {monthlyData.map(({ label, weekIndex }) => (
                  <div key={label} className="text-xs text-muted-foreground" style={{ gridColumnStart: weekIndex + 1 }}>
                    {label}
                  </div>
                ))}
              </div>
              <div className="grid grid-flow-col auto-cols-max gap-1">
                {data.map((dayData, index) => (
                  <Tooltip key={dayData.date.toISOString()} delayDuration={0}>
                    <TooltipTrigger asChild>
                      <div
                        className={cn('h-3 w-3 rounded-sm', getColor(dayData.count))}
                        style={{ gridRow: getDay(dayData.date) + 1 }}
                      />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-sm">
                        {dayData.count} report{dayData.count !== 1 ? 's' : ''} on{' '}
                        {format(dayData.date, 'MMM d, yyyy')}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                ))}
              </div>
            </div>
          </div>
        </TooltipProvider>
      </CardContent>
    </Card>
  );
}
