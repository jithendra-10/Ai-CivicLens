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
    description?: string;
    variant?: 'blue' | 'yellow' | 'green' | 'red';
}

export function StatCard({ icon: Icon, title, value, description, variant = 'blue' }: StatCardProps) {
    const variants = {
        blue: 'bg-blue-500 text-white',
        yellow: 'bg-yellow-500 text-white',
        green: 'bg-green-500 text-white',
        red: 'bg-red-500 text-white'
    };

  return (
    <Card className={cn(
        'transition-all duration-300 hover:shadow-xl hover:-translate-y-1 shadow-lg rounded-xl',
        variants[variant]
      )}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-inherit">{title}</CardTitle>
         <div className="p-2 bg-black/20 rounded-full">
            <Icon className="h-4 w-4 text-white" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-inherit">{value}</div>
        {description && <p className="text-xs text-white/80">{description}</p>}
      </CardContent>
    </Card>
  );
}

StatCard.Skeleton = function StatCardSkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-6 w-6 rounded-full" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-12" />
      </CardContent>
    </Card>
  )
}