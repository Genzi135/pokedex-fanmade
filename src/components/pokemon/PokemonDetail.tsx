'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import FocusTrap from 'focus-trap-react';
import { motion } from 'framer-motion';
import { PokemonDetail as IPokemonDetail, TypeEffectiveness } from '@/types/pokemon';
import { getPokemonDetail, getAbilityDetail } from '@/lib/api/pokeapi';
import { usePokemonStore } from '@/stores/usePokemonStore';
import { useFavoritesStore } from '@/stores/useFavoritesStore';
import { calculateTypeEffectiveness } from '@/lib/utils/weaknesses';
import { TYPE_COLORS } from '@/lib/utils/type-colors';
import { STAT_LABELS } from '@/lib/constants';
import TypeBadge from './TypeBadge';
import PokemonArtwork from './PokemonArtwork';
import StatsBar from './StatsBar';
import EvolutionChain from './EvolutionChain';
import MovesTable from './MovesTable';
import {
  Volume2,
  X,
  Heart,
  ChevronLeft,
  ChevronRight,
  Info,
  BarChart3,
  Award,
  Layers,
  GitBranch,
  Loader2,
} from 'lucide-react';
import ErrorState from '../ui/ErrorState';


interface PokemonDetailProps {
  pokemonId: number;
  onClose: () => void;
}

type TabType = 'overview' | 'stats' | 'moves' | 'evolution' | 'abilities';

export function PokemonDetail({ pokemonId, onClose }: PokemonDetailProps) {
  const [activeId, setActiveId] = useState(pokemonId);
  const [detail, setDetail] = useState<IPokemonDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile screen width for responsive artwork sizes
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  // Tab control
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  // Cache stores
  const cachePokemonDetail = usePokemonStore((state) => state.cachePokemonDetail);
  const getPokemonDetailFromCache = usePokemonStore((state) => state.getPokemonDetailFromCache);
  const abilitiesCache = usePokemonStore((state) => state.abilitiesCache);
  const cacheAbilityDetail = usePokemonStore((state) => state.cacheAbilityDetail);

  // Favorites
  const toggleFavorite = useFavoritesStore((state) => state.toggle);
  const isFavorite = useFavoritesStore((state) => state.isFavorite(activeId));

  // Weaknesses
  const [effectiveness, setEffectiveness] = useState<TypeEffectiveness | null>(null);

  // Abilities details
  const [abilitiesWithDesc, setAbilitiesWithDesc] = useState<
    Array<{ name: string; isHidden: boolean; slot: number; description: string }>
  >([]);
  const [loadingAbilities, setLoadingAbilities] = useState(false);

  // Swipe navigation detection
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // Modal element reference
  const modalContentRef = useRef<HTMLDivElement>(null);

  // Fetch or retrieve Pokémon from cache
  useEffect(() => {
    let active = true;

    async function loadDetail() {
      try {
        setLoading(true);
        setError(false);
        setEffectiveness(null);
        setAbilitiesWithDesc([]);

        // 1. Try to read from cache first
        const cached = getPokemonDetailFromCache(activeId);
        let currentDetail = cached || null;

        if (!currentDetail) {
          currentDetail = await getPokemonDetail(activeId);
          cachePokemonDetail(currentDetail);
        }

        if (active && currentDetail) {
          setDetail(currentDetail);
          
          // Calculate weaknesses/resistances asynchronously
          const eff = await calculateTypeEffectiveness(currentDetail.types);
          if (active) {
            setEffectiveness(eff);
          }
          
          setLoading(false);
        }
      } catch (err) {
        console.error('Error fetching detail:', err);
        if (active) {
          setError(true);
          setLoading(false);
        }
      }
    }

    loadDetail();

    return () => {
      active = false;
    };
  }, [activeId, getPokemonDetailFromCache, cachePokemonDetail]);

  // Load detailed ability descriptions when the 'abilities' tab is selected
  useEffect(() => {
    if (!detail || activeTab !== 'abilities') return;

    let active = true;

    async function loadAbilities() {
      setLoadingAbilities(true);
      const list = await Promise.all(
        detail!.abilities.map(async (ab) => {
          const cachedDesc = abilitiesCache[ab.name.toLowerCase()];
          if (cachedDesc) {
            return { ...ab, description: cachedDesc.description };
          }
          try {
            const res = await getAbilityDetail(ab.name);
            cacheAbilityDetail(res);
            return { ...ab, description: res.description };
          } catch {
            return { ...ab, description: 'Ability description unavailable.' };
          }
        })
      );
      
      if (active) {
        setAbilitiesWithDesc(list);
        setLoadingAbilities(false);
      }
    }

    loadAbilities();

    return () => {
      active = false;
    };
  }, [detail, activeTab, abilitiesCache, cacheAbilityDetail]);

  // Handle navigation
  const handlePrev = useCallback(() => {
    if (activeId > 1) {
      setActiveId(activeId - 1);
    }
  }, [activeId]);

  const handleNext = useCallback(() => {
    if (activeId < 1025) {
      setActiveId(activeId + 1);
    }
  }, [activeId]);

  // Keyboard navigation controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeId, handlePrev, handleNext, onClose]);

  // Touch Swipe handlers for mobile swipe controls
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isSwipe = Math.abs(distance) > 50;

    if (isSwipe) {
      if (distance > 0) {
        handleNext(); // Swipe left to next
      } else {
        handlePrev(); // Swipe right to prev
      }
    }
    setTouchStart(null);
    setTouchEnd(null);
  };

  // Play Pokémon Cry Audio
  const playCry = useCallback(() => {
    if (!detail) return;
    // Play using standard HTML5 Audio
    const cryUrl = detail.cry || `https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/${detail.id}.ogg`;
    const audio = new Audio(cryUrl);
    audio.volume = 0.35;
    audio.play().catch(() => {
      // Fallback to legacy cry endpoint if audio fails
      const fallbackUrl = `https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/legacy/${detail.id}.ogg`;
      const fallbackAudio = new Audio(fallbackUrl);
      fallbackAudio.volume = 0.35;
      fallbackAudio.play().catch((err) => console.warn('Cries not supported or failed to load:', err));
    });
  }, [detail]);

  // Autoplay cry when Pokemon details load
  useEffect(() => {
    if (detail && !loading) {
      const timer = setTimeout(() => playCry(), 300);
      return () => clearTimeout(timer);
    }
  }, [detail, loading, playCry]);

  // Custom SVG Radar Chart for Stats Tab
  const renderRadarChart = () => {
    if (!detail) return null;
    
    const statsKeys = Object.keys(detail.stats) as Array<keyof typeof detail.stats>;
    const center = 100;
    const radius = 70;
    
    // Coordinates of vertices (6-sided)
    // Angles: 0, 60, 120, 180, 240, 300 degrees in radians
    const points = statsKeys.map((key, index) => {
      const angle = (index * 60 - 90) * (Math.PI / 180);
      const statVal = detail.stats[key];
      const normalizedVal = Math.min(255, statVal) / 255;
      const x = center + radius * normalizedVal * Math.cos(angle);
      const y = center + radius * normalizedVal * Math.sin(angle);
      return { x, y };
    });

    const polygonPointsStr = points.map((p) => `${p.x},${p.y}`).join(' ');

    // Outer grid rings
    const rings = [0.25, 0.5, 0.75, 1.0].map((ringPercent) => {
      return statsKeys.map((_, index) => {
        const angle = (index * 60 - 90) * (Math.PI / 180);
        const x = center + radius * ringPercent * Math.cos(angle);
        const y = center + radius * ringPercent * Math.sin(angle);
        return `${x},${y}`;
      }).join(' ');
    });

    // Outer labels positioning
    const labels = statsKeys.map((key, index) => {
      const angle = (index * 60 - 90) * (Math.PI / 180);
      const labelRadius = radius + 18;
      const x = center + labelRadius * Math.cos(angle);
      const y = center + labelRadius * Math.sin(angle);
      const labelText = STAT_LABELS[key] || key;
      return { x, y, text: labelText };
    });

    return (
      <div className="flex justify-center py-4 bg-slate-50/50 dark:bg-slate-900/40 rounded-3xl border border-slate-200/50 dark:border-slate-800/60 p-4">
        <svg viewBox="0 0 200 200" className="w-56 h-56 font-bold font-mono">
          {/* Grid rings */}
          {rings.map((ringPoints, i) => (
            <polygon
              key={i}
              points={ringPoints}
              fill="none"
              className="stroke-slate-200 dark:stroke-slate-800/80"
              strokeWidth="0.5"
            />
          ))}

          {/* Grid axis lines */}
          {statsKeys.map((_, index) => {
            const angle = (index * 60 - 90) * (Math.PI / 180);
            const x = center + radius * Math.cos(angle);
            const y = center + radius * Math.sin(angle);
            return (
              <line
                key={index}
                x1={center}
                y1={center}
                x2={x}
                y2={y}
                className="stroke-slate-200 dark:stroke-slate-800/80"
                strokeWidth="0.5"
              />
            );
          })}

          {/* Filled polygon for stats */}
          <polygon
            points={polygonPointsStr}
            fill={`${TYPE_COLORS[detail.types[0]].bg}44`}
            stroke={TYPE_COLORS[detail.types[0]].bg}
            strokeWidth="1.5"
            className="transition-all duration-500"
          />

          {/* Vertex handles */}
          {points.map((p, index) => (
            <circle
              key={index}
              cx={p.x}
              cy={p.y}
              r="3.5"
              fill={TYPE_COLORS[detail.types[0]].bg}
              className="stroke-white dark:stroke-slate-900"
              strokeWidth="1.5"
            />
          ))}

          {/* Labels */}
          {labels.map((lbl, index) => {
            // Adjust text anchors based on angle positions
            let anchor: 'inherit' | 'middle' | 'end' | 'start' = 'middle';
            if (lbl.x > center + 10) anchor = 'start';
            if (lbl.x < center - 10) anchor = 'end';
            
            return (
              <text
                key={index}
                x={lbl.x}
                y={lbl.y + 4}
                textAnchor={anchor}
                className="text-[8px] fill-slate-400 dark:fill-slate-500 uppercase tracking-wider font-semibold"
              >
                {lbl.text}
              </text>
            );
          })}
        </svg>
      </div>
    );
  };

  const primaryType = detail?.types[0] || 'normal';
  const typeStyle = TYPE_COLORS[primaryType];
  const capitalizedName = detail ? detail.name.charAt(0).toUpperCase() + detail.name.slice(1) : 'Loading...';
  const paddedId = detail ? `#${String(detail.id).padStart(3, '0')}` : '#000';

  return (
    <FocusTrap active={!loading && !error && !!detail}>
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-8"
        role="dialog"
        aria-modal="true"
      >
        {/* Background Overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-md cursor-pointer"
        />

        {/* Modal Container */}
        <motion.div
          ref={modalContentRef}
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 250 }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className="relative w-full max-w-5xl h-[90vh] md:h-[80vh] rounded-3xl overflow-y-auto md:overflow-hidden glass border border-slate-200 dark:border-slate-800/80 shadow-2xl flex flex-col md:flex-row z-10"
        >
          {loading ? (
            <div className="flex-1 flex flex-col items-center justify-center p-12 space-y-4">
              <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 font-mono animate-pulse">
                Decrypting Fandex Database...
              </p>
            </div>
          ) : error || !detail ? (
            <div className="flex-1">
              <ErrorState title="Database Link Severed" onRetry={() => setActiveId(activeId)} />
            </div>
          ) : (
            <>
              {/* Left Column: Visual Artwork Area */}
              <div 
                className="w-full md:w-2/5 p-4 md:p-6 flex flex-col justify-between items-center relative border-b md:border-b-0 md:border-r border-slate-200/50 dark:border-slate-800/40 select-none flex-shrink-0"
              >
                {/* Visual Backdrop Color Glow */}
                <div 
                  className="absolute inset-0 opacity-15 dark:opacity-20 pointer-events-none"
                  style={{
                    background: `radial-gradient(circle at 50% 50%, ${typeStyle.bg} 0%, transparent 70%)`
                  }}
                />

                {/* Left Column Top: Navigation & Favorite Actions */}
                <div className="w-full flex justify-between items-center z-10">
                  <div className="flex gap-2">
                    <button
                      onClick={handlePrev}
                      disabled={activeId <= 1}
                      className="w-9 h-9 flex items-center justify-center rounded-xl glass-interactive hover:scale-105 active:scale-95 disabled:opacity-30 disabled:pointer-events-none text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800"
                      aria-label="Previous Fanimon"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={handleNext}
                      disabled={activeId >= 1025}
                      className="w-9 h-9 flex items-center justify-center rounded-xl glass-interactive hover:scale-105 active:scale-95 disabled:opacity-30 disabled:pointer-events-none text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800"
                      aria-label="Next Fanimon"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={playCry}
                      className="w-9 h-9 flex items-center justify-center rounded-xl glass-interactive hover:scale-105 active:scale-95 text-blue-500 border border-slate-200 dark:border-slate-800"
                      aria-label="Play cry sound"
                      title="Play Creature Cry"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => toggleFavorite(detail.id)}
                      className={`w-9 h-9 flex items-center justify-center rounded-xl glass-interactive hover:scale-105 active:scale-95 border border-slate-200 dark:border-slate-800 ${
                        isFavorite ? 'text-rose-500' : 'text-slate-400 dark:text-slate-500'
                      }`}
                      aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                    >
                      <Heart className={`w-4 h-4 ${isFavorite ? 'fill-rose-500' : ''}`} />
                    </button>
                    {/* Mobile Close Button */}
                    <button
                      onClick={onClose}
                      className="w-9 h-9 flex items-center justify-center rounded-xl glass-interactive hover:scale-105 active:scale-95 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800 md:hidden"
                      aria-label="Close detail modal"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Left Column Mid: Large Artwork Display */}
                <div className="my-2 md:my-auto flex flex-col items-center justify-center z-10">
                  <span className="text-xs font-bold font-mono tracking-widest text-slate-400 dark:text-slate-500/80 mb-2">
                    {paddedId}
                  </span>
                  
                  <PokemonArtwork
                    pokemonId={detail.id}
                    name={detail.name}
                    types={detail.types}
                    artworkUrl={detail.artwork}
                    gifUrl={detail.gif}
                    preferGif={true} // Play gif if available
                    size={isMobile ? 'md' : 'lg'}
                    priority
                  />
                  
                  <h2 className="text-2xl md:text-3xl font-extrabold text-slate-800 dark:text-white mt-4 tracking-tight">
                    {capitalizedName}
                  </h2>
                  
                  <div className="flex gap-1.5 mt-3">
                    {detail.types.map((t) => (
                      <TypeBadge key={t} type={t} size="md" />
                    ))}
                  </div>
                </div>

                {/* Left Column Bottom: Core Dimension Badges */}
                <div className="w-full grid grid-cols-2 gap-3 md:gap-4 border-t border-slate-200/50 dark:border-slate-800/40 pt-3 md:pt-4 z-10">
                  <div className="bg-slate-50/50 dark:bg-slate-900/30 p-2.5 rounded-2xl text-center border border-slate-100 dark:border-slate-900/50">
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-widest font-mono font-bold block">
                      Height
                    </span>
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-200 font-mono">
                      {detail.height} m
                    </span>
                  </div>
                  <div className="bg-slate-50/50 dark:bg-slate-900/30 p-2.5 rounded-2xl text-center border border-slate-100 dark:border-slate-900/50">
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-widest font-mono font-bold block">
                      Weight
                    </span>
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-200 font-mono">
                      {detail.weight} kg
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Column: Interactive details and Tab views */}
              <div 
                className="flex-1 flex flex-col overflow-visible md:overflow-hidden bg-white/45 dark:bg-slate-950/25"
                onTouchStart={(e) => e.stopPropagation()}
                onTouchMove={(e) => e.stopPropagation()}
                onTouchEnd={(e) => e.stopPropagation()}
              >
                {/* Right Column Header (Tabs & Close Button) */}
                <div className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200 dark:border-slate-800/80 bg-slate-50/95 dark:bg-slate-950/90 backdrop-blur-md pr-4 pl-4">
                  {/* Tabs Bar (Segmented Control) */}
                  <div className="flex-1 flex overflow-x-auto no-scrollbar py-3 pr-2">
                    <div className="flex p-1 bg-slate-100/80 dark:bg-slate-900/60 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 w-max">
                      {(
                        [
                          { id: 'overview', label: 'Overview', icon: Info },
                          { id: 'stats', label: 'Base Stats', icon: BarChart3 },
                          { id: 'moves', label: 'Moves', icon: Layers },
                          { id: 'evolution', label: 'Evolution', icon: GitBranch },
                          { id: 'abilities', label: 'Abilities', icon: Award },
                        ] as const
                      ).map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                          <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`relative flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl transition-colors select-none whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 ${
                              isActive
                                ? 'shadow-sm z-10'
                                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-200/50 dark:hover:bg-slate-800/40'
                            }`}
                            style={{
                              color: isActive ? typeStyle.text : undefined,
                            }}
                          >
                            <Icon className="w-3.5 h-3.5 relative z-10" />
                            <span className="relative z-10">{tab.label}</span>
                            {isActive && (
                              <motion.div
                                layoutId="active-detail-tab"
                                className="absolute inset-0 rounded-lg -z-10 border"
                                style={{
                                  backgroundColor: typeStyle.bg,
                                  borderColor: typeStyle.border,
                                }}
                                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                              />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  
                  {/* Desktop Close Button */}
                  <button
                    onClick={onClose}
                    className="hidden md:flex w-9 h-9 items-center justify-center rounded-xl glass-interactive hover:scale-105 active:scale-95 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800 ml-2 cursor-pointer flex-shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
                    aria-label="Close detail modal"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Tab content panel */}
                <div className="flex-grow overflow-visible md:overflow-y-auto md:flex-1 p-4 md:p-6 scroll-smooth min-h-0">
                  {/* OVERVIEW TAB */}
                  {activeTab === 'overview' && (
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <h4 className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider font-mono">
                          Fandex Entry
                        </h4>
                        <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed bg-slate-50/50 dark:bg-slate-900/30 p-4 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 font-sans italic">
                          &ldquo;{detail.description}&rdquo;
                        </p>
                      </div>

                      {/* Weaknesses Panel */}
                      <div className="space-y-3">
                        <h4 className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider font-mono">
                          Combat Effectiveness
                        </h4>
                        
                        {effectiveness ? (
                          <div className="space-y-4">
                            {/* Weak To */}
                            {effectiveness.weakTo.length > 0 && (
                              <div className="space-y-2">
                                <span className="text-[10px] font-bold text-rose-500 dark:text-rose-400 uppercase tracking-wider font-mono">
                                  Weaknesses (Takes Increased Damage)
                                </span>
                                <div className="flex flex-wrap gap-1.5">
                                  {effectiveness.weakTo.map((w) => (
                                    <div key={w.type} className="flex items-center scale-90 origin-left">
                                      <TypeBadge type={w.type} size="sm" />
                                      <span className="ml-1 text-[10px] font-bold font-mono px-1 rounded bg-rose-50 dark:bg-rose-950/40 text-rose-500 dark:text-rose-400 border border-rose-100 dark:border-rose-900/30">
                                        {w.multiplier}x
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Resistant To */}
                            {effectiveness.resistantTo.length > 0 && (
                              <div className="space-y-2">
                                <span className="text-[10px] font-bold text-emerald-500 dark:text-emerald-400 uppercase tracking-wider font-mono">
                                  Resistances (Takes Reduced Damage)
                                </span>
                                <div className="flex flex-wrap gap-1.5">
                                  {effectiveness.resistantTo.map((r) => (
                                    <div key={r.type} className="flex items-center scale-90 origin-left">
                                      <TypeBadge type={r.type} size="sm" />
                                      <span className="ml-1 text-[10px] font-bold font-mono px-1 rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-500 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30">
                                        {r.multiplier}x
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Immune To */}
                            {effectiveness.immuneTo.length > 0 && (
                              <div className="space-y-2">
                                <span className="text-[10px] font-bold text-sky-500 dark:text-sky-400 uppercase tracking-wider font-mono">
                                  Immunities (Takes No Damage)
                                </span>
                                <div className="flex flex-wrap gap-1.5">
                                  {effectiveness.immuneTo.map((imm) => (
                                    <div key={imm} className="scale-90 origin-left">
                                      <TypeBadge type={imm} size="sm" />
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="h-10 bg-slate-200 dark:bg-slate-800 animate-pulse rounded-lg" />
                        )}
                      </div>

                      {/* Scientific Profile */}
                      <div className="space-y-3 pt-2">
                        <h4 className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider font-mono">
                          Scientific Profile
                        </h4>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-xs">
                          <div className="glass border border-slate-200/50 dark:border-slate-800/40 p-4 rounded-2xl flex justify-between items-center">
                            <span className="font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Generation</span>
                            <span className="font-bold text-slate-700 dark:text-slate-200">{detail.generation}</span>
                          </div>
                          <div className="glass border border-slate-200/50 dark:border-slate-800/40 p-4 rounded-2xl flex justify-between items-center">
                            <span className="font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Habitat</span>
                            <span className="font-bold text-slate-700 dark:text-slate-200 uppercase">
                              {detail.habitat || 'Unknown'}
                            </span>
                          </div>
                          <div className="glass border border-slate-200/50 dark:border-slate-800/40 p-4 rounded-2xl flex justify-between items-center">
                            <span className="font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Base Experience</span>
                            <span className="font-bold text-slate-700 dark:text-slate-200">{detail.baseExperience} EXP</span>
                          </div>
                          <div className="glass border border-slate-200/50 dark:border-slate-800/40 p-4 rounded-2xl flex justify-between items-center">
                            <span className="font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Capture Rate</span>
                            <span className="font-bold text-slate-700 dark:text-slate-200">{detail.captureRate} / 255</span>
                          </div>
                          <div className="glass border border-slate-200/50 dark:border-slate-800/40 p-4 rounded-2xl flex justify-between items-center">
                            <span className="font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Coloring</span>
                            <span className="font-bold text-slate-700 dark:text-slate-200 uppercase">{detail.color}</span>
                          </div>
                          <div className="glass border border-slate-200/50 dark:border-slate-800/40 p-4 rounded-2xl flex justify-between items-center">
                            <span className="font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Shape</span>
                            <span className="font-bold text-slate-700 dark:text-slate-200 uppercase">{detail.shape}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* BASE STATS TAB */}
                  {activeTab === 'stats' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                      <div className="space-y-1">
                        <h4 className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider font-mono mb-2">
                          Core Attributes
                        </h4>
                        {Object.entries(detail.stats).map(([key, val]) => (
                          <StatsBar
                            key={key}
                            label={STAT_LABELS[key] || key}
                            value={val}
                            max={255}
                          />
                        ))}
                        <div className="flex justify-between items-center pt-4 border-t border-slate-200/50 dark:border-slate-800/40 font-mono mt-4">
                          <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                            Base Stat Total
                          </span>
                          <span className="text-lg font-extrabold text-slate-800 dark:text-white">
                            {Object.values(detail.stats).reduce((a, b) => a + b, 0)}
                          </span>
                        </div>
                      </div>
                      
                      {/* Interactive Radar Chart */}
                      <div className="flex flex-col items-center">
                        <h4 className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider font-mono mb-2 self-start lg:self-center">
                          Performance Matrix
                        </h4>
                        {renderRadarChart()}
                      </div>
                    </div>
                  )}

                  {/* MOVES TAB (Lazy table list) */}
                  {activeTab === 'moves' && (
                    <div className="h-full">
                      <MovesTable pokemonMoves={detail.moves} />
                    </div>
                  )}

                  {/* EVOLUTION TAB */}
                  {activeTab === 'evolution' && (
                    <div className="space-y-4">
                      <div className="space-y-1">
                        <h4 className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider font-mono">
                          Evolution Pathways
                        </h4>
                        <p className="text-xs text-slate-400 dark:text-slate-500">
                          Click on any Fanimon node below to inspect its record details.
                        </p>
                      </div>
                      <EvolutionChain
                        chainId={detail.evolutionChainId}
                        currentPokemonName={detail.name}
                        onNodeClick={(name) => {
                          // Fetch and change active details based on name
                          getPokemonDetail(name).then((data) => {
                            if (data) {
                              cachePokemonDetail(data);
                              setActiveId(data.id);
                              setActiveTab('overview');
                            }
                          });
                        }}
                      />
                    </div>
                  )}

                  {/* ABILITIES TAB */}
                  {activeTab === 'abilities' && (
                    <div className="space-y-4">
                      <h4 className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider font-mono mb-4">
                        Genetic Abilities
                      </h4>
                      
                      {loadingAbilities ? (
                        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 py-6 text-sm font-mono">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Sequencing abilities...
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {abilitiesWithDesc.map((ab) => {
                            const formattedAbName = ab.name.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
                            return (
                              <div
                                key={ab.name}
                                className="glass border border-slate-200/50 dark:border-slate-800/40 p-4 rounded-2xl relative"
                              >
                                <div className="flex items-center justify-between mb-1.5">
                                  <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                                    {formattedAbName}
                                  </span>
                                  {ab.isHidden && (
                                    <span className="text-[9px] font-bold font-mono px-2 py-0.5 rounded-full border border-rose-500/20 bg-rose-500/10 text-rose-500 uppercase tracking-wider">
                                      Hidden Ability
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-sans font-medium">
                                  {ab.description}
                                </p>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}


                </div>
              </div>
            </>
          )}

          {/* Empty spacer replacing old close overlay button */}
        </motion.div>
      </div>
    </FocusTrap>
  );
}

export default PokemonDetail;
