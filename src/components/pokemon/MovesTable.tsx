'use client';

import { useEffect, useState, useRef, useMemo } from 'react';
import { PokemonMove, MoveDetail } from '@/types/pokemon';
import { usePokemonStore } from '@/stores/usePokemonStore';
import { getMoveDetails } from '@/lib/api/pokeapi';
import { useVirtualizer } from '@tanstack/react-virtual';
import { TYPE_COLORS } from '@/lib/utils/type-colors';
import { POKEMON_TYPES } from '@/lib/constants';
import { Loader2, Search, SlidersHorizontal } from 'lucide-react';

interface MovesTableProps {
  pokemonMoves: PokemonMove[];
}

export function MovesTable({ pokemonMoves }: MovesTableProps) {
  const movesCache = usePokemonStore((state) => state.movesCache);
  const cacheMoveDetailsBatch = usePokemonStore((state) => state.cacheMoveDetailsBatch);

  // Filter and Search States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedMethod, setSelectedMethod] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortField, setSortField] = useState<'level' | 'name' | 'power' | 'accuracy'>('level');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Progressive loading states
  const [isLoadingBatches, setIsLoadingBatches] = useState(false);

  // Match the Pokémon moves with details from the Zustand cache
  const movesWithDetails = useMemo(() => {
    return pokemonMoves.map((pm) => {
      const cachedDetail = movesCache[pm.name.toLowerCase()];
      return {
        ...pm,
        details: cachedDetail || null,
      };
    });
  }, [pokemonMoves, movesCache]);

  // Identify uncached moves and batch-load them progressively
  const uncachedMoveNames = useMemo(() => {
    return movesWithDetails
      .filter((m) => m.details === null)
      .map((m) => m.name);
  }, [movesWithDetails]);

  useEffect(() => {
    if (uncachedMoveNames.length === 0 || isLoadingBatches) return;

    let active = true;

    async function loadNextBatch() {
      setIsLoadingBatches(true);
      const batch = uncachedMoveNames.slice(0, 20); // Batch of 20
      
      try {
        const details = await getMoveDetails(batch);
        if (active) {
          cacheMoveDetailsBatch(details);
        }
      } catch (err) {
        console.error('Failed to load moves batch:', err);
      } finally {
        if (active) {
          setIsLoadingBatches(false);
        }
      }
    }

    loadNextBatch();

    return () => {
      active = false;
    };
  }, [uncachedMoveNames, isLoadingBatches, cacheMoveDetailsBatch]);

  // Apply search, filters, and sort to the loaded items
  const filteredAndSortedMoves = useMemo(() => {
    let result = movesWithDetails.map((m) => {
      // If details aren't loaded yet, supply basic mock details derived from the move itself
      const details: MoveDetail = m.details || {
        name: m.name,
        type: 'normal',
        category: 'physical',
        power: null,
        accuracy: null,
        pp: 0,
        priority: 0,
        learnMethod: m.learnMethod,
        levelLearned: m.levelLearned,
        description: 'Loading details...',
      };

      return {
        ...m,
        details,
      };
    });

    // 1. Text Search Filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((m) => m.name.toLowerCase().includes(q));
    }

    // 2. Type Filter
    if (selectedType) {
      result = result.filter((m) => m.details.type === selectedType);
    }

    // 3. Learn Method Filter
    if (selectedMethod) {
      result = result.filter((m) => m.learnMethod === selectedMethod);
    }

    // 4. Category Filter
    if (selectedCategory) {
      result = result.filter((m) => m.details.category === selectedCategory);
    }

    // 5. Sorting
    result.sort((a, b) => {
      let valA: string | number = 0;
      let valB: string | number = 0;

      if (sortField === 'level') {
        valA = a.levelLearned;
        valB = b.levelLearned;
      } else if (sortField === 'name') {
        valA = a.name;
        valB = b.name;
      } else if (sortField === 'power') {
        valA = a.details.power ?? -1;
        valB = b.details.power ?? -1;
      } else if (sortField === 'accuracy') {
        valA = a.details.accuracy ?? -1;
        valB = b.details.accuracy ?? -1;
      }

      if (valA === valB) return 0;
      
      const order = sortOrder === 'asc' ? 1 : -1;
      if (typeof valA === 'string') {
        return valA.localeCompare(String(valB)) * order;
      }
      return (Number(valA) - Number(valB)) * order;
    });

    return result;
  }, [movesWithDetails, searchQuery, selectedType, selectedMethod, selectedCategory, sortField, sortOrder]);

  // Virtualizer setup
  const parentRef = useRef<HTMLDivElement>(null);
  
  const rowVirtualizer = useVirtualizer({
    count: filteredAndSortedMoves.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 56, // height of a row in pixels
    overscan: 10,
  });

  const toggleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const percentLoaded = Math.round(
    ((pokemonMoves.length - uncachedMoveNames.length) / pokemonMoves.length) * 100
  );

  return (
    <div className="space-y-4 font-sans h-full flex flex-col">
      {/* Loading Progress Bar */}
      {uncachedMoveNames.length > 0 && (
        <div className="w-full flex items-center gap-3 bg-blue-50/50 dark:bg-blue-950/20 px-3.5 py-2.5 rounded-xl border border-blue-200/40 dark:border-blue-800/20 text-xs">
          <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-500" />
          <span className="flex-1 text-slate-600 dark:text-slate-400 font-medium font-mono">
            Indexing move stats... {percentLoaded}% ({pokemonMoves.length - uncachedMoveNames.length}/{pokemonMoves.length})
          </span>
          <div className="w-24 h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-500 rounded-full transition-all duration-300"
              style={{ width: `${percentLoaded}%` }}
            />
          </div>
        </div>
      )}

      {/* Filter Inputs Grid */}
      <div className="glass rounded-xl p-4 border border-slate-200/80 dark:border-slate-800/80 space-y-3">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
          <SlidersHorizontal className="w-3.5 h-3.5 text-blue-500" />
          <span>Filter Move Pool</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          {/* Text Search */}
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search moves..."
              className="w-full bg-slate-50/50 dark:bg-slate-950/40 text-slate-800 dark:text-slate-100 text-xs rounded-lg pl-8 pr-3 py-2 border border-slate-200 dark:border-slate-800/60 outline-none focus:border-blue-500/50"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          </div>

          {/* Type Select */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="bg-slate-50/50 dark:bg-slate-950/40 text-slate-800 dark:text-slate-100 text-xs rounded-lg px-2.5 py-2 border border-slate-200 dark:border-slate-800/60 cursor-pointer outline-none focus:border-blue-500/50"
          >
            <option value="">All Types</option>
            {POKEMON_TYPES.map((t) => (
              <option key={t} value={t}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </option>
            ))}
          </select>

          {/* Method Select */}
          <select
            value={selectedMethod}
            onChange={(e) => setSelectedMethod(e.target.value)}
            className="bg-slate-50/50 dark:bg-slate-950/40 text-slate-800 dark:text-slate-100 text-xs rounded-lg px-2.5 py-2 border border-slate-200 dark:border-slate-800/60 cursor-pointer outline-none focus:border-blue-500/50"
          >
            <option value="">All Learn Methods</option>
            <option value="level-up">Level Up</option>
            <option value="machine">TM / HM (Machine)</option>
            <option value="egg">Egg Moves</option>
            <option value="tutor">Tutor Moves</option>
          </select>

          {/* Category Select */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-slate-50/50 dark:bg-slate-950/40 text-slate-800 dark:text-slate-100 text-xs rounded-lg px-2.5 py-2 border border-slate-200 dark:border-slate-800/60 cursor-pointer outline-none focus:border-blue-500/50"
          >
            <option value="">All Categories</option>
            <option value="physical">Physical</option>
            <option value="special">Special</option>
            <option value="status">Status</option>
          </select>
        </div>
      </div>

      {/* Desktop Table Headers & Scroll Container */}
      <div className="flex-1 flex flex-col overflow-hidden min-h-[300px]">
        {filteredAndSortedMoves.length === 0 ? (
          <div className="text-center py-12 text-slate-500 dark:text-slate-400 text-sm">
            No moves matched the selected filters.
          </div>
        ) : (
          <div className="flex flex-col h-full border border-slate-200 dark:border-slate-800/60 rounded-xl overflow-hidden bg-slate-50/20 dark:bg-slate-950/20">
            {/* Headers */}
            <div className="grid grid-cols-6 gap-2 bg-slate-100/70 dark:bg-slate-900/60 px-4 py-3 text-xs font-bold text-slate-400 dark:text-slate-500 tracking-wider uppercase border-b border-slate-200 dark:border-slate-800 select-none">
              <span onClick={() => toggleSort('level')} className="cursor-pointer hover:text-slate-600 dark:hover:text-slate-300 col-span-1">
                Lvl {sortField === 'level' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
              </span>
              <span onClick={() => toggleSort('name')} className="cursor-pointer hover:text-slate-600 dark:hover:text-slate-300 col-span-3 sm:col-span-2">
                Move Name {sortField === 'name' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
              </span>
              <span className="text-center col-span-1">Type</span>
              <span onClick={() => toggleSort('power')} className="cursor-pointer hover:text-slate-600 dark:hover:text-slate-300 text-center col-span-1">
                Pwr {sortField === 'power' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
              </span>
              <span onClick={() => toggleSort('accuracy')} className="cursor-pointer hover:text-slate-600 dark:hover:text-slate-300 text-center hidden sm:block col-span-1">
                Acc {sortField === 'accuracy' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
              </span>
            </div>

            {/* Virtualized scroll element */}
            <div
              ref={parentRef}
              className="flex-1 overflow-y-auto overflow-x-hidden divide-y divide-slate-100 dark:divide-slate-900/40 relative"
            >
              <div
                style={{
                  height: `${rowVirtualizer.getTotalSize()}px`,
                  width: '100%',
                  position: 'relative',
                }}
              >
                {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                  const m = filteredAndSortedMoves[virtualRow.index];
                  const primaryType = m.details.type;
                  const typeStyle = TYPE_COLORS[primaryType];
                  const formattedMoveName = m.name.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

                  return (
                    <div
                      key={virtualRow.key}
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: `${virtualRow.size}px`,
                        transform: `translateY(${virtualRow.start}px)`,
                      }}
                      className="grid grid-cols-6 gap-2 items-center px-4 hover:bg-slate-100/30 dark:hover:bg-slate-900/20 text-sm border-b border-slate-100/10 dark:border-slate-900/10 transition-colors"
                    >
                      {/* Level Learned */}
                      <span className="font-mono text-slate-500 font-medium">
                        {m.learnMethod === 'level-up' ? `Lvl ${m.levelLearned}` : m.learnMethod === 'machine' ? 'TM' : m.learnMethod.charAt(0).toUpperCase() + m.learnMethod.slice(1)}
                      </span>
                      
                      {/* Move Name */}
                      <div className="col-span-3 sm:col-span-2 pr-2">
                        <span className="font-bold text-slate-700 dark:text-slate-200 block truncate" title={m.details.description}>
                          {formattedMoveName}
                        </span>
                        <span className="text-[10px] text-slate-400 block truncate max-w-full font-sans italic leading-tight">
                          {m.details.description === 'Loading details...' ? 'Indexing...' : m.details.description}
                        </span>
                      </div>

                      {/* Type Badge */}
                      <div className="flex justify-center col-span-1">
                        <span
                          className="text-[10px] font-bold px-2 py-0.5 rounded-full border border-opacity-40"
                          style={{
                            backgroundColor: `${typeStyle.bg}22`,
                            borderColor: typeStyle.border,
                            color: typeStyle.bg,
                          }}
                        >
                          {primaryType.toUpperCase()}
                        </span>
                      </div>

                      {/* Power */}
                      <span className="text-center font-mono font-medium text-slate-600 dark:text-slate-300 col-span-1">
                        {m.details.power ?? '—'}
                      </span>

                      {/* Accuracy */}
                      <span className="text-center font-mono font-medium text-slate-600 dark:text-slate-300 hidden sm:block col-span-1">
                        {m.details.accuracy ? `${m.details.accuracy}%` : '—'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default MovesTable;
