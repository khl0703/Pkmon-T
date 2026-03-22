import { C, W } from "../core/constants.js";
import { ck, ckDir } from "../core/input.js";
import { ctx, drawHPBar, drawPokemonSprite, drawText, drawTextCentered, drawWin } from "../core/renderer.js";
import { bagState, battleState, GS, menuState, partyState, PD, setScreen } from "../core/state.js";
import { t } from "../data/i18n.js";
import { getPkDisplayName } from "../data/pokedex.js";
import { renderField } from "./fieldSystem.js";
import { saveGame } from "./saveSystem.js";
import { showDialog } from "./dialogSystem.js";

export function updateMenu() {
  const dir = ckDir();
  if (dir === "up") menuState.sel = (menuState.sel + 5) % 6;
  if (dir === "down") menuState.sel = (menuState.sel + 1) % 6;

  if (ck("z") || ck("Z") || ck("s") || ck("S")) {
    setScreen("field");
    return;
  }

  if (ck("x") || ck("X")) {
    if (menuState.sel === 0) {
      setScreen("party");
      partyState.sel = 0;
      partyState.fromBattle = false;
    }
    if (menuState.sel === 1) setScreen("bag_menu");
    if (menuState.sel === 3) {
      saveGame();
      showDialog([t("menu.saved")], () => setScreen("menu"));
    }
    if (menuState.sel === 4) setScreen("options");
    if (menuState.sel === 5) setScreen("field");
  }
}

export function renderMenu() {
  renderField();
  drawWin(W - 90, 4, 86, 130);

  const items = ["menu.pokemon", "menu.bag", "menu.card", "menu.save", "menu.option", "menu.close"];
  for (let i = 0; i < items.length; i += 1) {
    const y = 14 + i * 19;
    if (i === menuState.sel) {
      const bounce = Math.sin(Date.now() / 150) * 1;
      drawText("▶", W - 86 + bounce, y + 10, 8, C.pokered);
    }
    drawText(t(items[i]), W - 74, y + 10, GS.lang === "ko" ? 10 : 7, i === menuState.sel ? C.text : C.textDis);
  }
}

export function updateParty() {
  const dir = ckDir();
  if (dir === "up") partyState.sel = Math.max(0, partyState.sel - 1);
  if (dir === "down") partyState.sel = Math.min(PD.party.length - 1, partyState.sel + 1);

  if (ck("z") || ck("Z")) {
    setScreen(partyState.fromBattle ? "battle" : "menu");
    return;
  }

  if ((ck("x") || ck("X")) && partyState.fromBattle) {
    const selected = PD.party[partyState.sel];
    if (selected && selected.curHP > 0 && selected !== battleState.playerPk) {
      battleState.playerPk = selected;
      battleState.msg = [t("bat.go", { name: getPkDisplayName(selected) })];
      battleState.msgIdx = 0;
      battleState.msgCharIdx = 0;
      battleState.msgTyping = true;
      battleState.phase = "result";
      setScreen("battle");
    }
  }
}

export function renderParty() {
  ctx.fillStyle = C.sky;
  ctx.fillRect(0, 0, W, 192);
  drawWin(4, 4, W - 8, 184);
  drawText(t("menu.pokemon"), 12, 20, GS.lang === "ko" ? 12 : 8, C.titleBlue);

  for (let i = 0; i < PD.party.length; i += 1) {
    const pokemon = PD.party[i];
    const y = 28 + i * 26;
    if (i === partyState.sel) {
      ctx.fillStyle = "#e8e8d8";
      ctx.fillRect(8, y, W - 16, 24);
      const bounce = Math.sin(Date.now() / 150) * 1;
      drawText("▶", 10 + bounce, y + 16, 8, C.pokered);
    }
    drawPokemonSprite(22, y + 2, pokemon.id, 20);
    drawText(getPkDisplayName(pokemon), 46, y + 12, GS.lang === "ko" ? 9 : 7, C.text);
    drawText(`Lv.${pokemon.level}`, 140, y + 12, 7, C.text, "Press Start 2P");
    drawHPBar(180, y + 8, 60, pokemon.curHP, pokemon.stats.hp);
    drawText(`${pokemon.curHP}/${pokemon.stats.hp}`, 190, y + 22, 6, C.hint, "Press Start 2P");
  }

  if (PD.party.length === 0) {
    drawTextCentered(GS.lang === "ko" ? "포켓몬이 없습니다" : "No POKéMON", 100, GS.lang === "ko" ? 12 : 8, C.textDis);
  }
}

export function updateBag() {
  if (ck("z") || ck("Z")) {
    setScreen("menu");
    return;
  }

  const dir = ckDir();
  if (dir === "left") bagState.cat = Math.max(0, bagState.cat - 1);
  if (dir === "right") bagState.cat = Math.min(1, bagState.cat + 1);

  const items = bagState.cat === 0 ? PD.bag.items : PD.bag.pokeballs;
  if (dir === "up") bagState.sel = Math.max(0, bagState.sel - 1);
  if (dir === "down") bagState.sel = Math.min(items.length - 1, bagState.sel + 1);
}

export function renderBag() {
  ctx.fillStyle = C.sky;
  ctx.fillRect(0, 0, W, 192);
  drawWin(4, 4, W - 8, 184);
  drawText(t("menu.bag"), 12, 20, GS.lang === "ko" ? 12 : 8, C.titleBlue);

  const categories = [GS.lang === "ko" ? "도구" : "Items", GS.lang === "ko" ? "포켓볼" : "Balls"];
  for (let i = 0; i < categories.length; i += 1) {
    const x = 12 + i * 70;
    ctx.fillStyle = i === bagState.cat ? C.pokered : C.textDis;
    ctx.fillRect(x, 26, 60, 14);
    drawText(categories[i], x + 4, 37, GS.lang === "ko" ? 9 : 6, C.white);
  }

  const items = bagState.cat === 0 ? PD.bag.items : PD.bag.pokeballs;
  for (let i = 0; i < items.length; i += 1) {
    const y = 46 + i * 20;
    if (i === bagState.sel) {
      ctx.fillStyle = "#e8e8d8";
      ctx.fillRect(8, y, W - 16, 18);
      const bounce = Math.sin(Date.now() / 150) * 1;
      drawText("▶", 10 + bounce, y + 13, 8, C.pokered);
    }
    drawText(t(`item.${items[i].id}`), 24, y + 13, GS.lang === "ko" ? 10 : 7, C.text);
    drawText(`x${items[i].qty}`, 200, y + 13, 7, C.text, "Press Start 2P");
  }

  if (items.length === 0) {
    drawTextCentered(GS.lang === "ko" ? "아이템이 없습니다" : "No items", 100, GS.lang === "ko" ? 10 : 7, C.textDis);
  }
}
