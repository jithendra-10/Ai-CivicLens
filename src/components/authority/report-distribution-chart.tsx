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
} from 'date-fns';
import { CalendarDays } from 'lucide-react';

const WEEK_COUNT = 16;
const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

function getColor(count: number): string {
  if (count === 0) return 'bg-muted/50 dark:bg-muted/30';
  if (count < 2) return 'bg-blue-300 dark:bg-blue-800';
  if (count < 4) return 'bg-blue-400 dark:bg-blue-600';
  if (count < 6) return 'bg-blue-500 dark:bg-blue-500';
  return 'bg-blue-600 dark:bg-blue-400';
}

export function ReportDistributionChart({ reports }: { reports: Report[] }) {
  const today = new Date();
  // Ensure we get a full 16 weeks by starting from the beginning of the week
  const weekStart = startOfWeek(subWeeks(today, WEEK_COUNT - 1));

  const days = eachDayOfInterval({ start: weekStart, end: today });

  // Create an array of day data with report counts
  const data = days.map((day) => {
    const count = reports.filter((report) =>
      isSameDay(new Date(report.createdAt), day)
    ).length;
    return {
      date: format(day, 'yyyy-MM-dd'),
      count,
      dayOfWeek: getDay(day), // 0 for Sunday, 6 for Saturday
    };
  });

  // Create placeholder elements for the start of the grid if the first day is not a Sunday
  const firstDayOfWeek = data[0]?.dayOfWeek || 0;
  const placeholders = Array.from({ length: firstDayOfWeek }).map((_, i) => (
    <div key={`placeholder-${i}`} className="h-3 w-3" />
  ));

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
          <div className="flex gap-2">
            <div className="flex flex-col gap-1">
              {DAY_LABELS.map((label) => (
                <div
                  key={label}
                  className="text-xs text-muted-foreground text-center"
                >
                  {label}
                </div>
              ))}
            </div>
            <div className="grid grid-flow-col grid-rows-7 gap-1">
              {placeholders}
              {data.map(({ date, count }) => (
                <Tooltip key={date} delayDuration={0}>
                  <TooltipTrigger asChild>
                    <div
                      className={cn('h-3 w-3 rounded-sm', getColor(count))}
                    />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-sm">
                      {count} report{count !== 1 ? 's' : ''} on{' '}
                      {format(new Date(date), 'MMM d, yyyy')}
                    </p>
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          </div>
        </TooltipProvider>
      </CardContent>
    </Card>
  );
}
