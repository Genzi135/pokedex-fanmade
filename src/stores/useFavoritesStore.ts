import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface FavoritesStoreState {
  favorites: number[];
  toggle: (id: number) => void;
  isFavorite: (id: number) => boolean;
  hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;
  skipAnimation: boolean;
  toggleSkipAnimation: () => void;
}

export const useFavoritesStore = create<FavoritesStoreState>()(
  persist(
    (set, get) => ({
      favorites: [],
      hasHydrated: false,
      skipAnimation: false,
      
      toggle: (id: number) => {
        const { favorites } = get();
        const isFav = favorites.includes(id);
        const newFavs = isFav
          ? favorites.filter((favId) => favId !== id)
          : [...favorites, id];
        set({ favorites: newFavs });
      },
      
      isFavorite: (id: number) => {
        return get().favorites.includes(id);
      },

      setHasHydrated: (state: boolean) => {
        set({ hasHydrated: state });
      },

      toggleSkipAnimation: () => {
        set((state) => ({ skipAnimation: !state.skipAnimation }));
      },
    }),
    {
      name: 'fandex-favorites',
      skipHydration: true, // Crucial to prevent Next.js hydration mismatch
    }
  )
);
