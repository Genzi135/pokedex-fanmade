export const POKEAPI_BASE_URL = 'https://pokeapi.co/api/v2';

export interface GenerationConfig {
  id: number;
  name: string;
  displayName: string;
  startId: number;
  endId: number;
}

export const GENERATIONS: GenerationConfig[] = [
  { id: 1, name: 'generation-i', displayName: 'Gen I (Kanto)', startId: 1, endId: 151 },
  { id: 2, name: 'generation-ii', displayName: 'Gen II (Johto)', startId: 152, endId: 251 },
  { id: 3, name: 'generation-iii', displayName: 'Gen III (Hoenn)', startId: 252, endId: 386 },
  { id: 4, name: 'generation-iv', displayName: 'Gen IV (Sinnoh)', startId: 387, endId: 493 },
  { id: 5, name: 'generation-v', displayName: 'Gen V (Unova)', startId: 494, endId: 649 },
  { id: 6, name: 'generation-vi', displayName: 'Gen VI (Kalos)', startId: 650, endId: 721 },
  { id: 7, name: 'generation-vii', displayName: 'Gen VII (Alola)', startId: 722, endId: 809 },
  { id: 8, name: 'generation-viii', displayName: 'Gen VIII (Galar)', startId: 810, endId: 898 },
  { id: 9, name: 'generation-ix', displayName: 'Gen IX (Paldea)', startId: 899, endId: 1025 },
];

export const POKEMON_TYPES = [
  'normal',
  'fire',
  'water',
  'grass',
  'electric',
  'ice',
  'fighting',
  'poison',
  'ground',
  'flying',
  'psychic',
  'bug',
  'rock',
  'ghost',
  'dragon',
  'dark',
  'steel',
  'fairy',
] as const;

export const POKEMON_HABITATS = [
  'cave',
  'forest',
  'grassland',
  'mountain',
  'rare',
  'sea',
  'rough-terrain',
  'urban',
  'waters-edge',
];

export const POKEMON_COLORS = [
  'black',
  'blue',
  'brown',
  'gray',
  'green',
  'pink',
  'purple',
  'red',
  'white',
  'yellow',
];

export const ITEMS_PER_PAGE = 48;

export const STAT_LABELS: Record<string, string> = {
  hp: 'HP',
  attack: 'Attack',
  defense: 'Defense',
  'special-attack': 'Sp. Atk',
  'special-defense': 'Sp. Def',
  speed: 'Speed',
};

export const STAT_COLORS: Record<string, string> = {
  hp: 'bg-red-500 dark:bg-red-400',
  attack: 'bg-orange-500 dark:bg-orange-400',
  defense: 'bg-yellow-500 dark:bg-yellow-400',
  'special-attack': 'bg-blue-500 dark:bg-blue-400',
  'special-defense': 'bg-green-500 dark:bg-green-400',
  speed: 'bg-pink-500 dark:bg-pink-400',
};
