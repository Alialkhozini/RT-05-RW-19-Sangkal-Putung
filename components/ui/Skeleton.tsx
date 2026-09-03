import React from 'react';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export function Skeleton({ className = '', ...props }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse bg-gray-200/90 rounded-2xl ${className}`}
      {...props}
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="bg-white rounded-3xl p-6 border border-neutral-gray/70 shadow-sm flex flex-col gap-4 animate-pulse">
      <Skeleton className="w-full h-44 rounded-2xl bg-gray-200" />
      <div className="flex items-center gap-2">
        <Skeleton className="w-16 h-4 rounded-full bg-gray-200" />
        <Skeleton className="w-24 h-4 rounded-full bg-gray-200" />
      </div>
      <Skeleton className="w-3/4 h-6 rounded-lg bg-gray-200" />
      <Skeleton className="w-full h-4 rounded-md bg-gray-200" />
      <Skeleton className="w-2/3 h-4 rounded-md bg-gray-200" />
    </div>
  );
}

export function TableRowSkeleton({ cols = 5 }: { cols?: number }) {
  return (
    <tr className="animate-pulse border-b border-neutral-gray/50">
      {Array.from({ length: cols }).map((_, idx) => (
        <td key={idx} className="p-4">
          <Skeleton className="h-4 w-full max-w-[120px] rounded-md bg-gray-200" />
        </td>
      ))}
    </tr>
  );
}
