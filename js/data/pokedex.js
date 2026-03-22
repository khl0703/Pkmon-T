import { TC } from "../core/constants.js";
import { GS } from "../core/state.js";

export const MOVES = {
  몸통박치기: { en: "Tackle", type: "노말", cat: "물리", pow: 40, acc: 100, pp: 35 },
  꼬리흔들기: { en: "Tail Whip", type: "노말", cat: "변화", pow: 0, acc: 100, pp: 30, effect: "def-1" },
  할퀴기: { en: "Scratch", type: "노말", cat: "물리", pow: 40, acc: 100, pp: 35 },
  울음소리: { en: "Growl", type: "노말", cat: "변화", pow: 0, acc: 100, pp: 40, effect: "atk-1" },
  불꽃세례: { en: "Ember", type: "불꽃", cat: "특수", pow: 40, acc: 100, pp: 25 },
  물대포: { en: "Water Gun", type: "물", cat: "특수", pow: 40, acc: 100, pp: 25 },
  덩굴채찍: { en: "Vine Whip", type: "풀", cat: "물리", pow: 45, acc: 100, pp: 25 },
  전광석화: { en: "Quick Attack", type: "노말", cat: "물리", pow: 40, acc: 100, pp: 30, priority: 1 },
  물기: { en: "Bite", type: "악", cat: "물리", pow: 60, acc: 100, pp: 25 },
  불꽃엄니: { en: "Fire Fang", type: "불꽃", cat: "물리", pow: 65, acc: 95, pp: 15 },
  물의파동: { en: "Water Pulse", type: "물", cat: "특수", pow: 60, acc: 100, pp: 20 },
  씨뿌리기: { en: "Leech Seed", type: "풀", cat: "변화", pow: 0, acc: 90, pp: 10 },
  잎날가르기: { en: "Razor Leaf", type: "풀", cat: "물리", pow: 55, acc: 95, pp: 25 },
  화염방사: { en: "Flamethrower", type: "불꽃", cat: "특수", pow: 90, acc: 100, pp: 15 },
  파도타기: { en: "Surf", type: "물", cat: "특수", pow: 90, acc: 100, pp: 15 },
  솔라빔: { en: "Solar Beam", type: "풀", cat: "특수", pow: 120, acc: 100, pp: 10 },
  사이코키네시스: { en: "Psychic", type: "에스퍼", cat: "특수", pow: 90, acc: 100, pp: 10 },
  염동력: { en: "Confusion", type: "에스퍼", cat: "특수", pow: 50, acc: 100, pp: 25 },
  순간이동: { en: "Teleport", type: "에스퍼", cat: "변화", pow: 0, acc: 100, pp: 20, effect: "flee" },
  전기충격: { en: "Thunder Shock", type: "전기", cat: "특수", pow: 40, acc: 100, pp: 30 },
  스파크: { en: "Spark", type: "전기", cat: "물리", pow: 65, acc: 100, pp: 20 },
  실뿜기: { en: "String Shot", type: "벌레", cat: "변화", pow: 0, acc: 95, pp: 40, effect: "spe-1" },
  벌레먹기: { en: "Bug Bite", type: "벌레", cat: "물리", pow: 60, acc: 100, pp: 20 },
  쪼기: { en: "Peck", type: "비행", cat: "물리", pow: 35, acc: 100, pp: 35 },
  모래뿌리기: { en: "Sand Attack", type: "땅", cat: "변화", pow: 0, acc: 100, pp: 15, effect: "acc-1" },
  박치기: { en: "Headbutt", type: "노말", cat: "물리", pow: 70, acc: 100, pp: 15 },
  돌진: { en: "Take Down", type: "노말", cat: "물리", pow: 90, acc: 85, pp: 20 },
  거품: { en: "Bubble", type: "물", cat: "특수", pow: 40, acc: 100, pp: 30 },
  껍질에숨기: { en: "Withdraw", type: "물", cat: "변화", pow: 0, acc: 100, pp: 40, effect: "def+1" },
  성장: { en: "Growth", type: "노말", cat: "변화", pow: 0, acc: 100, pp: 20, effect: "spa+1" },
  연막: { en: "Smokescreen", type: "노말", cat: "변화", pow: 0, acc: 100, pp: 20, effect: "acc-1" },
  기충전: { en: "Focus Energy", type: "노말", cat: "변화", pow: 0, acc: 100, pp: 30 },
  최면술: { en: "Hypnosis", type: "에스퍼", cat: "변화", pow: 0, acc: 60, pp: 20 },
  명상: { en: "Calm Mind", type: "에스퍼", cat: "변화", pow: 0, acc: 100, pp: 20 },
  전기자석파: { en: "Thunder Wave", type: "전기", cat: "변화", pow: 0, acc: 90, pp: 20 },
  차밍보이스: { en: "Disarming Voice", type: "페어리", cat: "특수", pow: 40, acc: 100, pp: 15 },
  그림자분신: { en: "Double Team", type: "노말", cat: "변화", pow: 0, acc: 100, pp: 15 },
  날개치기: { en: "Wing Attack", type: "비행", cat: "물리", pow: 60, acc: 100, pp: 35 },
  째려보기: { en: "Leer", type: "노말", cat: "변화", pow: 0, acc: 100, pp: 30, effect: "def-1" },
  충전: { en: "Charge", type: "전기", cat: "변화", pow: 0, acc: 100, pp: 20 },
  분발: { en: "Work Up", type: "노말", cat: "변화", pow: 0, acc: 100, pp: 30 },
  바람일으키기: { en: "Gust", type: "비행", cat: "특수", pow: 40, acc: 100, pp: 35 },
  속이다: { en: "Fake Out", type: "노말", cat: "물리", pow: 40, acc: 100, pp: 10, priority: 3 },
  손톱갈기: { en: "Hone Claws", type: "악", cat: "변화", pow: 0, acc: 100, pp: 15 },
  웅크리기: { en: "Defense Curl", type: "노말", cat: "변화", pow: 0, acc: 100, pp: 40, effect: "def+1" },
  에코보이스: { en: "Echoed Voice", type: "노말", cat: "특수", pow: 40, acc: 100, pp: 15 },
  독가루: { en: "PoisonPowder", type: "독", cat: "변화", pow: 0, acc: 75, pp: 35 },
  수면가루: { en: "Sleep Powder", type: "풀", cat: "변화", pow: 0, acc: 75, pp: 15 },
  달콤한향기: { en: "Sweet Scent", type: "노말", cat: "변화", pow: 0, acc: 100, pp: 20 },
  광합성: { en: "Synthesis", type: "풀", cat: "변화", pow: 0, acc: 100, pp: 5 },
  분노: { en: "Rage", type: "노말", cat: "물리", pow: 20, acc: 100, pp: 20 },
  무서운얼굴: { en: "Scary Face", type: "노말", cat: "변화", pow: 0, acc: 90, pp: 10, effect: "spe-2" },
  용의분노: { en: "Dragon Rage", type: "드래곤", cat: "특수", pow: 40, acc: 100, pp: 10 },
  회오리불꽃: { en: "Fire Spin", type: "불꽃", cat: "특수", pow: 35, acc: 85, pp: 15 },
  베어가르기: { en: "Slash", type: "노말", cat: "물리", pow: 70, acc: 100, pp: 20 },
  고속스핀: { en: "Rapid Spin", type: "노말", cat: "물리", pow: 50, acc: 100, pp: 40 },
  방어: { en: "Protect", type: "노말", cat: "변화", pow: 0, acc: 100, pp: 10 },
  비바라기: { en: "Rain Dance", type: "물", cat: "변화", pow: 0, acc: 100, pp: 5 },
  로케트박치기: { en: "Skull Bash", type: "노말", cat: "물리", pow: 130, acc: 100, pp: 10 },
  하이드로펌프: { en: "Hydro Pump", type: "물", cat: "특수", pow: 110, acc: 80, pp: 5 },
};

export const POKEDEX = {
  1: { name: { ko: "이상해씨", en: "Bulbasaur" }, types: ["풀", "독"], bs: { hp: 45, atk: 49, def: 49, spa: 65, spd: 65, spe: 45 }, cr: 45, bexp: 64, moves: [{ l: 1, m: "몸통박치기" }, { l: 4, m: "울음소리" }, { l: 7, m: "씨뿌리기" }, { l: 10, m: "덩굴채찍" }, { l: 15, m: "독가루" }, { l: 15, m: "수면가루" }, { l: 20, m: "잎날가르기" }, { l: 25, m: "달콤한향기" }, { l: 32, m: "성장" }, { l: 39, m: "광합성" }, { l: 46, m: "솔라빔" }] },
  4: { name: { ko: "파이리", en: "Charmander" }, types: ["불꽃"], bs: { hp: 39, atk: 52, def: 43, spa: 60, spd: 50, spe: 65 }, cr: 45, bexp: 62, moves: [{ l: 1, m: "할퀴기" }, { l: 1, m: "울음소리" }, { l: 7, m: "불꽃세례" }, { l: 13, m: "연막" }, { l: 19, m: "분노" }, { l: 25, m: "무서운얼굴" }, { l: 31, m: "화염방사" }, { l: 37, m: "베어가르기" }, { l: 43, m: "용의분노" }, { l: 49, m: "회오리불꽃" }] },
  7: { name: { ko: "꼬부기", en: "Squirtle" }, types: ["물"], bs: { hp: 44, atk: 48, def: 65, spa: 50, spd: 64, spe: 43 }, cr: 45, bexp: 63, moves: [{ l: 1, m: "몸통박치기" }, { l: 4, m: "꼬리흔들기" }, { l: 7, m: "거품" }, { l: 10, m: "껍질에숨기" }, { l: 13, m: "물대포" }, { l: 18, m: "물기" }, { l: 23, m: "고속스핀" }, { l: 28, m: "방어" }, { l: 33, m: "비바라기" }, { l: 40, m: "로케트박치기" }, { l: 47, m: "하이드로펌프" }] },
  10: { name: { ko: "캐터피", en: "Caterpie" }, types: ["벌레"], bs: { hp: 45, atk: 30, def: 35, spa: 20, spd: 20, spe: 45 }, cr: 255, bexp: 39, moves: [{ l: 1, m: "실뿜기" }, { l: 1, m: "몸통박치기" }, { l: 9, m: "벌레먹기" }] },
  19: { name: { ko: "꼬렛", en: "Rattata" }, types: ["노말"], bs: { hp: 30, atk: 56, def: 35, spa: 25, spd: 35, spe: 72 }, cr: 255, bexp: 51, moves: [{ l: 1, m: "몸통박치기" }, { l: 3, m: "꼬리흔들기" }, { l: 6, m: "전광석화" }, { l: 9, m: "기충전" }] },
  63: { name: { ko: "캐이시", en: "Abra" }, types: ["에스퍼"], bs: { hp: 25, atk: 20, def: 15, spa: 105, spd: 55, spe: 90 }, cr: 200, bexp: 62, moves: [{ l: 1, m: "순간이동" }] },
  65: { name: { ko: "후딘", en: "Alakazam" }, types: ["에스퍼"], bs: { hp: 55, atk: 50, def: 45, spa: 135, spd: 95, spe: 120 }, cr: 50, bexp: 225, moves: [{ l: 1, m: "순간이동" }, { l: 6, m: "염동력" }, { l: 6, m: "최면술" }, { l: 11, m: "명상" }] },
  179: { name: { ko: "메리프", en: "Mareep" }, types: ["전기"], bs: { hp: 55, atk: 40, def: 40, spa: 65, spd: 45, spe: 35 }, cr: 235, bexp: 56, moves: [{ l: 1, m: "울음소리" }, { l: 1, m: "몸통박치기" }, { l: 4, m: "전기자석파" }, { l: 8, m: "전기충격" }] },
  263: { name: { ko: "지그제구리", en: "Zigzagoon" }, types: ["노말"], bs: { hp: 38, atk: 30, def: 41, spa: 30, spd: 41, spe: 60 }, cr: 255, bexp: 56, moves: [{ l: 1, m: "울음소리" }, { l: 1, m: "몸통박치기" }, { l: 3, m: "모래뿌리기" }, { l: 6, m: "꼬리흔들기" }] },
  280: { name: { ko: "랄토스", en: "Ralts" }, types: ["에스퍼", "페어리"], bs: { hp: 28, atk: 25, def: 25, spa: 45, spd: 35, spe: 40 }, cr: 235, bexp: 40, moves: [{ l: 1, m: "차밍보이스" }, { l: 1, m: "울음소리" }, { l: 3, m: "그림자분신" }, { l: 6, m: "염동력" }] },
  396: { name: { ko: "찌르꼬", en: "Starly" }, types: ["노말", "비행"], bs: { hp: 40, atk: 55, def: 30, spa: 30, spd: 30, spe: 60 }, cr: 255, bexp: 49, moves: [{ l: 1, m: "울음소리" }, { l: 1, m: "몸통박치기" }, { l: 5, m: "전광석화" }, { l: 9, m: "날개치기" }] },
  403: { name: { ko: "꼬링크", en: "Shinx" }, types: ["전기"], bs: { hp: 45, atk: 65, def: 34, spa: 40, spd: 34, spe: 45 }, cr: 235, bexp: 53, moves: [{ l: 1, m: "째려보기" }, { l: 1, m: "몸통박치기" }, { l: 4, m: "전기충격" }, { l: 8, m: "충전" }] },
  506: { name: { ko: "요테리", en: "Lillipup" }, types: ["노말"], bs: { hp: 45, atk: 60, def: 45, spa: 25, spd: 45, spe: 55 }, cr: 255, bexp: 55, moves: [{ l: 1, m: "째려보기" }, { l: 1, m: "몸통박치기" }, { l: 4, m: "분발" }, { l: 8, m: "물기" }] },
  519: { name: { ko: "콩둘기", en: "Pidove" }, types: ["노말", "비행"], bs: { hp: 50, atk: 55, def: 50, spa: 36, spd: 30, spe: 43 }, cr: 255, bexp: 53, moves: [{ l: 1, m: "울음소리" }, { l: 1, m: "바람일으키기" }, { l: 4, m: "째려보기" }, { l: 8, m: "전광석화" }] },
  677: { name: { ko: "냐스퍼", en: "Espurr" }, types: ["에스퍼"], bs: { hp: 62, atk: 48, def: 54, spa: 63, spd: 60, spe: 68 }, cr: 190, bexp: 71, moves: [{ l: 1, m: "째려보기" }, { l: 1, m: "할퀴기" }, { l: 3, m: "속이다" }, { l: 6, m: "차밍보이스" }] },
  827: { name: { ko: "훔처우", en: "Nickit" }, types: ["악"], bs: { hp: 40, atk: 28, def: 28, spa: 47, spd: 52, spe: 50 }, cr: 255, bexp: 49, moves: [{ l: 1, m: "전광석화" }, { l: 1, m: "꼬리흔들기" }, { l: 4, m: "집단구타" }, { l: 8, m: "손톱갈기" }] },
  831: { name: { ko: "우르", en: "Wooloo" }, types: ["노말"], bs: { hp: 42, atk: 40, def: 55, spa: 40, spd: 45, spe: 48 }, cr: 255, bexp: 122, moves: [{ l: 1, m: "울음소리" }, { l: 1, m: "몸통박치기" }, { l: 4, m: "웅크리기" }, { l: 8, m: "흉내쟁이" }] },
  915: { name: { ko: "맛보돈", en: "Lechonk" }, types: ["노말"], bs: { hp: 54, atk: 45, def: 40, spa: 35, spd: 45, spe: 35 }, cr: 255, bexp: 51, moves: [{ l: 1, m: "몸통박치기" }, { l: 1, m: "꼬리흔들기" }, { l: 5, m: "차밍보이스" }, { l: 8, m: "에코보이스" }] },
};

export const ENCOUNTERS = {
  "robarts-2f": [
    { id: 19, rate: 30, minLv: 3, maxLv: 5 },
    { id: 10, rate: 30, minLv: 3, maxLv: 5 },
    { id: 506, rate: 20, minLv: 3, maxLv: 5 },
    { id: 915, rate: 20, minLv: 3, maxLv: 5 },
  ],
  "robarts-7f": [
    { id: 519, rate: 40, minLv: 6, maxLv: 9 },
    { id: 827, rate: 30, minLv: 6, maxLv: 9 },
  ],
  "robarts-10f": [
    { id: 403, rate: 30, minLv: 9, maxLv: 12 },
    { id: 263, rate: 40, minLv: 9, maxLv: 12 },
    { id: 179, rate: 30, minLv: 9, maxLv: 12 },
  ],
};

export function moveName(moveId) {
  return GS.lang === "ko" ? moveId : (MOVES[moveId]?.en || moveId);
}

export function calcStat(base, level, iv = 15, isHP = false) {
  if (isHP) {
    return Math.floor(((2 * base + iv) * level) / 100) + level + 10;
  }
  return Math.floor(((2 * base + iv) * level) / 100) + 5;
}

export function createPokemon(id, level) {
  const data = POKEDEX[id];
  if (!data) {
    return null;
  }

  const pokemon = {
    id,
    level,
    exp: 0,
    expNext: Math.pow(level, 3),
    name: data.name,
    types: [...data.types],
    stats: {},
    curHP: 0,
    moves: [],
    iv: {
      hp: Math.floor(Math.random() * 32),
      atk: Math.floor(Math.random() * 32),
      def: Math.floor(Math.random() * 32),
      spa: Math.floor(Math.random() * 32),
      spd: Math.floor(Math.random() * 32),
      spe: Math.floor(Math.random() * 32),
    },
    status: null,
    nickname: null,
  };

  pokemon.stats.hp = calcStat(data.bs.hp, level, pokemon.iv.hp, true);
  pokemon.stats.atk = calcStat(data.bs.atk, level, pokemon.iv.atk);
  pokemon.stats.def = calcStat(data.bs.def, level, pokemon.iv.def);
  pokemon.stats.spa = calcStat(data.bs.spa, level, pokemon.iv.spa);
  pokemon.stats.spd = calcStat(data.bs.spd, level, pokemon.iv.spd);
  pokemon.stats.spe = calcStat(data.bs.spe, level, pokemon.iv.spe);
  pokemon.curHP = pokemon.stats.hp;

  const availableMoves = data.moves.filter((move) => move.l <= level);
  pokemon.moves = availableMoves.slice(-4).map((move) => ({
    name: move.m,
    pp: MOVES[move.m]?.pp || 10,
    maxPP: MOVES[move.m]?.pp || 10,
  }));

  pokemon.expNext = Math.pow(level + 1, 3) - Math.pow(level, 3);
  return pokemon;
}

export function getPkDisplayName(pokemon) {
  if (pokemon.nickname) {
    return pokemon.nickname;
  }
  return GS.lang === "ko" ? pokemon.name.ko : pokemon.name.en;
}

export function getTypeEff(attackType, defendTypes) {
  let multiplier = 1;
  for (const defendType of defendTypes) {
    multiplier *= TC[attackType][defendType] || 1;
  }
  return multiplier;
}
