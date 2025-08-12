'use client';

import { cn } from '@/lib/utils';

export function LoadingDots() {
  return (
    <div className="flex items-center justify-center gap-1.5">
      <div className={cn('h-2 w-2 animate-pulse rounded-full bg-current [animation-delay:-0.3s]')} />
      <div className={cn('h-2 w-2 animate-pulse rounded-full bg-current [animation-delay:-0.15s]')} />
      <div className={cn('h-2 w-2 animate-pulse rounded-full bg-current')} />
    </div>
  );
}
