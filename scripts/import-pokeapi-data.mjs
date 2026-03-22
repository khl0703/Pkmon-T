#!/usr/bin/env node

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { MOVES, POKEDEX } from "../js/data/pokedex.js";
import { BAG_CATEGORIES, ITEMS } from "../js/data/items.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");
const dataDir = path.join(repoRoot, "data");
const apiBase = process.env.POKEAPI_BASE_URL || "https://pokeapi.co/api/v2";

const TYPE_KO = {
  normal: "노말",
  fire: "불꽃",
  water: "물",
  grass: "풀",
  electric: "전기",
  ice: "얼음",
  fighting: "격투",
  poison: "독",
  ground: "땅",
  flying: "비행",
  psychic: "에스퍼",
  bug: "벌레",
  rock: "바위",
  ghost: "고스트",
  dragon: "드래곤",
  dark: "악",
  steel: "강철",
  fairy: "페어리",
};

const DAMAGE_CLASS_KO = {
  physical: "물리",
  special: "특수",
  status: "변화",
};

const MANUAL_MOVE_IDS = {
  독가루: "poison-powder",
  집단구타: "beat-up",
  흉내쟁이: "copycat",
};

function extractIdFromUrl(url) {
  if (!url) {
    return null;
  }
  const parts = String(url).split("/").filter(Boolean);
  return parts[parts.length - 1] || null;
}

function slugifyApiName(name) {
  return String(name)
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function getLocalizedName(entries, lang) {
  const match = entries?.find((entry) => entry.language?.name === lang);
  return match?.name || null;
}

function toJson(value) {
  return `${JSON.stringify(value, null, 2)}\n`;
}

async function fetchJson(url) {
  const response = await fetch(url, {
    headers: {
      "user-agent": "pkemon-t-data-import/1.0",
      accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Fetch failed (${response.status}) for ${url}`);
  }

  return response.json();
}

async function fetchMoveData(moveId, internalKey, moveCache) {
  if (!moveCache.has(moveId)) {
    moveCache.set(moveId, fetchJson(`${apiBase}/move/${moveId}`));
  }

  const move = await moveCache.get(moveId);
  return {
    move_id: move.name,
    internal_key: internalKey,
    names: {
      ko: getLocalizedName(move.names, "ko") || internalKey,
      en: getLocalizedName(move.names, "en") || move.name,
    },
    type: move.type?.name || null,
    localized_type: TYPE_KO[move.type?.name] || null,
    damage_class: move.damage_class?.name || null,
    localized_damage_class: DAMAGE_CLASS_KO[move.damage_class?.name] || null,
    power: move.power,
    accuracy: move.accuracy,
    pp: move.pp,
    priority: move.priority,
    target: move.target?.name || null,
    effect_text: {
      en: move.effect_entries?.find((entry) => entry.language.name === "en")?.short_effect || null,
      ko: move.effect_entries?.find((entry) => entry.language.name === "ko")?.short_effect || null,
    },
    implemented_in_runtime: Boolean(MOVES[internalKey]),
  };
}

async function fetchAbilityData(abilityRef, abilityCache) {
  const abilityId = extractIdFromUrl(abilityRef.ability?.url);
  if (!abilityId) {
    return {
      id: null,
      names: { ko: null, en: abilityRef.ability?.name || null },
      is_hidden: abilityRef.is_hidden,
      slot: abilityRef.slot,
    };
  }

  if (!abilityCache.has(abilityId)) {
    abilityCache.set(abilityId, fetchJson(`${apiBase}/ability/${abilityId}`));
  }

  const ability = await abilityCache.get(abilityId);
  return {
    id: ability.name,
    names: {
      ko: getLocalizedName(ability.names, "ko"),
      en: getLocalizedName(ability.names, "en") || ability.name,
    },
    is_hidden: abilityRef.is_hidden,
    slot: abilityRef.slot,
  };
}

function normalizeEvolutionDetail(detail) {
  if (!detail) {
    return null;
  }

  return {
    trigger: detail.trigger?.name || null,
    min_level: detail.min_level,
    item: detail.item?.name || null,
    held_item: detail.held_item?.name || null,
    known_move: detail.known_move?.name || null,
    minimum_happiness: detail.min_happiness,
    time_of_day: detail.time_of_day || null,
  };
}

function normalizeEvolutionLink(chainLink) {
  return {
    species_id: Number(extractIdFromUrl(chainLink.species?.url)),
    species_slug: chainLink.species?.name || null,
    evolution_details: (chainLink.evolution_details || []).map(normalizeEvolutionDetail),
    evolves_to: (chainLink.evolves_to || []).map(normalizeEvolutionLink),
  };
}

async function buildSpeciesData(moveIdByInternalKey, moveCache, abilityCache) {
  const speciesIds = Object.keys(POKEDEX).map((id) => Number(id)).sort((a, b) => a - b);
  const speciesRecords = [];
  const growthRateIds = new Set();
  const evolutionChainIds = new Set();

  for (const id of speciesIds) {
    const runtimeSpecies = POKEDEX[id];
    const [pokemon, species] = await Promise.all([
      fetchJson(`${apiBase}/pokemon/${id}`),
      fetchJson(`${apiBase}/pokemon-species/${id}`),
    ]);

    const abilities = await Promise.all(
      pokemon.abilities
        .slice()
        .sort((a, b) => a.slot - b.slot)
        .map((abilityRef) => fetchAbilityData(abilityRef, abilityCache))
    );

    const growthRateId = species.growth_rate?.name || null;
    const evolutionChainId = Number(extractIdFromUrl(species.evolution_chain?.url));
    if (growthRateId) {
      growthRateIds.add(growthRateId);
    }
    if (evolutionChainId) {
      evolutionChainIds.add(evolutionChainId);
    }

    const types = pokemon.types
      .slice()
      .sort((a, b) => a.slot - b.slot)
      .map((entry) => entry.type.name);

    const baseStats = {
      hp: pokemon.stats.find((entry) => entry.stat.name === "hp")?.base_stat || 0,
      attack: pokemon.stats.find((entry) => entry.stat.name === "attack")?.base_stat || 0,
      defense: pokemon.stats.find((entry) => entry.stat.name === "defense")?.base_stat || 0,
      special_attack: pokemon.stats.find((entry) => entry.stat.name === "special-attack")?.base_stat || 0,
      special_defense: pokemon.stats.find((entry) => entry.stat.name === "special-defense")?.base_stat || 0,
      speed: pokemon.stats.find((entry) => entry.stat.name === "speed")?.base_stat || 0,
    };

    for (const moveRef of runtimeSpecies.moves) {
      const moveId = moveIdByInternalKey[moveRef.m];
      if (moveId) {
        await fetchMoveData(moveId, moveRef.m, moveCache);
      }
    }

    speciesRecords.push({
      id,
      slug: species.name,
      names: {
        ko: getLocalizedName(species.names, "ko") || runtimeSpecies.name.ko,
        en: getLocalizedName(species.names, "en") || runtimeSpecies.name.en,
      },
      types,
      localized_types: types.map((typeId) => TYPE_KO[typeId] || typeId),
      base_stats: baseStats,
      abilities,
      hidden_ability: abilities.find((entry) => entry.is_hidden)?.id || null,
      capture_rate: species.capture_rate,
      base_experience: pokemon.base_experience,
      growth_rate_id: growthRateId,
      evolution_chain_id: evolutionChainId || null,
      project_level_up_moves: runtimeSpecies.moves.map((moveRef) => ({
        level: moveRef.l,
        move_id: moveIdByInternalKey[moveRef.m] || null,
        internal_key: moveRef.m,
      })),
    });
  }

  return {
    speciesIds,
    growthRateIds: [...growthRateIds].sort(),
    evolutionChainIds: [...evolutionChainIds].sort((a, b) => a - b),
    speciesRecords,
  };
}

async function buildMoveData(moveIdByInternalKey, moveCache) {
  const internalKeys = new Set([
    ...Object.keys(MOVES),
    ...Object.values(POKEDEX).flatMap((species) => species.moves.map((moveRef) => moveRef.m)),
  ]);

  const moveRecords = [];
  for (const internalKey of [...internalKeys].sort((a, b) => a.localeCompare(b, "ko"))) {
    const moveId = moveIdByInternalKey[internalKey];
    if (!moveId) {
      moveRecords.push({
        move_id: null,
        internal_key: internalKey,
        names: {
          ko: internalKey,
          en: MOVES[internalKey]?.en || null,
        },
        unresolved: true,
      });
      continue;
    }

    moveRecords.push(await fetchMoveData(moveId, internalKey, moveCache));
  }

  return moveRecords;
}

async function buildItemData() {
  const itemRecords = [];

  for (const item of Object.values(ITEMS)) {
    const apiItemId = slugifyApiName(item.name.en);
    try {
      const apiItem = await fetchJson(`${apiBase}/item/${apiItemId}`);
      itemRecords.push({
        id: item.id,
        api_id: apiItem.name,
        names: {
          ko: item.name.ko,
          en: item.name.en,
        },
        official_names: {
          ko: getLocalizedName(apiItem.names, "ko") || item.name.ko,
          en: getLocalizedName(apiItem.names, "en") || item.name.en,
        },
        project_category: item.category,
        description: item.description,
        pocket: apiItem.attributes?.find((entry) => entry.name.endsWith("-pocket"))?.name || apiItem.category?.name || null,
        category: apiItem.category?.name || null,
        effect_text: {
          en: apiItem.effect_entries?.find((entry) => entry.language.name === "en")?.short_effect || null,
          ko: apiItem.effect_entries?.find((entry) => entry.language.name === "ko")?.short_effect || null,
        },
        fling: apiItem.fling_power || apiItem.fling_effect ? {
          power: apiItem.fling_power,
          effect: apiItem.fling_effect?.name || null,
        } : null,
        usable_in_field: item.usableInField,
        usable_in_battle: item.usableInBattle,
        key_item: item.keyItem,
        effect_type: item.effectType,
      });
    } catch (error) {
      itemRecords.push({
        id: item.id,
        api_id: null,
        names: {
          ko: item.name.ko,
          en: item.name.en,
        },
        official_names: {
          ko: null,
          en: null,
        },
        project_category: item.category,
        description: item.description,
        pocket: item.keyItem ? "key-items" : null,
        category: null,
        effect_text: {
          en: null,
          ko: null,
        },
        fling: null,
        usable_in_field: item.usableInField,
        usable_in_battle: item.usableInBattle,
        key_item: item.keyItem,
        effect_type: item.effectType,
        source: "project-local",
        notes: `No PokéAPI item match for "${item.name.en}".`,
      });
    }
  }

  return itemRecords.sort((a, b) => a.id.localeCompare(b.id));
}

async function buildGrowthRateData(growthRateIds) {
  const records = [];

  for (const growthRateId of growthRateIds) {
    const growthRate = await fetchJson(`${apiBase}/growth-rate/${growthRateId}`);
    records.push({
      id: growthRate.name,
      names: {
        ko: getLocalizedName(growthRate.names, "ko"),
        en: getLocalizedName(growthRate.names, "en") || growthRate.name,
      },
      formula: growthRate.formula || null,
      levels: growthRate.levels.map((entry) => ({
        level: entry.level,
        experience: entry.experience,
      })),
    });
  }

  return records.sort((a, b) => a.id.localeCompare(b.id));
}

async function buildEvolutionData(evolutionChainIds) {
  const chains = [];

  for (const chainId of evolutionChainIds) {
    const chain = await fetchJson(`${apiBase}/evolution-chain/${chainId}`);
    chains.push({
      chain_id: chain.id,
      baby_trigger_item: chain.baby_trigger_item?.name || null,
      chain: normalizeEvolutionLink(chain.chain),
    });
  }

  return chains.sort((a, b) => a.chain_id - b.chain_id);
}

function buildMoveIdMap() {
  const moveIdByInternalKey = {};

  for (const [internalKey, move] of Object.entries(MOVES)) {
    moveIdByInternalKey[internalKey] = slugifyApiName(move.en);
  }

  for (const [internalKey, moveId] of Object.entries(MANUAL_MOVE_IDS)) {
    moveIdByInternalKey[internalKey] = moveId;
  }

  return moveIdByInternalKey;
}

async function main() {
  await mkdir(dataDir, { recursive: true });

  const moveCache = new Map();
  const abilityCache = new Map();
  const moveIdByInternalKey = buildMoveIdMap();

  const { speciesIds, growthRateIds, evolutionChainIds, speciesRecords } = await buildSpeciesData(
    moveIdByInternalKey,
    moveCache,
    abilityCache
  );
  const moveRecords = await buildMoveData(moveIdByInternalKey, moveCache);
  const itemRecords = await buildItemData();
  const growthRateRecords = await buildGrowthRateData(growthRateIds);
  const evolutionRecords = await buildEvolutionData(evolutionChainIds);

  const unresolvedMoves = moveRecords.filter((move) => move.unresolved).map((move) => move.internal_key);

  const speciesPayload = {
    schema: "species.v2",
    source_model: "pokeapi-compatible",
    import_scope: {
      species_ids: speciesIds,
      source: apiBase,
      learnsets: "project runtime learnsets preserved for compatibility",
    },
    species: speciesRecords,
  };

  const movesPayload = {
    schema: "moves.v2",
    source_model: "pokeapi-compatible",
    import_scope: {
      internal_keys: moveRecords.map((move) => move.internal_key),
      source: apiBase,
    },
    moves: moveRecords.filter((move) => !move.unresolved),
    unresolved_internal_keys: unresolvedMoves,
  };

  const itemsPayload = {
    schema: "items.v2",
    source_model: "pokeapi-compatible",
    categories: BAG_CATEGORIES.map((category) => ({
      id: category.id,
      bag_key: category.bagKey,
      label_key: category.labelKey,
    })),
    items: itemRecords,
  };

  const growthRatesPayload = {
    schema: "growth-rates.v2",
    source_model: "pokeapi-compatible",
    rates: growthRateRecords,
  };

  const evolutionsPayload = {
    schema: "evolutions.v1",
    source_model: "pokeapi-compatible",
    chains: evolutionRecords,
  };

  await Promise.all([
    writeFile(path.join(dataDir, "species.json"), toJson(speciesPayload)),
    writeFile(path.join(dataDir, "moves.json"), toJson(movesPayload)),
    writeFile(path.join(dataDir, "items.json"), toJson(itemsPayload)),
    writeFile(path.join(dataDir, "growth_rates.json"), toJson(growthRatesPayload)),
    writeFile(path.join(dataDir, "evolutions.json"), toJson(evolutionsPayload)),
  ]);

  console.log(`Imported ${speciesRecords.length} species, ${moveRecords.length - unresolvedMoves.length} moves, ${itemRecords.length} items.`);
  if (unresolvedMoves.length > 0) {
    console.log(`Unresolved move keys: ${unresolvedMoves.join(", ")}`);
  }
}

main().catch((error) => {
  console.error(error.message || error);
  process.exitCode = 1;
});
