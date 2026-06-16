import { RawEvolutionNode, RawEvolutionDetail } from '@/types/api';
import { EvolutionNode, EvolutionCondition } from '@/types/evolution';
import { PokemonType } from '@/types/pokemon';
import { getPokemonDetail, getIdFromSpeciesUrl } from '@/lib/api/pokeapi';

// Convert API trigger details to human-readable strings
export function parseEvolutionConditions(details: RawEvolutionDetail[]): EvolutionCondition[] {
  if (!details || details.length === 0) return [];

  const conditions: EvolutionCondition[] = [];

  for (const detail of details) {
    const trigger = detail.trigger.name;

    if (trigger === 'level-up') {
      if (detail.min_level !== null) {
        conditions.push({ type: 'level', label: `Lvl ${detail.min_level}` });
      }
      if (detail.min_happiness !== null) {
        conditions.push({ type: 'friendship', label: 'High Friendship' });
      }
      if (detail.min_affection !== null) {
        conditions.push({ type: 'friendship', label: 'High Affection' });
      }
      if (detail.min_beauty !== null) {
        conditions.push({ type: 'other', label: `Beauty ${detail.min_beauty}` });
      }
      if (detail.held_item) {
        const itemName = formatName(detail.held_item.name);
        conditions.push({ type: 'item', label: `Hold ${itemName}` });
      }
      if (detail.time_of_day) {
        conditions.push({ type: 'time', label: `Daytime: ${detail.time_of_day}` });
      }
      if (detail.location) {
        const locName = formatName(detail.location.name);
        conditions.push({ type: 'location', label: `At ${locName}` });
      }
      if (detail.known_move) {
        const moveName = formatName(detail.known_move.name);
        conditions.push({ type: 'move', label: `Knows ${moveName}` });
      }
      if (detail.known_move_type) {
        const typeName = formatName(detail.known_move_type.name);
        conditions.push({ type: 'move', label: `Knows ${typeName}-type move` });
      }
      if (detail.needs_overworld_rain) {
        conditions.push({ type: 'other', label: 'During Rain' });
      }
      if (detail.relative_physical_stats !== null) {
        let label = 'Stats Bal.';
        if (detail.relative_physical_stats === 1) label = 'Atk > Def';
        if (detail.relative_physical_stats === 0) label = 'Atk = Def';
        if (detail.relative_physical_stats === -1) label = 'Atk < Def';
        conditions.push({ type: 'other', label });
      }
      
      // Fallback for default level-up without other parameters
      if (
        detail.min_level === null &&
        detail.min_happiness === null &&
        detail.min_affection === null &&
        detail.min_beauty === null &&
        !detail.held_item &&
        !detail.time_of_day &&
        !detail.location &&
        !detail.known_move &&
        !detail.known_move_type &&
        !detail.needs_overworld_rain &&
        detail.relative_physical_stats === null
      ) {
        conditions.push({ type: 'level', label: 'Level Up' });
      }
    } else if (trigger === 'use-item') {
      if (detail.item) {
        const itemName = formatName(detail.item.name);
        conditions.push({ type: 'item', label: `Use ${itemName}` });
      }
    } else if (trigger === 'trade') {
      if (detail.held_item) {
        const itemName = formatName(detail.held_item.name);
        conditions.push({ type: 'trade', label: `Trade holding ${itemName}` });
      } else if (detail.trade_species) {
        const speciesName = formatName(detail.trade_species.name);
        conditions.push({ type: 'trade', label: `Trade for ${speciesName}` });
      } else {
        conditions.push({ type: 'trade', label: 'Trade' });
      }
    } else if (trigger === 'shed') {
      conditions.push({ type: 'other', label: 'Shed (Empty slot & Pokéball)' });
    } else {
      conditions.push({ type: 'other', label: formatName(trigger) });
    }
  }

  return conditions;
}

// Helper to capitalizes and clean up name strings (e.g. fire-stone -> Fire Stone)
function formatName(name: string): string {
  return name
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// Parse evolution chain recursively and load additional sprites/types
export async function parseEvolutionChain(
  rawNode: RawEvolutionNode
): Promise<EvolutionNode> {
  const speciesId = getIdFromSpeciesUrl(rawNode.species.url);
  const name = rawNode.species.name;
  
  let types: PokemonType[] = ['normal'];
  let sprite = '';

  try {
    // Fetch basic details (sprites and types) for the node
    const details = await getPokemonDetail(name);
    types = details.types;
    sprite = details.sprite;
  } catch (error) {
    console.error(`Failed to fetch details for evolution node ${name}:`, error);
    // Fallback sprite url
    sprite = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${speciesId}.png`;
  }

  const conditions = parseEvolutionConditions(rawNode.evolution_details);

  const evolvesToPromises = rawNode.evolves_to.map((child) =>
    parseEvolutionChain(child)
  );
  const evolvesTo = await Promise.all(evolvesToPromises);

  return {
    id: speciesId,
    name,
    types,
    sprite,
    conditions,
    evolvesTo,
  };
}
