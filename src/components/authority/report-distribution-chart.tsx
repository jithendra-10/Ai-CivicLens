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
    count: reports.filter((report) =>
      isSameDay(new Date(report.createdAt), day)
    ).length,
  }));
  
  const startingDayOfWeek = getDay(days[0].date);

  const monthLabels = data
    .map((d, i) => {
      const isFirstOfWeek = (i + startingDayOfWeek) % 7 === 0;
      const isFirstOfMonthOrFirstDay = i === 0 || d.date.getDate() === 1;

      if ((isFirstOfWeek || isFirstOfMonthOrFirstDay) && d.date.getDate() <= 7) {
        return {
          label: format(d.date, 'MMM'),
          // Calculate the grid column start
          column: Math.floor((i + startingDayOfWeek) / 7) + 2, 
        };
      }
      return null;
    })
    .filter((item, index, self) => 
        item !== null && self.findIndex(t => t?.label === item.label && t?.column === item.column) === index
    ) as { label: string; column: number }[];

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
          <div className="grid grid-flow-col gap-x-1.5" style={{ gridTemplateColumns: `auto repeat(${WEEK_COUNT}, 1fr)`}}>
            {/* Day labels column */}
            <div className="grid grid-rows-7 gap-y-1.5 text-xs text-muted-foreground self-center mt-6">
                {DAY_LABELS.map((label, index) => (
                  <div key={label + index} className="h-3 flex items-center">{label}</div>
                ))}
            </div>

            {/* Month labels will be positioned using the grid-column property */}
            {monthLabels.map(({ label, column }) => (
                <div key={label} className="text-xs text-muted-foreground" style={{ gridColumn: column, gridRow: 1 }}>
                    {label}
                </div>
            ))}
            
            {/* Heatmap grid */}
            <div className="grid grid-flow-col grid-rows-7 gap-1 col-start-2 col-span-16 mt-6">
              {/* Spacer divs to align the first day correctly */}
              {Array.from({ length: startingDayOfWeek }).map((_, i) => (
                <div key={`spacer-${i}`} />
              ))}

              {data.map((dayData) => (
                <Tooltip key={dayData.date.toISOString()} delayDuration={0}>
                  <TooltipTrigger asChild>
                    <div
                      className={cn(
                        'h-3 w-3 rounded-sm',
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
        </TooltipProvider>
      </CardContent>
    </Card>
  );
}
