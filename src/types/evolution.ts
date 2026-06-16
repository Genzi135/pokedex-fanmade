import { PokemonType } from './pokemon';

export interface EvolutionCondition {
  type: 'level' | 'item' | 'friendship' | 'trade' | 'time' | 'move' | 'location' | 'other';
  label: string; // e.g. "Level 16", "Use Fire Stone", "High Friendship"
}

export interface EvolutionNode {
  id: number;
  name: string;
  types: PokemonType[];
  sprite: string;
  conditions: EvolutionCondition[];
  evolvesTo: EvolutionNode[];
}
