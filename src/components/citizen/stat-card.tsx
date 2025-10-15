'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { LucideIcon } from 'lucide-react';
import { Skeleton } from '../ui/skeleton';
import { cn } from '@/lib/utils';
import { Progress } from '../ui/progress';

interface StatCardProps {
  icon: LucideIcon;
  title: string;
  value: number | string;
  variant?: 'blue' | 'orange' | 'yellow' | 'green';
}

export function StatCard({
  icon: Icon,
  title,
  value,
  variant = 'blue',
}: StatCardProps) {
  const variants = {
    blue: 'from-blue-500/10 to-purple-500/10 text-blue-200',
    orange: 'from-orange-500/10 to-red-500/10 text-orange-200',
    yellow: 'from-yellow-500/10 to-orange-500/10 text-yellow-200',
    green: 'from-green-500/10 to-teal-500/10 text-green-200',
  };

  const progressVariants = {
    blue: 'bg-gradient-to-r from-blue-500 to-purple-500',
    orange: 'bg-gradient-to-r from-orange-500 to-red-500',
    yellow: 'bg-gradient-to-r from-yellow-500 to-orange-500',
    green: 'bg-gradient-to-r from-green-500 to-teal-500',
  }

  return (
    <Card
      className={cn(
        'transition-all duration-300 hover:shadow-xl hover:-translate-y-1 bg-gradient-to-br border-white/10 shadow-lg',
        variants[variant]
      )}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-white">{title}</CardTitle>
        <div className="p-2 bg-black/20 rounded-full">
            <Icon className="h-4 w-4 text-white" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-white">{value}</div>
        <p className="text-xs text-white/60 pt-1">
          issues
        </p>
         <Progress value={Number(value) * 5 + 5} className={cn("h-2 mt-4", progressVariants[variant])} indicatorClassName={progressVariants[variant]} />
      </CardContent>
    </Card>
  );
}

StatCard.Skeleton = function StatCardSkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-4 rounded-full" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-12" />
      </CardContent>
    </Card>
  );
};
