
import React from 'react';

export const Skeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div className={`animate-pulse bg-lumina-highlight/30 rounded ${className}`} />
);

export const DashboardSkeleton = () => (
    <div className="flex h-screen bg-lumina-base overflow-hidden">
        {/* Sidebar Skeleton */}
        <div className="hidden lg:block w-64 border-r border-lumina-highlight p-6 space-y-8">
            <Skeleton className="h-8 w-32 mb-8" />
            <div className="space-y-4">
                {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-10 w-full rounded-xl" />)}
            </div>
        </div>
        
        {/* Main Content Skeleton */}
        <div className="flex-1 p-8 space-y-8">
            <div className="flex justify-between items-center">
                <div className="space-y-2">
                    <Skeleton className="h-10 w-64" />
                    <Skeleton className="h-4 w-40" />
                </div>
                <Skeleton className="h-10 w-32 rounded-full" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-32 rounded-2xl" />)}
            </div>
            
            <div className="grid grid-cols-3 gap-6 h-96">
                <Skeleton className="col-span-2 rounded-2xl h-full" />
                <Skeleton className="col-span-1 rounded-2xl h-full" />
            </div>
        </div>
    </div>
);
