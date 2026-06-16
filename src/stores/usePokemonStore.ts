import { create } from 'zustand';
import { PokemonDetail, MoveDetail, AbilityDetail } from '@/types/pokemon';

interface PokemonStoreState {
  detailsCache: Record<string, PokemonDetail>;
  movesCache: Record<string, MoveDetail>;
  abilitiesCache: Record<string, AbilityDetail>;
  
  getPokemonDetailFromCache: (nameOrId: string | number) => PokemonDetail | undefined;
  cachePokemonDetail: (detail: PokemonDetail) => void;
  
  getMoveDetailFromCache: (name: string) => MoveDetail | undefined;
  cacheMoveDetail: (move: MoveDetail) => void;
  cacheMoveDetailsBatch: (moves: MoveDetail[]) => void;
  
  getAbilityDetailFromCache: (name: string) => AbilityDetail | undefined;
  cacheAbilityDetail: (ability: AbilityDetail) => void;
}

export const usePokemonStore = create<PokemonStoreState>((set, get) => ({
  detailsCache: {},
  movesCache: {},
  abilitiesCache: {},

  getPokemonDetailFromCache: (nameOrId) => {
    const { detailsCache } = get();
    // Try matching by id or lowercase name
    const key = String(nameOrId).toLowerCase();
    if (detailsCache[key]) return detailsCache[key];
    
    // Check if we can find it by searching values
    return Object.values(detailsCache).find(
      (p) => String(p.id) === key || p.name.toLowerCase() === key
    );
  },

  cachePokemonDetail: (detail) => {
    set((state) => ({
      detailsCache: {
        ...state.detailsCache,
        [detail.name.toLowerCase()]: detail,
        [String(detail.id)]: detail,
      },
    }));
  },

  getMoveDetailFromCache: (name) => {
    return get().movesCache[name.toLowerCase()];
  },

  cacheMoveDetail: (move) => {
    set((state) => ({
      movesCache: {
        ...state.movesCache,
        [move.name.toLowerCase()]: move,
      },
    }));
  },

  cacheMoveDetailsBatch: (moves) => {
    const newMoves: Record<string, MoveDetail> = {};
    for (const move of moves) {
      newMoves[move.name.toLowerCase()] = move;
    }
    set((state) => ({
      movesCache: {
        ...state.movesCache,
        ...newMoves,
      },
    }));
  },

  getAbilityDetailFromCache: (name) => {
    return get().abilitiesCache[name.toLowerCase()];
  },

  cacheAbilityDetail: (ability) => {
    set((state) => ({
      abilitiesCache: {
        ...state.abilitiesCache,
        [ability.name.toLowerCase()]: ability,
      },
    }));
  },
}));
