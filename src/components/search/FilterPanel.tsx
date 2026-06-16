'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { POKEMON_TYPES, GENERATIONS } from '@/lib/constants';
import { SlidersHorizontal, Trash2 } from 'lucide-react';

interface FilterPanelProps {
  isPending: boolean;
}

export function FilterPanel({ isPending }: FilterPanelProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Read current parameters from URL
  const selectedType = searchParams.get('type') || '';
  const selectedGen = searchParams.get('generation') || '';
  const selectedSort = searchParams.get('sort') || 'id-asc';

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.set('page', '1'); // Reset pagination to page 1 on filter alteration

    router.push(`?${params.toString()}`, { scroll: false });
  };

  const handleClearFilters = () => {
    const params = new URLSearchParams();
    // Keep search query if active
    const q = searchParams.get('q');
    if (q) params.set('q', q);

    router.push(`?${params.toString()}`, { scroll: false });
  };

  const hasActiveFilters = selectedType || selectedGen || selectedSort !== 'id-asc';

  return (
    <div className="glass rounded-2xl border border-slate-200 dark:border-slate-800/80 p-5 space-y-4 shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-900/60 pb-3">
        <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 font-bold">
          <SlidersHorizontal className="w-4 h-4 text-blue-500" />
          <span>Filters & Sort</span>
        </div>
        {hasActiveFilters && (
          <button
            onClick={handleClearFilters}
            className="flex items-center gap-1 text-xs text-rose-500 dark:text-rose-400 hover:underline font-semibold active:scale-95 transition-transform"
            aria-label="Clear active filters"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear Filters
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Type Filter Dropdown */}
        <div className="space-y-1.5">
          <label htmlFor="type-filter" className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
            Creature Type
          </label>
          <select
            id="type-filter"
            value={selectedType}
            onChange={(e) => updateParam('type', e.target.value)}
            disabled={isPending}
            className="w-full bg-slate-50/50 dark:bg-slate-950/40 text-slate-800 dark:text-slate-100 rounded-xl px-3 py-2.5 border border-slate-200 dark:border-slate-800/60 outline-none text-sm transition-all focus:border-blue-500/50 dark:focus:border-blue-400/50 cursor-pointer"
          >
            <option value="">All Types</option>
            {POKEMON_TYPES.map((type) => (
              <option key={type} value={type}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {/* Generation Filter Dropdown */}
        <div className="space-y-1.5">
          <label htmlFor="gen-filter" className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
            Generation
          </label>
          <select
            id="gen-filter"
            value={selectedGen}
            onChange={(e) => updateParam('generation', e.target.value)}
            disabled={isPending}
            className="w-full bg-slate-50/50 dark:bg-slate-950/40 text-slate-800 dark:text-slate-100 rounded-xl px-3 py-2.5 border border-slate-200 dark:border-slate-800/60 outline-none text-sm transition-all focus:border-blue-500/50 dark:focus:border-blue-400/50 cursor-pointer"
          >
            <option value="">All Generations</option>
            {GENERATIONS.map((gen) => (
              <option key={gen.name} value={gen.name}>
                {gen.displayName}
              </option>
            ))}
          </select>
        </div>

        {/* Sorting Dropdown */}
        <div className="space-y-1.5">
          <label htmlFor="sort-filter" className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
            Sort Order
          </label>
          <select
            id="sort-filter"
            value={selectedSort}
            onChange={(e) => updateParam('sort', e.target.value)}
            disabled={isPending}
            className="w-full bg-slate-50/50 dark:bg-slate-950/40 text-slate-800 dark:text-slate-100 rounded-xl px-3 py-2.5 border border-slate-200 dark:border-slate-800/60 outline-none text-sm transition-all focus:border-blue-500/50 dark:focus:border-blue-400/50 cursor-pointer"
          >
            <option value="id-asc">ID: Low to High</option>
            <option value="id-desc">ID: High to Low</option>
            <option value="name-asc">Name: A to Z</option>
            <option value="name-desc">Name: Z to A</option>
            <option value="hp-desc">Stat: Highest HP</option>
            <option value="attack-desc">Stat: Highest Attack</option>
            <option value="speed-desc">Stat: Highest Speed</option>
          </select>
        </div>
      </div>
    </div>
  );
}

export default FilterPanel;
