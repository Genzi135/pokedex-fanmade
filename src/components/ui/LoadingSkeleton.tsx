import React from 'react';

// Single Pokemon Card loading state
export function PokemonCardSkeleton() {
  return (
    <div className="w-full aspect-[4/5] rounded-3xl glass border border-slate-200 dark:border-slate-800/80 p-5 flex flex-col justify-between animate-pulse">
      {/* Top section: ID and Type Badge Skeletons */}
      <div className="flex justify-between items-center">
        <div className="h-4 w-12 bg-slate-300 dark:bg-slate-700/80 rounded-md" />
        <div className="flex gap-1">
          <div className="h-6 w-14 bg-slate-300 dark:bg-slate-700/80 rounded-full" />
        </div>
      </div>
      
      {/* Middle section: Artwork Circle Skeleton */}
      <div className="flex justify-center my-4">
        <div className="w-28 h-28 md:w-32 md:h-32 rounded-full bg-slate-300 dark:bg-slate-700/80" />
      </div>

      {/* Bottom section: Name and Base Stats Skeletons */}
      <div className="space-y-3">
        <div className="h-6 w-2/3 bg-slate-300 dark:bg-slate-700/80 rounded-md mx-auto" />
        
        {/* Preview Stats Skeletons */}
        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-200 dark:border-slate-800/50">
          <div className="space-y-1 text-center">
            <div className="h-3 w-1/2 bg-slate-300 dark:bg-slate-700/50 rounded-sm mx-auto" />
            <div className="h-4 w-3/4 bg-slate-300 dark:bg-slate-700/80 rounded-sm mx-auto" />
          </div>
          <div className="space-y-1 text-center">
            <div className="h-3 w-1/2 bg-slate-300 dark:bg-slate-700/50 rounded-sm mx-auto" />
            <div className="h-4 w-3/4 bg-slate-300 dark:bg-slate-700/80 rounded-sm mx-auto" />
          </div>
          <div className="space-y-1 text-center">
            <div className="h-3 w-1/2 bg-slate-300 dark:bg-slate-700/50 rounded-sm mx-auto" />
            <div className="h-4 w-3/4 bg-slate-300 dark:bg-slate-700/80 rounded-sm mx-auto" />
          </div>
        </div>
      </div>
    </div>
  );
}

// Grid of card skeletons
export function PokemonGridSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6 w-full">
      {Array.from({ length: count }).map((_, index) => (
        <PokemonCardSkeleton key={index} />
      ))}
    </div>
  );
}

// Stats tab skeleton
export function StatBarSkeleton() {
  return (
    <div className="space-y-4 w-full animate-pulse">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="flex items-center gap-4">
          <div className="w-20 h-4 bg-slate-300 dark:bg-slate-700/80 rounded-md" />
          <div className="w-10 h-4 bg-slate-300 dark:bg-slate-700/50 rounded-md text-right" />
          <div className="flex-1 h-3 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-slate-300 dark:bg-slate-700/80 w-1/3 rounded-full" />
          </div>
        </div>
      ))}
      <div className="pt-6 flex justify-center">
        <div className="w-48 h-48 rounded-full bg-slate-300 dark:bg-slate-700/50" />
      </div>
    </div>
  );
}

// Moves tab skeleton
export function MoveTableSkeleton() {
  return (
    <div className="space-y-3 w-full animate-pulse">
      {/* Table Header skeleton */}
      <div className="grid grid-cols-4 gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div className="h-4 bg-slate-300 dark:bg-slate-700/80 rounded-md w-1/2" />
        <div className="h-4 bg-slate-300 dark:bg-slate-700/80 rounded-md w-1/3 mx-auto" />
        <div className="h-4 bg-slate-300 dark:bg-slate-700/80 rounded-md w-1/3 mx-auto" />
        <div className="h-4 bg-slate-300 dark:bg-slate-700/80 rounded-md w-1/3 mx-auto" />
      </div>
      
      {/* Table Rows skeletons */}
      {Array.from({ length: 8 }).map((_, index) => (
        <div key={index} className="grid grid-cols-4 gap-4 py-2.5 border-b border-slate-100 dark:border-slate-900/50">
          <div className="h-4 bg-slate-300 dark:bg-slate-700/50 rounded-md w-2/3" />
          <div className="h-5 bg-slate-300 dark:bg-slate-700/50 rounded-full w-14 mx-auto" />
          <div className="h-4 bg-slate-300 dark:bg-slate-700/50 rounded-md w-8 mx-auto" />
          <div className="h-4 bg-slate-300 dark:bg-slate-700/50 rounded-md w-8 mx-auto" />
        </div>
      ))}
    </div>
  );
}

// Evolution tab skeleton
export function EvolutionSkeleton() {
  return (
    <div className="flex flex-col md:flex-row items-center justify-center gap-8 py-6 w-full animate-pulse">
      {Array.from({ length: 3 }).map((_, index) => (
        <React.Fragment key={index}>
          {index > 0 && (
            <div className="flex flex-col items-center gap-1">
              <div className="w-8 h-4 bg-slate-300 dark:bg-slate-700/50 rounded-md" />
              <div className="w-12 h-2 bg-slate-300 dark:bg-slate-700/30 rounded-full" />
            </div>
          )}
          <div className="flex flex-col items-center gap-2">
            <div className="w-20 h-20 rounded-full bg-slate-300 dark:bg-slate-700/80" />
            <div className="h-4 bg-slate-300 dark:bg-slate-700/80 rounded-md w-16" />
            <div className="flex gap-1">
              <div className="h-4 bg-slate-300 dark:bg-slate-700/50 rounded-full w-8" />
              <div className="h-4 bg-slate-300 dark:bg-slate-700/50 rounded-full w-8" />
            </div>
          </div>
        </React.Fragment>
      ))}
    </div>
  );
}

// Full page loader skeleton (for Server loading.tsx)
export function FullPageLoadingSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8 space-y-8 min-h-screen">
      {/* Header skeleton */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 border-b border-slate-200 dark:border-slate-800/80 pb-6">
        <div className="space-y-2 text-center sm:text-left">
          <div className="h-8 bg-slate-300 dark:bg-slate-700/80 rounded-lg w-48" />
          <div className="h-4 bg-slate-300 dark:bg-slate-700/50 rounded-md w-72" />
        </div>
        <div className="flex gap-2">
          <div className="w-40 h-10 bg-slate-300 dark:bg-slate-700/80 rounded-xl" />
          <div className="w-10 h-10 bg-slate-300 dark:bg-slate-700/80 rounded-xl" />
        </div>
      </div>

      {/* Filter panel skeleton */}
      <div className="glass p-6 rounded-2xl border border-slate-200 dark:border-slate-800/50 space-y-4 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="h-10 bg-slate-300 dark:bg-slate-700/50 rounded-xl" />
          <div className="h-10 bg-slate-300 dark:bg-slate-700/50 rounded-xl" />
          <div className="h-10 bg-slate-300 dark:bg-slate-700/50 rounded-xl" />
        </div>
      </div>

      {/* Grid skeleton */}
      <PokemonGridSkeleton count={12} />
    </div>
  );
}
