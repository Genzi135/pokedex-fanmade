'use client';

import { useEffect } from 'react';
import ErrorState from '@/components/ui/ErrorState';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log error to console for debug
    console.error('Next.js Page Error boundary caught:', error);
  }, [error]);

  return (
    <div className="container mx-auto px-4 py-16 flex items-center justify-center min-h-[50vh]">
      <ErrorState
        title="Fandex System Error"
        message="A fatal error occurred loading the Fandex index page. Please try reloading."
        onRetry={reset}
      />
    </div>
  );
}
