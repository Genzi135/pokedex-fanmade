import { POKEAPI_BASE_URL } from '../constants';

export const ENDPOINTS = {
  pokemonList: (limit: number, offset: number) =>
    `${POKEAPI_BASE_URL}/pokemon?limit=${limit}&offset=${offset}`,
  pokemonDetail: (nameOrId: string | number) =>
    `${POKEAPI_BASE_URL}/pokemon/${nameOrId}`,
  pokemonSpecies: (nameOrId: string | number) =>
    `${POKEAPI_BASE_URL}/pokemon-species/${nameOrId}`,
  evolutionChain: (id: number) =>
    `${POKEAPI_BASE_URL}/evolution-chain/${id}`,
  move: (nameOrId: string | number) =>
    `${POKEAPI_BASE_URL}/move/${nameOrId}`,
  type: (nameOrId: string | number) =>
    `${POKEAPI_BASE_URL}/type/${nameOrId}`,
  ability: (nameOrId: string | number) =>
    `${POKEAPI_BASE_URL}/ability/${nameOrId}`,
};
