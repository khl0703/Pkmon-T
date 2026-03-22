import { fieldState, PD } from "../core/state.js";
import { loadSaveFromStorage, saveGameToStorage } from "../core/storage.js";
import { createEmptyBag, normalizeBagData } from "../data/items.js";
import { createPokemon, MOVES } from "../data/pokedex.js";

export function saveGame() {
  const data = {
    player: {
      name: PD.name,
      gender: PD.gender,
      money: PD.money,
      badges: PD.badges,
      playTime: PD.playTime,
    },
    party: PD.party,
    pc: PD.pc,
    bag: PD.bag,
    pokedex: PD.pokedex,
    flags: PD.flags,
    currentMap: fieldState.map,
    playerPos: { x: fieldState.px, y: fieldState.py, dir: fieldState.dir },
  };

  saveGameToStorage(data);
}

export function loadGame() {
  const data = loadSaveFromStorage();
  if (!data) {
    return false;
  }

  PD.name = data.player?.name || PD.name;
  PD.gender = data.player?.gender || PD.gender;
  PD.money = data.player?.money ?? PD.money;
  PD.badges = data.player?.badges || [];
  PD.playTime = data.player?.playTime || 0;
  PD.party = normalizePokemonList(data.party || []);
  PD.pc = normalizePokemonList(data.pc || []);
  PD.bag = normalizeBagData(data.bag || createEmptyBag());
  PD.pokedex = data.pokedex || { seen: [], caught: [] };
  PD.flags = data.flags || {};

  fieldState.map = data.currentMap || fieldState.map;
  fieldState.px = data.playerPos?.x ?? fieldState.px;
  fieldState.py = data.playerPos?.y ?? fieldState.py;
  fieldState.dir = data.playerPos?.dir || fieldState.dir;
  fieldState.moving = false;
  fieldState.moveT = 0;
  return true;
}

function normalizePokemonList(list) {
  if (!Array.isArray(list)) {
    return [];
  }

  return list.map((pokemon) => normalizeSavedPokemon(pokemon)).filter(Boolean);
}

function normalizeSavedPokemon(rawPokemon) {
  if (!rawPokemon || typeof rawPokemon.id !== "number") {
    return null;
  }

  const level = rawPokemon.level || 1;
  const template = createPokemon(rawPokemon.id, level);
  if (!template) {
    return rawPokemon;
  }

  return {
    ...template,
    ...rawPokemon,
    level,
    exp: rawPokemon.exp ?? template.exp,
    expNext: rawPokemon.expNext ?? template.expNext,
    name: rawPokemon.name || template.name,
    types: Array.isArray(rawPokemon.types) && rawPokemon.types.length > 0 ? rawPokemon.types : template.types,
    stats: rawPokemon.stats || template.stats,
    curHP: typeof rawPokemon.curHP === "number" ? rawPokemon.curHP : (rawPokemon.stats?.hp ?? template.curHP),
    moves: normalizeMoveList(rawPokemon.moves, template.moves),
    iv: rawPokemon.iv || template.iv,
    status: rawPokemon.status ?? template.status,
    nickname: rawPokemon.nickname ?? template.nickname,
  };
}

function normalizeMoveList(savedMoves, fallbackMoves) {
  if (!Array.isArray(savedMoves) || savedMoves.length === 0) {
    return fallbackMoves;
  }

  return savedMoves.map((move) => {
    const maxPP = move?.maxPP ?? MOVES[move?.name]?.pp ?? 10;
    return {
      name: move?.name,
      pp: move?.pp ?? maxPP,
      maxPP,
    };
  });
}
