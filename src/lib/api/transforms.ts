import {
  RawPokemonDetail,
  RawPokemonSpecies,
  RawMoveDetail,
  RawAbilityDetail,
} from '@/types/api';
import {
  PokemonListItem,
  PokemonDetail,
  MoveDetail,
  AbilityDetail,
  PokemonType,
  Stats,
} from '@/types/pokemon';
import { getIdFromSpeciesUrl } from './pokeapi';

export function transformPokemonListItem(raw: RawPokemonDetail): PokemonListItem {
  const hp = raw.stats.find((s) => s.stat.name === 'hp')?.base_stat || 0;
  const attack = raw.stats.find((s) => s.stat.name === 'attack')?.base_stat || 0;
  const speed = raw.stats.find((s) => s.stat.name === 'speed')?.base_stat || 0;

  return {
    id: raw.id,
    name: raw.name,
    types: raw.types.map((t) => t.type.name as PokemonType),
    sprite: raw.sprites.other?.['official-artwork']?.front_default || raw.sprites.front_default || '',
    stats: { hp, attack, speed },
  };
}

export function transformPokemonDetail(
  rawDetail: RawPokemonDetail,
  rawSpecies: RawPokemonSpecies
): PokemonDetail {
  const hp = rawDetail.stats.find((s) => s.stat.name === 'hp')?.base_stat || 0;
  const attack = rawDetail.stats.find((s) => s.stat.name === 'attack')?.base_stat || 0;
  const defense = rawDetail.stats.find((s) => s.stat.name === 'defense')?.base_stat || 0;
  const specialAttack = rawDetail.stats.find((s) => s.stat.name === 'special-attack')?.base_stat || 0;
  const specialDefense = rawDetail.stats.find((s) => s.stat.name === 'special-defense')?.base_stat || 0;
  const speed = rawDetail.stats.find((s) => s.stat.name === 'speed')?.base_stat || 0;

  const stats: Stats = {
    hp,
    attack,
    defense,
    'special-attack': specialAttack,
    'special-defense': specialDefense,
    speed,
  };

  const abilities = rawDetail.abilities.map((a) => ({
    name: a.ability.name,
    isHidden: a.is_hidden,
    slot: a.slot,
  }));

  const moves = rawDetail.moves.map((m) => {
    // Find representative version group detail
    const detail = m.version_group_details[0];
    const rawMethod = detail?.move_learn_method.name || 'level-up';
    
    // Map API learn method to application learn method
    let learnMethod: 'level-up' | 'machine' | 'egg' | 'tutor' = 'level-up';
    if (rawMethod === 'machine') learnMethod = 'machine';
    else if (rawMethod === 'egg') learnMethod = 'egg';
    else if (rawMethod === 'tutor') learnMethod = 'tutor';

    return {
      name: m.move.name,
      levelLearned: detail?.level_learned_at || 0,
      learnMethod,
    };
  });

  const englishEntry = rawSpecies.flavor_text_entries.find(
    (entry) => entry.language.name === 'en'
  );
  const description = englishEntry
    ? englishEntry.flavor_text.replace(/\f/g, ' ').replace(/\n/g, ' ')
    : 'No description available.';

  // Map generation name to readable string (e.g. generation-i -> Generation I)
  const genNameRaw = rawSpecies.generation.name;
  const generation = genNameRaw
    .replace('generation-', 'Generation ')
    .toUpperCase();

  const cry = rawDetail.cries?.latest || rawDetail.cries?.legacy || null;

  return {
    id: rawDetail.id,
    name: rawDetail.name,
    baseExperience: rawDetail.base_experience,
    height: rawDetail.height / 10, // dm -> meters
    weight: rawDetail.weight / 10, // hg -> kg
    types: rawDetail.types.map((t) => t.type.name as PokemonType),
    abilities,
    stats,
    moves,
    sprite: rawDetail.sprites.front_default || '',
    artwork: rawDetail.sprites.other?.['official-artwork']?.front_default || rawDetail.sprites.front_default || '',
    gif: rawDetail.sprites.other?.showdown?.front_default || null,
    cry,
    description,
    generation,
    habitat: rawSpecies.habitat?.name || null,
    color: rawSpecies.color.name,
    shape: rawSpecies.shape.name,
    captureRate: rawSpecies.capture_rate,
    speciesName: rawSpecies.name,
    evolutionChainId: getIdFromSpeciesUrl(rawSpecies.evolution_chain.url),
  };
}

export function transformMoveDetail(raw: RawMoveDetail): MoveDetail {
  const englishEntry = raw.flavor_text_entries.find(
    (entry) => entry.language.name === 'en'
  );
  const description = englishEntry
    ? englishEntry.flavor_text.replace(/\f/g, ' ').replace(/\n/g, ' ')
    : 'No description available.';

  const rawCat = raw.damage_class.name;
  const category: 'physical' | 'special' | 'status' =
    rawCat === 'physical' || rawCat === 'special' ? rawCat : 'status';

  return {
    name: raw.name,
    type: raw.type.name as PokemonType,
    category,
    power: raw.power,
    accuracy: raw.accuracy,
    pp: raw.pp,
    priority: raw.priority,
    learnMethod: 'level-up', // Default, will be overridden or populated contextually
    description,
  };
}

export function transformAbilityDetail(raw: RawAbilityDetail): AbilityDetail {
  const englishEntry = raw.flavor_text_entries.find(
    (entry) => entry.language.name === 'en'
  );
  const description = englishEntry
    ? englishEntry.flavor_text.replace(/\f/g, ' ').replace(/\n/g, ' ')
    : 'No description available.';

  return {
    name: raw.name,
    description,
  };
}
