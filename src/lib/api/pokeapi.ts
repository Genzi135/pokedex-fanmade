import {
  RawPokemonListResponse,
  RawPokemonDetail,
  RawPokemonSpecies,
  RawEvolutionChain,
  RawMoveDetail,
  RawTypeDetail,
  RawAbilityDetail,
} from '@/types/api';
import {
  PokemonListItem,
  PokemonDetail,
  MoveDetail,
  AbilityDetail,
} from '@/types/pokemon';
import { ENDPOINTS } from './endpoints';
import {
  transformPokemonListItem,
  transformPokemonDetail,
  transformMoveDetail,
  transformAbilityDetail,
} from './transforms';
import { GENERATIONS } from '../constants';

// Extract species ID from PokéAPI URL
export function getIdFromSpeciesUrl(url: string): number {
  const parts = url.split('/').filter(Boolean);
  return parseInt(parts[parts.length - 1], 10);
}

class ConcurrencyLimiter {
  private activeCount = 0;
  private queue: (() => void)[] = [];

  constructor(private limit: number) {}

  async run<T>(fn: () => Promise<T>): Promise<T> {
    if (this.activeCount >= this.limit) {
      await new Promise<void>((resolve) => this.queue.push(resolve));
    }
    this.activeCount++;
    try {
      return await fn();
    } finally {
      this.activeCount--;
      const next = this.queue.shift();
      if (next) {
        next();
      }
    }
  }
}

const limiter = new ConcurrencyLimiter(10);
const requestCache = new Map<string, Promise<unknown>>();

async function fetchWithCache<T>(url: string): Promise<T> {
  if (requestCache.has(url)) {
    return requestCache.get(url) as Promise<T>;
  }

  const promise = limiter.run(async () => {
    const res = await fetch(url, {
      next: { revalidate: 86400 },
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch PokeAPI endpoint: ${url} (${res.status} ${res.statusText})`);
    }

    return res.json() as Promise<T>;
  });

  requestCache.set(url, promise);
  promise.catch(() => requestCache.delete(url));
  return promise;
}

export async function getRawPokemonDetail(nameOrId: string | number): Promise<RawPokemonDetail> {
  return fetchWithCache<RawPokemonDetail>(ENDPOINTS.pokemonDetail(nameOrId));
}

export async function getPokemonList(limit: number, offset: number): Promise<PokemonListItem[]> {
  try {
    const listRes = await fetchWithCache<RawPokemonListResponse>(ENDPOINTS.pokemonList(limit, offset));
    
    const detailPromises = listRes.results.map((item) =>
      getRawPokemonDetail(item.name).catch((err) => {
        console.error(`Error loading detail for ${item.name}:`, err);
        return null;
      })
    );

    const details = await Promise.all(detailPromises);
    
    return details
      .filter((d): d is RawPokemonDetail => d !== null)
      .map(transformPokemonListItem);
  } catch (error) {
    console.error('Error fetching Pokemon list:', error);
    return [];
  }
}

// Fetch all Pokemon from type list
export async function getPokemonByType(typeName: string): Promise<{ name: string; url: string }[]> {
  try {
    const typeRes = await fetchWithCache<RawTypeDetail>(ENDPOINTS.type(typeName));
    return typeRes.pokemon.map((p) => p.pokemon);
  } catch (error) {
    console.error(`Error fetching Pokemon of type ${typeName}:`, error);
    return [];
  }
}

export interface FilterParams {
  query?: string;
  type?: string;
  generation?: string;
  sort?: string;
  page?: number;
  limit?: number;
}

// Complete Filtered/Sorted Pokemon fetcher
export async function getFilteredPokemonList({
  query = '',
  type = '',
  generation = '',
  sort = 'id-asc',
  page = 1,
  limit = 48,
}: FilterParams): Promise<{ items: PokemonListItem[]; totalCount: number }> {
  try {
    // 1. Get initial base list (up to 1025, which encompasses Gen 1-9)
    const baseListRes = await fetchWithCache<RawPokemonListResponse>(ENDPOINTS.pokemonList(1025, 0));
    let pokemonPool = baseListRes.results.map((p) => {
      const id = getIdFromSpeciesUrl(p.url);
      return { id, name: p.name, url: p.url };
    });

    // 2. Filter by Generation
    if (generation) {
      const genConfig = GENERATIONS.find((g) => g.name === generation);
      if (genConfig) {
        pokemonPool = pokemonPool.filter(
          (p) => p.id >= genConfig.startId && p.id <= genConfig.endId
        );
      }
    }

    // 3. Filter by Type
    if (type) {
      const typePokemon = await getPokemonByType(type);
      const typeNames = new Set(typePokemon.map((p) => p.name));
      pokemonPool = pokemonPool.filter((p) => typeNames.has(p.name));
    }

    // 4. Filter by Search Query (name or ID)
    if (query) {
      const cleanQuery = query.toLowerCase().trim();
      pokemonPool = pokemonPool.filter(
        (p) => p.name.includes(cleanQuery) || String(p.id) === cleanQuery
      );
    }

    const totalCount = pokemonPool.length;

    // 5. Pre-sort by ID or Name (since we know these values before fetching details)
    if (sort === 'id-asc') {
      pokemonPool.sort((a, b) => a.id - b.id);
    } else if (sort === 'id-desc') {
      pokemonPool.sort((a, b) => b.id - a.id);
    } else if (sort === 'name-asc') {
      pokemonPool.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sort === 'name-desc') {
      pokemonPool.sort((a, b) => b.name.localeCompare(a.name));
    }

    // 6. Paginate the IDs/Names
    const offset = (page - 1) * limit;
    const paginatedPool = pokemonPool.slice(offset, offset + limit);

    // 7. Fetch full details for the paginated slice
    const detailPromises = paginatedPool.map((p) =>
      getRawPokemonDetail(p.name).catch((err) => {
        console.error(`Error loading detail for ${p.name}:`, err);
        return null;
      })
    );

    const rawDetails = await Promise.all(detailPromises);
    const items = rawDetails
      .filter((d): d is RawPokemonDetail => d !== null)
      .map(transformPokemonListItem);

    // 8. Sort by Stats (HP, ATK, SPD) if selected (runs on the loaded cards)
    if (sort === 'hp-desc') {
      items.sort((a, b) => (b.stats.hp || 0) - (a.stats.hp || 0));
    } else if (sort === 'attack-desc') {
      items.sort((a, b) => (b.stats.attack || 0) - (a.stats.attack || 0));
    } else if (sort === 'speed-desc') {
      items.sort((a, b) => (b.stats.speed || 0) - (a.stats.speed || 0));
    }

    return { items, totalCount };
  } catch (error) {
    console.error('Error in getFilteredPokemonList:', error);
    return { items: [], totalCount: 0 };
  }
}

export async function getPokemonSpecies(nameOrId: string | number): Promise<RawPokemonSpecies> {
  return fetchWithCache<RawPokemonSpecies>(ENDPOINTS.pokemonSpecies(nameOrId));
}

export async function getPokemonDetail(nameOrId: string | number): Promise<PokemonDetail> {
  const [detailRes, speciesRes] = await Promise.all([
    getRawPokemonDetail(nameOrId),
    getPokemonSpecies(nameOrId),
  ]);

  return transformPokemonDetail(detailRes, speciesRes);
}

export async function getEvolutionChain(id: number): Promise<RawEvolutionChain> {
  return fetchWithCache<RawEvolutionChain>(ENDPOINTS.evolutionChain(id));
}

export async function getMoveDetail(nameOrId: string): Promise<MoveDetail> {
  const rawMove = await fetchWithCache<RawMoveDetail>(ENDPOINTS.move(nameOrId));
  return transformMoveDetail(rawMove);
}

export async function getTypeData(name: string): Promise<RawTypeDetail> {
  return fetchWithCache<RawTypeDetail>(ENDPOINTS.type(name));
}

export async function getAbilityDetail(name: string): Promise<AbilityDetail> {
  const rawAbility = await fetchWithCache<RawAbilityDetail>(ENDPOINTS.ability(name));
  return transformAbilityDetail(rawAbility);
}

export async function getMoveDetails(names: string[]): Promise<MoveDetail[]> {
  const promises = names.map((name) =>
    getMoveDetail(name).catch((err) => {
      console.error(`Error loading move ${name}:`, err);
      return null;
    })
  );

  const results = await Promise.all(promises);
  return results.filter((m): m is MoveDetail => m !== null);
}
