'use client';

import { AlertTriangle, RotateCcw } from 'lucide-react';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({
  title = 'Something went wrong',
  message = "We couldn't load the creature details. Please check your network connection and try again.",
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center rounded-3xl glass border border-red-200/50 dark:border-red-900/30 max-w-md mx-auto my-8 space-y-4 shadow-lg">
      <div className="p-3.5 bg-red-50 dark:bg-red-950/30 rounded-2xl text-red-500 dark:text-red-400">
        <AlertTriangle className="w-8 h-8" />
      </div>
      
      <div className="space-y-1.5">
        <h3 className="text-xl font-bold tracking-tight text-slate-800 dark:text-slate-100">
          {title}
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
          {message}
        </p>
      </div>
      
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-2 px-5 py-2.5 bg-rose-500 hover:bg-rose-600 dark:bg-rose-600 dark:hover:bg-rose-700 text-white rounded-xl shadow-md shadow-rose-500/20 active:scale-95 transition-all text-sm font-semibold"
        >
          <RotateCcw className="w-4 h-4" />
          Retry Request
        </button>
      )}
    </div>
  );
}
export default ErrorState;
