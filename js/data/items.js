// Human-readable item definitions for future expansion.
export const BAG_CATEGORIES = [
  { id: "items", labelKey: "bag.items", bagKey: "items" },
  { id: "balls", labelKey: "bag.balls", bagKey: "pokeballs" },
  { id: "battle", labelKey: "bag.battle", bagKey: "battleItems" },
  { id: "machines", labelKey: "bag.machines", bagKey: "machines" },
  { id: "keyItems", labelKey: "bag.keyItems", bagKey: "keyItems" },
];

export const ITEMS = {
  potion: {
    id: "potion",
    name: { ko: "상처약", en: "Potion" },
    category: "items",
    description: { ko: "포켓몬 1마리의 HP를 20 회복한다.", en: "Restores 20 HP to one Pokémon." },
    usableInField: true,
    usableInBattle: true,
    keyItem: false,
    effectType: "heal_20",
  },
  superpotion: {
    id: "superpotion",
    name: { ko: "좋은상처약", en: "Super Potion" },
    category: "items",
    description: { ko: "포켓몬 1마리의 HP를 50 회복한다.", en: "Restores 50 HP to one Pokémon." },
    usableInField: true,
    usableInBattle: true,
    keyItem: false,
    effectType: "heal_50",
  },
  antidote: {
    id: "antidote",
    name: { ko: "해독제", en: "Antidote" },
    category: "items",
    description: { ko: "포켓몬 1마리의 독 상태를 회복한다.", en: "Cures poison for one Pokémon." },
    usableInField: true,
    usableInBattle: true,
    keyItem: false,
    effectType: "cure_poison",
  },
  fullheal: {
    id: "fullheal",
    name: { ko: "만병통치약", en: "Full Heal" },
    category: "items",
    description: { ko: "포켓몬 1마리의 상태 이상을 전부 회복한다.", en: "Cures all status conditions on one Pokémon." },
    usableInField: true,
    usableInBattle: true,
    keyItem: false,
    effectType: "cure_all",
  },
  pokeball: {
    id: "pokeball",
    name: { ko: "포켓볼", en: "Poké Ball" },
    category: "balls",
    description: { ko: "야생 포켓몬을 잡을 때 던지는 기본 볼.", en: "A standard Ball used to catch wild Pokémon." },
    usableInField: false,
    usableInBattle: true,
    keyItem: false,
    effectType: "catch_basic",
  },
  greatball: {
    id: "greatball",
    name: { ko: "슈퍼볼", en: "Great Ball" },
    category: "balls",
    description: { ko: "포켓볼보다 잡기 쉬운 성능 좋은 볼.", en: "A higher-performance Ball with a better catch rate." },
    usableInField: false,
    usableInBattle: true,
    keyItem: false,
    effectType: "catch_great",
  },
  escapeRope: {
    id: "escapeRope",
    name: { ko: "탈출로프", en: "Escape Rope" },
    category: "items",
    description: { ko: "동굴이나 던전에서 밖으로 빠져나오는 로프.", en: "Lets you escape from caves or dungeons." },
    usableInField: true,
    usableInBattle: false,
    keyItem: false,
    effectType: "escape",
  },
  studentCard: {
    id: "studentCard",
    name: { ko: "학생증", en: "Student Card" },
    category: "keyItems",
    description: { ko: "토론토 세계에서 신분을 증명하는 중요한 도구.", en: "An important ID used around Toronto." },
    usableInField: false,
    usableInBattle: false,
    keyItem: true,
    effectType: "key_item",
  },
};

export function createEmptyBag() {
  return {
    items: [],
    pokeballs: [],
    battleItems: [],
    machines: [],
    keyItems: [],
    tms: [],
  };
}

export function normalizeBagData(rawBag) {
  const nextBag = createEmptyBag();
  const source = rawBag || {};

  nextBag.items = normalizeBagEntryArray(source.items);
  nextBag.pokeballs = normalizeBagEntryArray(source.pokeballs);
  nextBag.battleItems = normalizeBagEntryArray(source.battleItems);
  nextBag.machines = normalizeBagEntryArray(source.machines || source.tms);
  nextBag.keyItems = normalizeBagEntryArray(source.keyItems);
  nextBag.tms = [...nextBag.machines];
  return nextBag;
}

export function getCategoryItems(bag, categoryId) {
  const category = BAG_CATEGORIES.find((entry) => entry.id === categoryId);
  if (!category) {
    return [];
  }
  return bag[category.bagKey] || [];
}

export function getItemData(itemId) {
  return ITEMS[itemId] || null;
}

export function getItemName(itemId, lang) {
  const item = getItemData(itemId);
  if (!item) {
    return itemId;
  }
  return item.name[lang] || item.name.ko;
}

export function getItemDescription(itemId, lang) {
  const item = getItemData(itemId);
  if (!item) {
    return "";
  }
  return item.description[lang] || item.description.ko;
}

function normalizeBagEntryArray(entries) {
  if (!Array.isArray(entries)) {
    return [];
  }

  return entries.map((entry) => {
    if (typeof entry === "string") {
      return { id: entry, qty: 1 };
    }
    return {
      id: entry.id,
      qty: entry.qty ?? 1,
    };
  });
}
