export type PokemonType =
  | 'normal'
  | 'fire'
  | 'water'
  | 'grass'
  | 'electric'
  | 'ice'
  | 'fighting'
  | 'poison'
  | 'ground'
  | 'flying'
  | 'psychic'
  | 'bug'
  | 'rock'
  | 'ghost'
  | 'dragon'
  | 'dark'
  | 'steel'
  | 'fairy';

export type StatKey = 'hp' | 'attack' | 'defense' | 'special-attack' | 'special-defense' | 'speed';

export type Stats = Record<StatKey, number>;

export interface PokemonListItem {
  id: number;
  name: string;
  types: PokemonType[];
  sprite: string;
  stats: Partial<Stats>; // Contains HP, ATK, SPD for card preview/sorting
}

export interface PokemonAbility {
  name: string;
  isHidden: boolean;
  slot: number;
  description?: string;
}

export interface PokemonMove {
  name: string;
  levelLearned: number;
  learnMethod: 'level-up' | 'machine' | 'egg' | 'tutor';
}

export interface PokemonDetail {
  id: number;
  name: string;
  baseExperience: number;
  height: number;
  weight: number;
  types: PokemonType[];
  abilities: PokemonAbility[];
  stats: Stats;
  moves: PokemonMove[];
  sprite: string;
  artwork: string;
  gif: string | null;
  cry: string | null;
  description: string;
  generation: string;
  habitat: string | null;
  color: string;
  shape: string;
  captureRate: number;
  speciesName: string;
  evolutionChainId: number;
}

export interface MoveDetail {
  name: string;
  type: PokemonType;
  category: 'physical' | 'special' | 'status';
  power: number | null;
  accuracy: number | null;
  pp: number;
  priority: number;
  learnMethod: 'level-up' | 'machine' | 'egg' | 'tutor';
  levelLearned?: number;
  description: string;
}

export interface TypeEffectiveness {
  weakTo: Array<{ type: PokemonType; multiplier: number }>; // e.g., 2x, 4x
  resistantTo: Array<{ type: PokemonType; multiplier: number }>; // e.g., 0.5x, 0.25x
  immuneTo: PokemonType[]; // e.g., 0x
}

export interface AbilityDetail {
  name: string;
  description: string;
}
