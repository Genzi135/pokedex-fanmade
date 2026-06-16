'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { PokemonListItem } from '@/types/pokemon';
import { use3DTilt } from '@/hooks/use3DTilt';
import { useHolographic } from '@/hooks/useHolographic';
import { TYPE_COLORS } from '@/lib/utils/type-colors';
import { STAT_LABELS } from '@/lib/constants';
import TypeBadge from './TypeBadge';
import PokemonArtwork from './PokemonArtwork';

interface PokemonCardProps {
  pokemon: PokemonListItem;
  onClick: (e: React.MouseEvent<HTMLDivElement>) => void;
  prefetch?: () => void;
}

export function PokemonCard({ pokemon, onClick, prefetch }: PokemonCardProps) {
  const tilt = use3DTilt(10); // Strength = 10
  const holoRef = useHolographic();

  // Combine refs for tilt and holographic effects on the same element
  const combinedRef = (node: HTMLDivElement | null) => {
    // Assign node to use3DTilt ref
    (tilt.ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
    // Assign node to useHolographic ref
    (holoRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
  };

  const primaryType = pokemon.types[0] || 'normal';
  const typeStyle = TYPE_COLORS[primaryType];
  const capitalizedName = pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1);
  const paddedId = `#${String(pokemon.id).padStart(3, '0')}`;

  return (
    <motion.div
      ref={combinedRef}
      layoutId={`pokemon-card-${pokemon.id}`}
      onClick={onClick}
      onMouseEnter={prefetch}
      className={`pokemon-card relative w-full aspect-[4/5] rounded-3xl p-5 flex flex-col justify-between cursor-pointer card-perspective holo-effect overflow-hidden glass-interactive group`}
      style={{
        rotateX: tilt.rotateX,
        rotateY: tilt.rotateY,
        transformPerspective: 1000,
      }}
      whileHover={{ scale: 1.03, z: 20 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
    >
      {/* Light-mode and Dark-mode backing tint */}
      <div 
        className="absolute inset-0 opacity-10 dark:opacity-15 group-hover:opacity-15 dark:group-hover:opacity-25 transition-opacity pointer-events-none duration-300"
        style={{
          background: `radial-gradient(circle at 50% 40%, ${typeStyle.bg} 0%, transparent 80%)`
        }}
      />

      {/* Top Header: ID and Type Badges */}
      <div className="flex justify-between items-start z-10">
        <span className="text-sm font-semibold tracking-wider text-slate-400 dark:text-slate-500/80 font-mono">
          {paddedId}
        </span>
        <div className="flex gap-1">
          {pokemon.types.map((type) => (
            <TypeBadge key={type} type={type} size="sm" />
          ))}
        </div>
      </div>

      {/* Middle: Artwork */}
      <div className="flex justify-center items-center my-2 z-10">
        <PokemonArtwork
          pokemonId={pokemon.id}
          name={pokemon.name}
          types={pokemon.types}
          artworkUrl={pokemon.sprite}
          size="md"
          className="group-hover:scale-105 transition-transform duration-300"
        />
      </div>

      {/* Bottom: Name & Stats */}
      <div className="z-10 space-y-2.5">
        <h3 className="text-center text-lg font-bold tracking-tight text-slate-800 dark:text-slate-100 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors">
          {capitalizedName}
        </h3>

        {/* Highlighted stats (HP, ATK, SPD) */}
        <div className="grid grid-cols-3 gap-1 pt-2 border-t border-slate-200/60 dark:border-slate-800/40 text-center font-mono">
          {Object.entries(pokemon.stats).map(([key, val]) => (
            <div key={key} className="space-y-0.5">
              <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                {STAT_LABELS[key] || key}
              </span>
              <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                {val}
              </span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

export default PokemonCard;
