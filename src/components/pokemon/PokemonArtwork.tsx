'use client';

import Image from 'next/image';
import { useState } from 'react';
import { motion, MotionProps } from 'framer-motion';
import { PokemonType } from '@/types/pokemon';
import { ShieldAlert } from 'lucide-react';

interface PokemonArtworkProps {
  pokemonId: number;
  name: string;
  types: PokemonType[];
  artworkUrl: string;
  gifUrl?: string | null;
  preferGif?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  priority?: boolean;
}

function getIdleAnimation(types: PokemonType[]): MotionProps {
  const primary = types[0] || 'normal';

  const animations: Record<string, MotionProps> = {
    flying: {
      animate: { y: [0, -12, 0] },
      transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
    },
    water: {
      animate: { y: [0, -6, 0], scale: [1, 1.02, 1] },
      transition: { duration: 2.5, repeat: Infinity, ease: 'easeInOut' },
    },
    fire: {
      animate: { y: [0, -4, 0], rotate: [-1, 1, -1] },
      transition: { duration: 1.5, repeat: Infinity, ease: 'easeInOut' },
    },
    electric: {
      animate: { x: [0, 2, -2, 0], y: [0, -2, 0] },
      transition: { duration: 0.8, repeat: Infinity, ease: 'linear' },
    },
    ghost: {
      animate: { y: [0, -8, 0], opacity: [1, 0.75, 1] },
      transition: { duration: 2.2, repeat: Infinity, ease: 'easeInOut' },
    },
    psychic: {
      animate: { y: [0, -6, 0], rotate: [-2, 2, -2] },
      transition: { duration: 2.5, repeat: Infinity, ease: 'easeInOut' },
    },
    default: {
      animate: { y: [0, -4, 0] },
      transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
    },
  };

  return animations[primary] ?? animations.default;
}

export function PokemonArtwork({
  pokemonId,
  name,
  types,
  artworkUrl,
  gifUrl,
  preferGif = false,
  size = 'md',
  className = '',
  priority = false,
}: PokemonArtworkProps) {
  const [error, setError] = useState(false);
  
  const widthHeight = {
    sm: 80,
    md: 120,
    lg: 180,
    xl: 240,
  }[size];

  const containerAnimation = getIdleAnimation(types);

  const displayUrl = preferGif && gifUrl && !error ? gifUrl : artworkUrl;

  const titleName = name.charAt(0).toUpperCase() + name.slice(1);

  return (
    <motion.div
      {...containerAnimation}
      className={`relative flex items-center justify-center select-none ${className}`}
      style={{ width: widthHeight, height: widthHeight }}
    >
      {error || !displayUrl ? (
        // Pokemon silhouette placeholder on load error
        <div 
          className="relative flex items-center justify-center rounded-full bg-slate-300/40 dark:bg-slate-700/20 text-slate-400 dark:text-slate-600 animate-pulse"
          style={{ width: widthHeight * 0.8, height: widthHeight * 0.8 }}
        >
          <Image
            src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemonId}.png`}
            alt="Placeholder silhouette"
            width={widthHeight}
            height={widthHeight}
            className="brightness-0 opacity-20 pointer-events-none"
            unoptimized
          />
          <ShieldAlert className="absolute w-6 h-6 text-slate-400 dark:text-slate-500" />
        </div>
      ) : (
        <Image
          src={displayUrl}
          alt={`Official artwork of ${titleName}`}
          width={widthHeight}
          height={widthHeight}
          className="object-contain drop-shadow-[0_8px_16px_rgba(0,0,0,0.15)] dark:drop-shadow-[0_12px_24px_rgba(0,0,0,0.4)] pointer-events-none transition-all duration-300"
          onError={() => {
            // Fallback to official artwork if GIF error, or fallback to silhouette if artwork fails
            if (preferGif && gifUrl) {
              setError(true);
            } else {
              setError(true);
            }
          }}
          priority={priority}
          unoptimized={preferGif || displayUrl.endsWith('.gif')} // unoptimized for gifs
        />
      )}
    </motion.div>
  );
}

export default PokemonArtwork;
