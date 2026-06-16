import { PokemonType, TypeEffectiveness } from '@/types/pokemon';
import { POKEMON_TYPES } from '../constants';
import { getTypeData } from '@/lib/api/pokeapi';

export async function calculateTypeEffectiveness(types: PokemonType[]): Promise<TypeEffectiveness> {
  const effectiveness: Record<PokemonType, number> = {} as Record<PokemonType, number>;

  // Initialize all types with multiplier 1.0
  for (const type of POKEMON_TYPES) {
    effectiveness[type] = 1.0;
  }

  try {
    // Fetch damage relations for all the Pokemon's types in parallel
    const typeDataPromises = types.map((type) => getTypeData(type));
    const typeDetails = await Promise.all(typeDataPromises);

    for (const detail of typeDetails) {
      const relations = detail.damage_relations;

      // No damage from (multiplier 0x)
      for (const t of relations.no_damage_from) {
        const name = t.name as PokemonType;
        if (effectiveness[name] !== undefined) {
          effectiveness[name] *= 0;
        }
      }

      // Half damage from (multiplier 0.5x)
      for (const t of relations.half_damage_from) {
        const name = t.name as PokemonType;
        if (effectiveness[name] !== undefined) {
          effectiveness[name] *= 0.5;
        }
      }

      // Double damage from (multiplier 2x)
      for (const t of relations.double_damage_from) {
        const name = t.name as PokemonType;
        if (effectiveness[name] !== undefined) {
          effectiveness[name] *= 2;
        }
      }
    }
  } catch (error) {
    console.error('Error calculating type effectiveness:', error);
    // Return empty results on error rather than crashing
    return { weakTo: [], resistantTo: [], immuneTo: [] };
  }

  const weakTo: Array<{ type: PokemonType; multiplier: number }> = [];
  const resistantTo: Array<{ type: PokemonType; multiplier: number }> = [];
  const immuneTo: PokemonType[] = [];

  for (const type of POKEMON_TYPES) {
    const mult = effectiveness[type];
    if (mult > 1) {
      weakTo.push({ type, multiplier: mult });
    } else if (mult > 0 && mult < 1) {
      resistantTo.push({ type, multiplier: mult });
    } else if (mult === 0) {
      immuneTo.push(type);
    }
  }

  // Sort weakTo and resistantTo by multiplier descending/ascending respectively
  weakTo.sort((a, b) => b.multiplier - a.multiplier);
  resistantTo.sort((a, b) => a.multiplier - b.multiplier);

  return { weakTo, resistantTo, immuneTo };
}
