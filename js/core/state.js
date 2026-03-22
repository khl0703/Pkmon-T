// Shared mutable game state. Keeping it in one file makes the
// original single-file game's global state easier to track.

export const GS = {
  lang: "ko",
  bgm: 7,
  sfx: 7,
  speed: 1,
  textSpd: 2,
};

export const screenState = {
  current: "title",
};

export const titleState = { phase: "press", sel: 0, pressTimer: 0, ballAnim: 0 };
export const optState = { sel: 0, returnScreen: "title" };
export const proState = { step: 0, timer: 0, alpha: 1, textIdx: 0, typing: false, text: "", charTimer: 0 };
export const fieldState = { map: null, px: 0, py: 0, dir: "down", moving: false, moveT: 0, frame: 0, animTimer: 0, stepCount: 0 };
export const battleState = {};
export const menuState = { sel: 0, open: false, lastMessage: null };
export const dialogState = { lines: [], idx: 0, charIdx: 0, done: false, callback: null, typing: true };
export const starterState = { sel: 0 };
export const partyState = { sel: 0, fromBattle: false };
export const bagState = { sel: 0, cat: 0, mode: "list", actionSel: 0, message: null };

export const PD = {
  name: "Frances",
  gender: "female",
  money: 3000,
  badges: [],
  playTime: 0,
  party: [],
  pc: [],
  flags: {},
  bag: { items: [], pokeballs: [], battleItems: [], machines: [], keyItems: [], tms: [] },
  pokedex: { seen: [], caught: [] },
};

export const fadeState = {
  active: false,
  alpha: 0,
  dir: 1,
  callback: null,
  speed: 0.05,
};

export function setScreen(nextScreen) {
  screenState.current = nextScreen;
}

export function resetPrologueState() {
  Object.assign(proState, { step: 0, timer: 0, alpha: 1, textIdx: 0, typing: false, text: "", charTimer: 0 });
}

export function setBattleState(nextState) {
  for (const key of Object.keys(battleState)) {
    delete battleState[key];
  }
  Object.assign(battleState, nextState);
}

export function startFade(dir, callback, speed = 0.05) {
  fadeState.active = true;
  fadeState.dir = dir;
  fadeState.alpha = dir === 1 ? 0 : 1;
  fadeState.callback = callback || null;
  fadeState.speed = speed;
}

export function updateFade() {
  if (!fadeState.active) {
    return;
  }

  fadeState.alpha += fadeState.dir * fadeState.speed;

  if (fadeState.dir === 1 && fadeState.alpha >= 1) {
    fadeState.alpha = 1;
    if (fadeState.callback) {
      const callback = fadeState.callback;
      fadeState.callback = null;
      callback();
    }
    fadeState.dir = -1;
  }

  if (fadeState.dir === -1 && fadeState.alpha <= 0) {
    fadeState.alpha = 0;
    fadeState.active = false;
  }
}
