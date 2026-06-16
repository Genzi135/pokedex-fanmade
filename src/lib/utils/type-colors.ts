import { PokemonType } from '@/types/pokemon';

export interface TypeStyle {
  bg: string;       // Hex color for background
  text: string;     // Hex color for text
  border: string;   // Hex color for border
  rgbBg: string;    // RGB components for opacity manipulation
  gradient: string; // Tailwind class or linear-gradient style
  shadow: string;   // Tailwind box-shadow style/color
}

export const TYPE_COLORS: Record<PokemonType, TypeStyle> = {
  normal: {
    bg: '#A8A878',
    text: '#FFFFFF',
    border: '#6D6D4E',
    rgbBg: '168, 168, 120',
    gradient: 'from-gray-400 to-gray-500 dark:from-neutral-700 dark:to-neutral-800',
    shadow: 'shadow-gray-400/50',
  },
  fire: {
    bg: '#F08030',
    text: '#FFFFFF',
    border: '#B85510',
    rgbBg: '240, 128, 48',
    gradient: 'from-orange-500 to-red-600 dark:from-orange-700 dark:to-red-800',
    shadow: 'shadow-orange-500/50',
  },
  water: {
    bg: '#6890F0',
    text: '#FFFFFF',
    border: '#3860B0',
    rgbBg: '104, 144, 240',
    gradient: 'from-blue-400 to-blue-600 dark:from-blue-700 dark:to-blue-900',
    shadow: 'shadow-blue-500/50',
  },
  grass: {
    bg: '#78C850',
    text: '#FFFFFF',
    border: '#4E8235',
    rgbBg: '120, 200, 80',
    gradient: 'from-green-400 to-emerald-600 dark:from-green-700 dark:to-emerald-800',
    shadow: 'shadow-green-500/50',
  },
  electric: {
    bg: '#F8D030',
    text: '#333333',
    border: '#B89500',
    rgbBg: '248, 208, 48',
    gradient: 'from-yellow-300 to-yellow-500 dark:from-yellow-600 dark:to-yellow-700',
    shadow: 'shadow-yellow-400/50',
  },
  ice: {
    bg: '#98D8D8',
    text: '#333333',
    border: '#60A8A8',
    rgbBg: '152, 216, 216',
    gradient: 'from-cyan-300 to-teal-400 dark:from-cyan-600 dark:to-teal-800',
    shadow: 'shadow-cyan-400/50',
  },
  fighting: {
    bg: '#C03028',
    text: '#FFFFFF',
    border: '#802018',
    rgbBg: '192, 48, 40',
    gradient: 'from-red-600 to-red-800 dark:from-red-800 dark:to-red-955',
    shadow: 'shadow-red-600/50',
  },
  poison: {
    bg: '#A040A0',
    text: '#FFFFFF',
    border: '#682868',
    rgbBg: '160, 64, 160',
    gradient: 'from-purple-500 to-fuchsia-700 dark:from-purple-700 dark:to-fuchsia-900',
    shadow: 'shadow-purple-500/50',
  },
  ground: {
    bg: '#E0C068',
    text: '#333333',
    border: '#AA8F48',
    rgbBg: '224, 192, 104',
    gradient: 'from-amber-400 to-amber-600 dark:from-amber-700 dark:to-amber-800',
    shadow: 'shadow-amber-500/50',
  },
  flying: {
    bg: '#A890F0',
    text: '#FFFFFF',
    border: '#785EBA',
    rgbBg: '168, 144, 240',
    gradient: 'from-indigo-400 to-purple-500 dark:from-indigo-700 dark:to-purple-800',
    shadow: 'shadow-indigo-400/50',
  },
  psychic: {
    bg: '#F85888',
    text: '#FFFFFF',
    border: '#B83E60',
    rgbBg: '248, 88, 136',
    gradient: 'from-pink-400 to-rose-500 dark:from-pink-600 dark:to-rose-800',
    shadow: 'shadow-pink-500/50',
  },
  bug: {
    bg: '#A8B820',
    text: '#FFFFFF',
    border: '#6D7815',
    rgbBg: '168, 184, 32',
    gradient: 'from-lime-400 to-lime-600 dark:from-lime-700 dark:to-lime-800',
    shadow: 'shadow-lime-500/50',
  },
  rock: {
    bg: '#B8A038',
    text: '#FFFFFF',
    border: '#786824',
    rgbBg: '184, 160, 56',
    gradient: 'from-stone-500 to-stone-700 dark:from-stone-600 dark:to-stone-800',
    shadow: 'shadow-stone-500/50',
  },
  ghost: {
    bg: '#705898',
    text: '#FFFFFF',
    border: '#483860',
    rgbBg: '112, 88, 152',
    gradient: 'from-violet-600 to-purple-800 dark:from-violet-800 dark:to-purple-950',
    shadow: 'shadow-violet-700/50',
  },
  dragon: {
    bg: '#7038F8',
    text: '#FFFFFF',
    border: '#4818B0',
    rgbBg: '112, 56, 248',
    gradient: 'from-blue-600 to-indigo-700 dark:from-blue-800 dark:to-indigo-900',
    shadow: 'shadow-indigo-600/50',
  },
  dark: {
    bg: '#705848',
    text: '#FFFFFF',
    border: '#48382E',
    rgbBg: '112, 88, 72',
    gradient: 'from-zinc-700 to-zinc-900 dark:from-zinc-800 dark:to-zinc-950',
    shadow: 'shadow-zinc-800/50',
  },
  steel: {
    bg: '#B8B8D0',
    text: '#333333',
    border: '#787890',
    rgbBg: '184, 184, 208',
    gradient: 'from-slate-400 to-slate-500 dark:from-slate-700 dark:to-slate-800',
    shadow: 'shadow-slate-400/50',
  },
  fairy: {
    bg: '#EE99AC',
    text: '#333333',
    border: '#9B5666',
    rgbBg: '238, 153, 172',
    gradient: 'from-pink-300 to-pink-400 dark:from-pink-500 dark:to-pink-600',
    shadow: 'shadow-pink-400/50',
  },
};
