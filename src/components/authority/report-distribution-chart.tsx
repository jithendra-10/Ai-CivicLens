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
  isFirstDayOfMonth,
} from 'date-fns';
import { CalendarDays } from 'lucide-react';

const WEEK_COUNT = 16;
const DAY_LABELS = ['S', 'M', 'T', 'W', 'Th', 'F', 'Sa'];

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
  
  // Calculate placeholder days needed for the first week
  const firstDayOfWeek = getDay(data[0].date); // 0 for Sunday, 1 for Monday...
  const placeholders = Array.from({ length: firstDayOfWeek });

  const monthLabels = data
    .filter((day, index) => isFirstDayOfMonth(day.date) || index === 0)
    .map((day, index, arr) => {
        const nextMonthStart = index + 1 < arr.length ? getDay(arr[index + 1].date) + (7 * (WEEK_COUNT - Math.floor((days.length - data.indexOf(day)) / 7))) : WEEK_COUNT*7;
        const colSpan = Math.floor((data.indexOf(arr[index+1] || {date: today}) - data.indexOf(day)) / 7);
        return {
            label: format(day.date, 'MMM'),
            // Approximate the column index
            column: Math.floor(data.indexOf(day) / 7) + 1,
        }
    });

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
            <div className="flex flex-col gap-2">
                 {/* Month Labels */}
                 <div className="grid grid-cols-16 gap-1.5 pl-8 text-xs text-muted-foreground">
                    {monthLabels.map(({ label, column }) => (
                         <div key={label} style={{ gridColumn: column }} className="w-fit">
                            {label}
                        </div>
                    ))}
                </div>

                <div className="flex gap-4">
                    {/* Day of Week Labels */}
                    <div className="flex flex-col gap-1.5 text-xs text-muted-foreground">
                        {DAY_LABELS.map((label, index) => (
                            <div key={index} className="h-3.5 flex items-center">{label}</div>
                        ))}
                    </div>
                     {/* Heatmap */}
                    <div className="grid grid-flow-col grid-rows-7 gap-1.5">
                        {placeholders.map((_, index) => (
                            <div key={`placeholder-${index}`} className="h-3.5 w-3.5" />
                        ))}
                        {data.map((dayData) => (
                            <Tooltip key={dayData.date.toISOString()} delayDuration={0}>
                            <TooltipTrigger asChild>
                                <div
                                className={cn(
                                    'h-3.5 w-3.5 rounded-sm',
                                    getColor(dayData.count)
                                )}
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
