// Shared constants that are used across rendering, gameplay, and UI modules.
export const W = 256;
export const H = 192;
export const TILE = 16;
export const TICK = 1000 / 60;

export const C = {
  pokered: "#e04848",
  sky: "#b8c8d8",
  winBg: "#f8f8f0",
  winBrd: "#383838",
  text: "#383838",
  textDis: "#a0a098",
  textHi: "#e04848",
  hint: "#8898a8",
  titleBlue: "#3868b0",
  white: "#ffffff",
  black: "#000000",
  hpGreen: "#48b048",
  hpYellow: "#d8a820",
  hpRed: "#e04848",
  expBlue: "#4888d8",
  grassGreen: "#58a848",
  grassDark: "#388830",
  water: "#5090d0",
  path: "#c8b888",
  wall: "#706858",
  floor: "#d8c8a0",
  roof: "#985848",
  door: "#806040",
  bookshelf: "#604828",
  carpet: "#b04848",
  desk: "#a09070",
  chair: "#887858",
};

export const TYPES = [
  "노말",
  "불꽃",
  "물",
  "풀",
  "전기",
  "얼음",
  "격투",
  "독",
  "땅",
  "비행",
  "에스퍼",
  "벌레",
  "바위",
  "고스트",
  "드래곤",
  "악",
  "강철",
  "페어리",
];

export const TYPE_EN = {
  노말: "Normal",
  불꽃: "Fire",
  물: "Water",
  풀: "Grass",
  전기: "Electric",
  얼음: "Ice",
  격투: "Fighting",
  독: "Poison",
  땅: "Ground",
  비행: "Flying",
  에스퍼: "Psychic",
  벌레: "Bug",
  바위: "Rock",
  고스트: "Ghost",
  드래곤: "Dragon",
  악: "Dark",
  강철: "Steel",
  페어리: "Fairy",
};

export const TYPE_COLOR = {
  노말: "#a8a878",
  불꽃: "#f08030",
  물: "#6890f0",
  풀: "#78c850",
  전기: "#f8d030",
  얼음: "#98d8d8",
  격투: "#c03028",
  독: "#a040a0",
  땅: "#e0c068",
  비행: "#a890f0",
  에스퍼: "#f85888",
  벌레: "#a8b820",
  바위: "#b8a038",
  고스트: "#705898",
  드래곤: "#7038f8",
  악: "#705848",
  강철: "#b8b8d0",
  페어리: "#ee99ac",
};

const SE = {
  불꽃: ["풀", "벌레", "얼음", "강철"],
  물: ["불꽃", "바위", "땅"],
  풀: ["물", "바위", "땅"],
  전기: ["물", "비행"],
  얼음: ["풀", "땅", "비행", "드래곤"],
  격투: ["노말", "바위", "강철", "얼음", "악"],
  독: ["풀", "페어리"],
  땅: ["불꽃", "전기", "독", "바위", "강철"],
  비행: ["풀", "격투", "벌레"],
  에스퍼: ["격투", "독"],
  벌레: ["풀", "에스퍼", "악"],
  바위: ["불꽃", "얼음", "비행", "벌레"],
  고스트: ["에스퍼", "고스트"],
  드래곤: ["드래곤"],
  악: ["에스퍼", "고스트"],
  강철: ["바위", "얼음", "페어리"],
  페어리: ["격투", "드래곤", "악"],
};

const NVE = {
  노말: ["바위", "강철"],
  불꽃: ["불꽃", "물", "바위", "드래곤"],
  물: ["물", "풀", "드래곤"],
  풀: ["불꽃", "풀", "독", "비행", "벌레", "드래곤", "강철"],
  전기: ["전기", "풀", "드래곤"],
  얼음: ["불꽃", "물", "얼음", "강철"],
  격투: ["독", "비행", "에스퍼", "벌레", "페어리"],
  독: ["독", "땅", "바위", "고스트"],
  땅: ["풀", "벌레"],
  비행: ["전기", "바위", "강철"],
  에스퍼: ["에스퍼", "강철"],
  벌레: ["불꽃", "격투", "독", "비행", "고스트", "강철", "페어리"],
  바위: ["격투", "땅", "강철"],
  고스트: ["악"],
  드래곤: ["강철"],
  악: ["격투", "악", "페어리"],
  강철: ["불꽃", "물", "전기", "강철"],
  페어리: ["불꽃", "독", "강철"],
};

const IMM = {
  노말: ["고스트"],
  전기: ["땅"],
  격투: ["고스트"],
  독: ["강철"],
  땅: ["비행"],
  에스퍼: ["악"],
  고스트: ["노말"],
  드래곤: ["페어리"],
};

export const TC = {};
for (const atkType of TYPES) {
  TC[atkType] = {};
  for (const defType of TYPES) {
    TC[atkType][defType] = 1;
  }
}

for (const attackType in SE) {
  for (const defendType of SE[attackType]) {
    TC[attackType][defendType] = 2;
  }
}

for (const attackType in NVE) {
  for (const defendType of NVE[attackType]) {
    TC[attackType][defendType] = 0.5;
  }
}

for (const attackType in IMM) {
  for (const defendType of IMM[attackType]) {
    TC[attackType][defendType] = 0;
  }
}
