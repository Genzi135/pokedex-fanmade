// Raw API response types from PokéAPI

export interface RawPokemonListItem {
  name: string;
  url: string;
}

export interface RawPokemonListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: RawPokemonListItem[];
}

export interface RawPokemonDetail {
  id: number;
  name: string;
  base_experience: number;
  height: number;
  weight: number;
  abilities: Array<{
    is_hidden: boolean;
    slot: number;
    ability: { name: string; url: string };
  }>;
  types: Array<{
    slot: number;
    type: { name: string; url: string };
  }>;
  stats: Array<{
    base_stat: number;
    effort: number;
    stat: { name: string; url: string };
  }>;
  moves: Array<{
    move: { name: string; url: string };
    version_group_details: Array<{
      level_learned_at: number;
      move_learn_method: { name: string; url: string };
      version_group: { name: string; url: string };
    }>;
  }>;
  sprites: {
    front_default: string;
    other?: {
      'official-artwork'?: {
        front_default: string;
      };
      showdown?: {
        front_default: string;
      };
    };
  };
  cries?: {
    latest?: string;
    legacy?: string;
  };
  species: {
    name: string;
    url: string;
  };
}

export interface RawPokemonSpecies {
  id: number;
  name: string;
  flavor_text_entries: Array<{
    flavor_text: string;
    language: { name: string };
    version: { name: string };
  }>;
  generation: { name: string; url: string };
  habitat: { name: string; url: string } | null;
  color: { name: string; url: string };
  shape: { name: string; url: string };
  evolution_chain: { url: string };
  capture_rate: number;
}

export interface RawEvolutionDetail {
  item: { name: string; url: string } | null;
  trigger: { name: string; url: string };
  gender: number | null;
  held_item: { name: string; url: string } | null;
  known_move: { name: string; url: string } | null;
  known_move_type: { name: string; url: string } | null;
  location: { name: string; url: string } | null;
  min_level: number | null;
  min_happiness: number | null;
  min_beauty: number | null;
  min_affection: number | null;
  needs_overworld_rain: boolean;
  party_species: { name: string; url: string } | null;
  party_type: { name: string; url: string } | null;
  relative_physical_stats: number | null;
  time_of_day: string;
  trade_species: { name: string; url: string } | null;
  turn_upside_down: boolean;
}

export interface RawEvolutionNode {
  is_baby: boolean;
  species: { name: string; url: string };
  evolution_details: RawEvolutionDetail[];
  evolves_to: RawEvolutionNode[];
}

export interface RawEvolutionChain {
  id: number;
  chain: RawEvolutionNode;
}

export interface RawMoveDetail {
  id: number;
  name: string;
  accuracy: number | null;
  power: number | null;
  pp: number;
  priority: number;
  type: { name: string; url: string };
  damage_class: { name: string; url: string };
  flavor_text_entries: Array<{
    flavor_text: string;
    language: { name: string };
  }>;
}

export interface RawTypeDetail {
  id: number;
  name: string;
  damage_relations: {
    no_damage_to: Array<{ name: string; url: string }>;
    half_damage_to: Array<{ name: string; url: string }>;
    double_damage_to: Array<{ name: string; url: string }>;
    no_damage_from: Array<{ name: string; url: string }>;
    half_damage_from: Array<{ name: string; url: string }>;
    double_damage_from: Array<{ name: string; url: string }>;
  };
  pokemon: Array<{
    slot: number;
    pokemon: { name: string; url: string };
  }>;
}

export interface RawAbilityDetail {
  id: number;
  name: string;
  flavor_text_entries: Array<{
    flavor_text: string;
    language: { name: string };
  }>;
}
