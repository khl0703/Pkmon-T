import { fieldState, PD } from "../core/state.js";
import { loadSaveFromStorage, saveGameToStorage } from "../core/storage.js";

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
  PD.party = data.party || [];
  PD.pc = data.pc || [];
  PD.bag = data.bag || { items: [], pokeballs: [], keyItems: [], tms: [] };
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
