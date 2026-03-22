// Human-readable item definitions for future expansion.
export const ITEMS = {
  potion: { category: "items", heal: 20 },
  superpotion: { category: "items", heal: 50 },
  antidote: { category: "items", cures: ["poison"] },
  fullheal: { category: "items", cures: ["all"] },
  pokeball: { category: "pokeballs", ballBonus: 1 },
  greatball: { category: "pokeballs", ballBonus: 1.5 },
};
