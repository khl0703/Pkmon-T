import { C, H, TILE, W } from "../core/constants.js";
import { ck, keys } from "../core/input.js";
import { ctx, drawCharSprite, drawPokemonSprite, drawText, drawTextCentered, drawTile, drawWin } from "../core/renderer.js";
import { fadeState, fieldState, GS, menuState, PD, screenState, setScreen, starterState, startFade } from "../core/state.js";
import { t } from "../data/i18n.js";
import { MAPS } from "../data/maps.js";
import { createPokemon, getPkDisplayName } from "../data/pokedex.js";
import { showDialog } from "./dialogSystem.js";
import { startWildBattle } from "./battleSystem.js";

export function loadMap(mapId) {
  const map = MAPS[mapId];
  if (!map) {
    return;
  }

  fieldState.map = mapId;
  PD.flags.currentMap = mapId;
  const spawn = map.spawns.default || map.spawns[Object.keys(map.spawns)[0]];
  fieldState.px = spawn.x;
  fieldState.py = spawn.y;
  fieldState.dir = spawn.dir || "down";
  fieldState.moving = false;
  fieldState.moveT = 0;
}

export function loadMapAt(mapId, spawnId) {
  const map = MAPS[mapId];
  if (!map) {
    return;
  }

  fieldState.map = mapId;
  PD.flags.currentMap = mapId;
  const spawn = map.spawns[spawnId] || map.spawns.default || map.spawns[Object.keys(map.spawns)[0]];
  fieldState.px = spawn.x;
  fieldState.py = spawn.y;
  fieldState.dir = spawn.dir || "down";
  fieldState.moving = false;
  fieldState.moveT = 0;
}

export function getTile(mapId, x, y) {
  const map = MAPS[mapId];
  if (!map || x < 0 || y < 0 || x >= map.w || y >= map.h) {
    return 1;
  }
  return map.tiles[y * map.w + x];
}

export function isWalkable(mapId, x, y) {
  const tile = getTile(mapId, x, y);
  if (tile === 1 || tile === 3 || tile === 7 || tile === 9) {
    return false;
  }

  const map = MAPS[mapId];
  if (map?.npcs) {
    for (const npc of map.npcs) {
      if (npc.x === x && npc.y === y) {
        return false;
      }
    }
  }

  return true;
}

export function updateField() {
  if (fadeState.active) {
    return;
  }

  const map = MAPS[fieldState.map];
  if (!map) {
    return;
  }

  if (fieldState.moving) {
    fieldState.moveT += (keys.z || keys.Z) ? 4 : 2;
    if (fieldState.moveT >= TILE) {
      fieldState.moveT = 0;
      fieldState.moving = false;
      fieldState.stepCount += 1;

      for (const exit of map.exits || []) {
        if (fieldState.px === exit.x && fieldState.py === exit.y) {
          startFade(1, () => loadMapAt(exit.to, exit.spawn));
          return;
        }
      }

      const tile = getTile(fieldState.map, fieldState.px, fieldState.py);
      if (tile === 2 && map.encounter && Math.random() < 0.15) {
        startWildBattle(map.encounter);
      }
    }
    return;
  }

  if (ck("s") || ck("S")) {
    setScreen("menu");
    menuState.sel = 0;
    return;
  }

  if (ck("x") || ck("X")) {
    let fx = fieldState.px;
    let fy = fieldState.py;
    if (fieldState.dir === "up") fy -= 1;
    if (fieldState.dir === "down") fy += 1;
    if (fieldState.dir === "left") fx -= 1;
    if (fieldState.dir === "right") fx += 1;

    for (const npc of map.npcs || []) {
      if (npc.x === fx && npc.y === fy) {
        interactNPC(npc);
        return;
      }
    }
  }

  let dir = null;
  if (keys.ArrowUp) dir = "up";
  else if (keys.ArrowDown) dir = "down";
  else if (keys.ArrowLeft) dir = "left";
  else if (keys.ArrowRight) dir = "right";

  if (!dir) {
    return;
  }

  if (fieldState.dir !== dir) {
    fieldState.dir = dir;
  }

  let nx = fieldState.px;
  let ny = fieldState.py;
  if (dir === "up") ny -= 1;
  if (dir === "down") ny += 1;
  if (dir === "left") nx -= 1;
  if (dir === "right") nx += 1;

  if (isWalkable(fieldState.map, nx, ny)) {
    fieldState.px = nx;
    fieldState.py = ny;
    fieldState.moving = true;
    fieldState.moveT = 0;
    fieldState.frame = (fieldState.frame + 1) % 4;
  }
}

export function interactNPC(npc) {
  if (fieldState.dir === "up") npc.dir = "down";
  if (fieldState.dir === "down") npc.dir = "up";
  if (fieldState.dir === "left") npc.dir = "right";
  if (fieldState.dir === "right") npc.dir = "left";

  let lines = npc.dialog ? npc.dialog.map((key) => t(key)) : (npc.dialog_raw || [{ ko: "...", en: "..." }]);
  if (npc.dialog_raw) {
    lines = npc.dialog_raw;
  }

  if (npc.action === "starter_choice" && !PD.flags.has_starter) {
    showDialog(lines, () => {
      setScreen("starter");
      starterState.sel = 0;
    });
    return;
  }

  if (npc.action === "heal") {
    showDialog(lines, () => {
      for (const pokemon of PD.party) {
        pokemon.curHP = pokemon.stats.hp;
        pokemon.status = null;
        for (const move of pokemon.moves) {
          move.pp = move.maxPP;
        }
      }
      showDialog([{ ko: "포켓몬이 모두 건강해졌습니다!", en: "Your POKéMON are fully healed!" }], () => {
        setScreen("field");
      });
    });
    return;
  }

  if (npc.flag && PD.flags[npc.flag]) {
    const shortDialog = npc.dialog_raw ? [npc.dialog_raw[0]] : [{ ko: "...", en: "..." }];
    showDialog(shortDialog, () => setScreen("field"));
    return;
  }

  showDialog(lines, () => {
    if (npc.flag) {
      PD.flags[npc.flag] = true;
    }
    setScreen("field");
  });
}

export function renderField() {
  const map = MAPS[fieldState.map];
  if (!map) {
    return;
  }

  ctx.fillStyle = C.black;
  ctx.fillRect(0, 0, W, H);

  let camX = fieldState.px * TILE - W / 2 + TILE / 2;
  let camY = fieldState.py * TILE - H / 2 + TILE / 2;
  let offX = 0;
  let offY = 0;

  if (fieldState.moving) {
    const progress = fieldState.moveT / TILE;
    if (fieldState.dir === "up") offY = TILE * (1 - progress);
    if (fieldState.dir === "down") offY = -TILE * (1 - progress);
    if (fieldState.dir === "left") offX = TILE * (1 - progress);
    if (fieldState.dir === "right") offX = -TILE * (1 - progress);
    camX -= offX;
    camY -= offY;
  }

  const mapPixelWidth = map.w * TILE;
  const mapPixelHeight = map.h * TILE;

  if (mapPixelWidth <= W) {
    camX = -(W - mapPixelWidth) / 2;
  } else {
    camX = Math.max(0, Math.min(camX, mapPixelWidth - W));
  }

  if (mapPixelHeight <= H) {
    camY = -(H - mapPixelHeight) / 2;
  } else {
    camY = Math.max(0, Math.min(camY, mapPixelHeight - H));
  }

  ctx.save();
  ctx.translate(-Math.round(camX), -Math.round(camY));

  const startTX = Math.max(0, Math.floor(camX / TILE));
  const startTY = Math.max(0, Math.floor(camY / TILE));
  const endTX = Math.min(map.w, Math.ceil((camX + W) / TILE) + 1);
  const endTY = Math.min(map.h, Math.ceil((camY + H) / TILE) + 1);

  for (let ty = startTY; ty < endTY; ty += 1) {
    for (let tx = startTX; tx < endTX; tx += 1) {
      drawTile(tx, ty, map.tiles[ty * map.w + tx] || 0);
    }
  }

  for (const npc of map.npcs || []) {
    drawCharSprite(
      npc.x * TILE,
      npc.y * TILE - 16,
      npc.dir,
      0,
      false,
      npc.sprite === "ash" ? "#d09020" : npc.sprite === "nurse" ? "#e87898" : "#808080",
      npc.spriteSheet || npc.sprite
    );
  }

  drawCharSprite(
    fieldState.px * TILE,
    fieldState.py * TILE - 16,
    fieldState.dir,
    fieldState.frame,
    true,
    undefined,
    "player",
    fieldState.moving
  );
  ctx.restore();

  const mapName = GS.lang === "ko" ? map.name.ko : map.name.en;
  ctx.fillStyle = "rgba(0,0,0,0.6)";
  ctx.fillRect(0, 0, W, 16);
  drawText(mapName, 4, 12, GS.lang === "ko" ? 10 : 7, C.white);
}

export function updateStarter() {
  if (ck("ArrowLeft")) starterState.sel = (starterState.sel + 2) % 3;
  if (ck("ArrowRight")) starterState.sel = (starterState.sel + 1) % 3;
  if (ck("ArrowUp")) starterState.sel = (starterState.sel + 2) % 3;
  if (ck("ArrowDown")) starterState.sel = (starterState.sel + 1) % 3;

  if (ck("x") || ck("X")) {
    const ids = [4, 7, 1];
    const chosen = ids[starterState.sel];
    const starter = createPokemon(chosen, 5);
    PD.party.push(starter);
    PD.flags.has_starter = true;
    PD.pokedex.seen.push(chosen);
    PD.pokedex.caught.push(chosen);
    PD.bag.items.push({ id: "potion", qty: 3 });
    PD.bag.pokeballs.push({ id: "pokeball", qty: 5 });

    const name = getPkDisplayName(starter);
    showDialog(
      [
        { ko: `${name}(을)를 받았다!`, en: `You received ${name}!` },
        { ko: "상처약을 3개 받았다!", en: "Received Potion x3!" },
        { ko: "포켓볼을 5개 받았다!", en: "Received POKé BALL x5!" },
        { ko: "Ash: 행운을 빌어!", en: "Ash: Good luck out there!" },
      ],
      () => setScreen("field")
    );
  }

  if (ck("z") || ck("Z")) {
    setScreen("field");
  }
}

export function renderStarter() {
  renderField();
  ctx.fillStyle = "rgba(0,0,0,0.5)";
  ctx.fillRect(0, 0, W, H);
  drawWin(32, 28, W - 64, H - 56);
  drawTextCentered(GS.lang === "ko" ? "파트너를 선택하세요!" : "Choose your partner!", 64, GS.lang === "ko" ? 15 : 9, C.titleBlue);

  const ids = [4, 7, 1];
  const names = [t("npc.starter.1"), t("npc.starter.2"), t("npc.starter.3")];
  const boxWidth = 132;
  const gap = 24;
  const startX = Math.floor((W - (boxWidth * 3 + gap * 2)) / 2);
  const boxY = 118;

  for (let i = 0; i < 3; i += 1) {
    const boxX = startX + i * (boxWidth + gap);

    if (i === starterState.sel) {
      drawWin(boxX, boxY, boxWidth, 150);
      const bounce = Math.sin(Date.now() / 150) * 1;
      drawText("▶", boxX + 8 + bounce, boxY + 80, 10, C.pokered);
    } else {
      drawWin(boxX, boxY, boxWidth, 150);
    }

    drawPokemonSprite(boxX + 28, boxY + 18, ids[i], 76);
    drawText(names[i], boxX + 14, boxY + 118, GS.lang === "ko" ? 10 : 6, i === starterState.sel ? C.text : C.textDis);
  }
}
