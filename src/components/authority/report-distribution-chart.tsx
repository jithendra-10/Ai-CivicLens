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
          <div className="grid grid-cols-[auto,1fr] gap-x-4 overflow-x-auto pb-2">
            {/* Day Labels Column */}
            <div className="grid grid-rows-7 gap-1 mt-[1.75rem]">
              {DAY_LABELS.map((label, index) => (
                <div key={index} className="text-xs text-muted-foreground h-3 flex items-center">
                  {label}
                </div>
              ))}
            </div>

            {/* Heatmap Grid */}
            <div className="grid grid-flow-col auto-cols-max gap-1">
              {/* Month Labels */}
              <div className="grid grid-rows-1 col-span-full">
                <div className="grid grid-flow-col auto-cols-max gap-x-[1rem]">
                   {monthlyData.map(({ label, weekIndex }) => {
                    // Estimate column start based on week index
                    const colStart = (weekIndex * 7 / 7) + Math.floor(startOfWeek(today).getDate()/7);
                    return (
                        <div key={label} className="text-xs text-muted-foreground" style={{ gridColumn: `${Math.max(1, (weekIndex * 4) - 2)} / span 4` }}>
                            {label}
                        </div>
                    );
                   })}
                </div>
              </div>
              
              {/* Day cells */}
              {data.map((dayData, index) => (
                <Tooltip key={dayData.date.toISOString()} delayDuration={0}>
                  <TooltipTrigger asChild>
                    <div
                      className={cn(
                        'h-3 w-3 rounded-sm',
                        getColor(dayData.count)
                      )}
                      style={{
                        gridRow: getDay(dayData.date) + 2, // +2 to account for month labels
                      }}
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
        </TooltipProvider>
      </CardContent>
    </Card>
  );
}
