'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, X } from 'lucide-react';

interface SearchBarProps {
  isPending: boolean;
}

export function SearchBar({ isPending }: SearchBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Local input state to keep typing interactive and fluid
  const [value, setValue] = useState(searchParams.get('q') || '');

  // Synchronize local input state if URL search parameters are modified elsewhere (e.g. on Reset)
  useEffect(() => {
    setValue(searchParams.get('q') || '');
  }, [searchParams]);

  // Handle debounced search updates
  useEffect(() => {
    const timer = setTimeout(() => {
      const currentQuery = searchParams.get('q') || '';
      const cleanValue = value.trim();

      if (cleanValue === currentQuery) return; // Skip if no change

      const params = new URLSearchParams(searchParams.toString());
      if (cleanValue) {
        params.set('q', cleanValue);
        params.set('page', '1'); // Reset to first page on new search
      } else {
        params.delete('q');
      }

      router.push(`?${params.toString()}`, { scroll: false });
    }, 300);

    return () => clearTimeout(timer);
  }, [value, router, searchParams]);

  const handleClear = () => {
    setValue('');
    const params = new URLSearchParams(searchParams.toString());
    params.delete('q');
    router.push(`?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="relative w-full">
      <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
        <Search className={`w-5 h-5 ${isPending ? 'animate-pulse' : ''}`} />
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search Fanimon by name or ID (e.g., creature, 25)..."
        className="w-full pl-12 pr-12 py-3.5 rounded-2xl glass border border-slate-200 dark:border-slate-800/80 outline-none focus:border-blue-500/50 dark:focus:border-blue-400/50 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-base shadow-inner transition-all duration-300"
        aria-label="Search Fanimon database"
      />
      {value && (
        <button
          onClick={handleClear}
          className="absolute inset-y-0 right-4 flex items-center text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 active:scale-90 transition-transform"
          aria-label="Clear search query"
        >
          <X className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}

export default SearchBar;
