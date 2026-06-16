'use client';

import { useState, useTransition, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { PokemonListItem } from '@/types/pokemon';
import { ITEMS_PER_PAGE } from '@/lib/constants';
import PokemonCard from './PokemonCard';
import SearchBar from '../search/SearchBar';
import FilterPanel from '../search/FilterPanel';
import { PokemonGridSkeleton } from '../ui/LoadingSkeleton';
import { usePokemonStore } from '@/stores/usePokemonStore';
import { getPokemonDetail } from '@/lib/api/pokeapi';
import CaptureSphereTransition from './CaptureSphereTransition';
import PokemonDetail from './PokemonDetail';
import { ArrowLeft, ArrowRight, BookOpen, Heart, Zap } from 'lucide-react';
import { useFavoritesStore } from '@/stores/useFavoritesStore';
import { AnimatePresence, motion } from 'framer-motion';

interface PokemonGridProps {
  initialItems: PokemonListItem[];
  totalCount: number;
}

export function PokemonGrid({ initialItems, totalCount }: PokemonGridProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const cachePokemonDetail = usePokemonStore((state) => state.cachePokemonDetail);
  const getPokemonDetailFromCache = usePokemonStore((state) => state.getPokemonDetailFromCache);
  
  // Favorites & Settings storage
  const favorites = useFavoritesStore((state) => state.favorites);
  const hasHydrated = useFavoritesStore((state) => state.hasHydrated);
  const setHasHydrated = useFavoritesStore((state) => state.setHasHydrated);
  const [isHydrated, setIsHydrated] = useState(false);
  const skipAnimation = useFavoritesStore((state) => state.skipAnimation);
  const toggleSkipAnimation = useFavoritesStore((state) => state.toggleSkipAnimation);

  // Rehydrate favorites store once on load safely on the client
  useEffect(() => {
    if (typeof window !== 'undefined' && !isHydrated) {
      useFavoritesStore.persist.rehydrate();
      setIsHydrated(true);
      if (!hasHydrated) {
        setHasHydrated(true);
      }
    }
  }, [isHydrated, hasHydrated, setHasHydrated]);

  // Client animation states
  const [selectedPokemon, setSelectedPokemon] = useState<PokemonListItem | null>(null);
  const [clickedCardRect, setClickedCardRect] = useState<DOMRect | null>(null);
  const [transitionState, setTransitionState] = useState<'idle' | 'animating' | 'done'>('idle');
  const [activeTab, setActiveTab] = useState<'all' | 'favorites'>('all');

  const currentPage = Number(searchParams.get('page')) || 1;
  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  // Pre-fetch detailed Pokemon data on card hover to accelerate load when clicked
  const handleCardHover = (name: string) => {
    if (!getPokemonDetailFromCache(name)) {
      getPokemonDetail(name).then((data) => {
        if (data) cachePokemonDetail(data);
      }).catch(() => {});
    }
  };

  const handleCardClick = (pokemon: PokemonListItem, e: React.MouseEvent<HTMLDivElement>) => {
    if (skipAnimation) {
      setSelectedPokemon(pokemon);
      setTransitionState('done');
    } else {
      // Capture the bounding rect of the clicked card for the layoutId transition origin
      const cardElement = e.currentTarget.getBoundingClientRect();
      setClickedCardRect(cardElement);
      setSelectedPokemon(pokemon);
      setTransitionState('animating');
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(newPage));
    
    startTransition(() => {
      router.push(`?${params.toString()}`, { scroll: true });
    });
  };

  const handleResetFilters = () => {
    startTransition(() => {
      router.push('/');
    });
  };

  // Filter items in memory if we are on the Favorites tab
  const displayItems = activeTab === 'favorites' && isHydrated
    ? initialItems.filter((item) => favorites.includes(item.id))
    : initialItems;

  const displayCount = activeTab === 'favorites' && isHydrated
    ? displayItems.length
    : totalCount;

  const isFastModeActive = isHydrated && skipAnimation;
  const favoritesCount = isHydrated ? favorites.length : 0;

  return (
    <div className="space-y-6">
      {/* Top Search, Tabs & Filters */}
      <div className="flex flex-col gap-4">
        {/* Toggle between All Pokémon and Favorites */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex p-1 bg-slate-100 dark:bg-slate-900 rounded-xl border border-slate-200/50 dark:border-slate-800/60 max-w-xs w-full sm:w-auto">
            <button
              onClick={() => setActiveTab('all')}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'all'
                  ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              All Fanimon
            </button>
            <button
              onClick={() => setActiveTab('favorites')}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'favorites'
                  ? 'bg-white dark:bg-slate-800 text-rose-600 dark:text-rose-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Heart className={`w-4 h-4 ${activeTab === 'favorites' ? 'fill-rose-500' : ''}`} />
              Favorites ({favoritesCount})
            </button>
          </div>
          
          <div className="flex items-center justify-between sm:justify-start gap-4 w-full sm:w-auto">
            {/* Fast Mode (Skip Catch Animation) */}
            <button
              onClick={toggleSkipAnimation}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all border ${
                isFastModeActive
                  ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30'
                  : 'glass-interactive text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-800/80'
              }`}
              title="Skip catch transition animations for instant navigation"
            >
              <Zap className={`w-3.5 h-3.5 ${isFastModeActive ? 'fill-amber-500 text-amber-500 animate-pulse' : ''}`} />
              <span>Fast Mode</span>
            </button>

            {isPending && (
              <span className="text-xs text-slate-400 dark:text-slate-500 animate-pulse font-mono">
                Syncing Fandex...
              </span>
            )}
          </div>
        </div>

        {/* Inputs */}
        <div className="grid grid-cols-1 gap-4">
          <SearchBar isPending={isPending} />
          <FilterPanel isPending={isPending} />
        </div>
      </div>

      {/* Grid Content */}
      {isPending ? (
        <PokemonGridSkeleton count={12} />
      ) : displayItems.length === 0 ? (
        <div className="text-center py-16 rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 max-w-lg mx-auto space-y-4">
          <p className="text-slate-500 dark:text-slate-400 font-medium">
            No Fanimon found matching your criteria.
          </p>
          <button
            onClick={handleResetFilters}
            className="px-5 py-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-xl text-sm transition-colors active:scale-95 shadow-md shadow-blue-500/10"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <motion.div 
          layout="position"
          className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6"
        >
          {displayItems.map((pokemon) => (
            <PokemonCard
              key={pokemon.id}
              pokemon={pokemon}
              onClick={(e) => handleCardClick(pokemon, e)}
              prefetch={() => handleCardHover(pokemon.name)}
            />
          ))}
        </motion.div>
      )}

      {/* Pagination (only active on All tab) */}
      {activeTab === 'all' && totalPages > 1 && !isPending && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 border-t border-slate-200/50 dark:border-slate-800/50">
          <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
            Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} - {Math.min(currentPage * ITEMS_PER_PAGE, displayCount)} of {displayCount} Fanimon
          </p>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl glass-interactive hover:scale-105 active:scale-95 disabled:opacity-40 disabled:pointer-events-none text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800/80 text-sm font-semibold transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              Previous
            </button>
            
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                // Display page range centered around current page
                let pageNum = i + 1;
                if (currentPage > 3 && totalPages > 5) {
                  pageNum = currentPage - 2 + i;
                  if (pageNum + (4 - i) > totalPages) {
                    pageNum = totalPages - 4 + i;
                  }
                }
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`w-9 h-9 flex items-center justify-center rounded-xl text-sm font-semibold transition-all ${
                      currentPage === pageNum
                        ? 'bg-blue-500 text-white shadow-md shadow-blue-500/10'
                        : 'glass-interactive text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 border border-slate-200 dark:border-slate-800/80'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl glass-interactive hover:scale-105 active:scale-95 disabled:opacity-40 disabled:pointer-events-none text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800/80 text-sm font-semibold transition-all"
            >
              Next
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Capture Sphere Transition Coordinator */}
      <AnimatePresence>
        {selectedPokemon && transitionState === 'animating' && clickedCardRect && (
          <CaptureSphereTransition
            key={`transition-${selectedPokemon.id}`}
            cardRect={clickedCardRect}
            onComplete={() => {
              setTransitionState('done');
            }}
          />
        )}
      </AnimatePresence>

      {/* Full Pokémon Detail Overlay Modal */}
      {selectedPokemon && transitionState === 'done' && (
        <PokemonDetail
          key={`detail-${selectedPokemon.id}`}
          pokemonId={selectedPokemon.id}
          onClose={() => {
            setTransitionState('idle');
            setSelectedPokemon(null);
            setClickedCardRect(null);
          }}
        />
      )}
    </div>
  );
}

export default PokemonGrid;
