import { C, W } from "../core/constants.js";
import { ck, ckDir } from "../core/input.js";
import { ctx, drawHPBar, drawPokemonSprite, drawText, drawTextCentered, drawWin } from "../core/renderer.js";
import { bagState, battleState, GS, menuState, optState, partyState, PD, setScreen } from "../core/state.js";
import { t } from "../data/i18n.js";
import { getPkDisplayName } from "../data/pokedex.js";
import { BAG_CATEGORIES, getCategoryItems, getItemData, getItemDescription, getItemName } from "../data/items.js";
import { renderField } from "./fieldSystem.js";
import { saveGame } from "./saveSystem.js";
import { showDialog } from "./dialogSystem.js";

export function updateMenu() {
  const dir = ckDir();
  if (dir === "up") menuState.sel = (menuState.sel + 6) % 7;
  if (dir === "down") menuState.sel = (menuState.sel + 1) % 7;

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
    if (menuState.sel === 1) {
      resetBagState();
      setScreen("bag_menu");
    }
    if (menuState.sel === 2 || menuState.sel === 3) {
      showDialog([t("menu.stub")], () => setScreen("menu"));
    }
    if (menuState.sel === 4) {
      saveGame();
      showDialog([t("menu.saved")], () => setScreen("menu"));
    }
    if (menuState.sel === 5) {
      optState.returnScreen = "menu";
      optState.sel = 0;
      setScreen("options");
    }
    if (menuState.sel === 6) setScreen("field");
  }
}

export function renderMenu() {
  renderField();
  ctx.fillStyle = "rgba(0,0,0,0.35)";
  ctx.fillRect(0, 0, W, 192);
  drawWin(W - 108, 4, 104, 150);

  const items = [
    "menu.pokemon",
    "menu.bag",
    "menu.pokedex",
    "menu.trainer",
    "menu.save",
    "menu.option",
    "menu.close",
  ];
  for (let i = 0; i < items.length; i += 1) {
    const y = 14 + i * 19;
    if (i === menuState.sel) {
      const bounce = Math.sin(Date.now() / 150) * 1;
      drawText("▶", W - 102 + bounce, y + 10, 8, C.pokered);
    }
    const isStub = i === 2 || i === 3;
    drawText(t(items[i]), W - 90, y + 10, GS.lang === "ko" ? 10 : 7, i === menuState.sel ? C.text : isStub ? C.textDis : C.text);
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
  const items = getCurrentBagItems();

  if (bagState.mode === "message") {
    if (ck("x") || ck("X") || ck("z") || ck("Z")) {
      bagState.mode = "list";
      bagState.message = null;
    }
    return;
  }

  if (ck("z") || ck("Z")) {
    if (bagState.mode === "actions") {
      bagState.mode = "list";
      return;
    }
    setScreen("menu");
    return;
  }

  const dir = ckDir();
  if (dir === "left") {
    bagState.cat = (bagState.cat + BAG_CATEGORIES.length - 1) % BAG_CATEGORIES.length;
    bagState.sel = 0;
    bagState.mode = "list";
  }
  if (dir === "right") {
    bagState.cat = (bagState.cat + 1) % BAG_CATEGORIES.length;
    bagState.sel = 0;
    bagState.mode = "list";
  }

  if (bagState.mode === "actions") {
    if (dir === "up") bagState.actionSel = (bagState.actionSel + 2) % 3;
    if (dir === "down") bagState.actionSel = (bagState.actionSel + 1) % 3;
    if (ck("x") || ck("X")) {
      handleBagAction(items[bagState.sel]);
    }
    return;
  }

  if (dir === "up") bagState.sel = Math.max(0, bagState.sel - 1);
  if (dir === "down") bagState.sel = Math.min(Math.max(0, items.length - 1), bagState.sel + 1);

  if ((ck("x") || ck("X")) && items.length > 0) {
    bagState.mode = "actions";
    bagState.actionSel = 0;
  }
}

export function renderBag() {
  ctx.fillStyle = C.sky;
  ctx.fillRect(0, 0, W, 192);
  drawWin(4, 4, W - 8, 184);
  drawText(t("menu.bag"), 12, 20, GS.lang === "ko" ? 12 : 8, C.titleBlue);

  for (let i = 0; i < BAG_CATEGORIES.length; i += 1) {
    const x = 10 + i * 48;
    ctx.fillStyle = i === bagState.cat ? C.pokered : C.textDis;
    ctx.fillRect(x, 26, 44, 14);
    drawText(t(BAG_CATEGORIES[i].labelKey), x + 3, 37, GS.lang === "ko" ? 7 : 5, C.white);
  }

  const items = getCurrentBagItems();
  const selectedItem = items[bagState.sel] || null;

  drawWin(8, 46, 142, 108);
  for (let i = 0; i < items.length; i += 1) {
    const y = 54 + i * 16;
    if (i === bagState.sel && bagState.mode !== "message") {
      ctx.fillStyle = "#e8e8d8";
      ctx.fillRect(12, y - 10, 134, 14);
      const bounce = Math.sin(Date.now() / 150) * 1;
      drawText("▶", 14 + bounce, y, 8, C.pokered);
    }
    drawText(getItemName(items[i].id, GS.lang), 26, y, GS.lang === "ko" ? 9 : 6, C.text);
    drawText(`x${items[i].qty}`, 118, y, 7, C.text, "Press Start 2P");
  }

  if (items.length === 0) {
    drawTextCentered(t("bag.empty"), 100, GS.lang === "ko" ? 10 : 7, C.textDis);
  }

  drawWin(154, 46, 94, 108);
  drawText(t("bag.desc"), 162, 58, GS.lang === "ko" ? 9 : 6, C.titleBlue);
  if (selectedItem) {
    drawText(getItemName(selectedItem.id, GS.lang), 162, 74, GS.lang === "ko" ? 10 : 7, C.text);
    drawText(`${t("bag.qty")}: ${selectedItem.qty}`, 162, 88, 7, C.hint, "Press Start 2P");
    drawWrappedText(getItemDescription(selectedItem.id, GS.lang), 162, 104, 78, GS.lang === "ko" ? 10 : 6, C.text);
  } else {
    drawWrappedText(t("bag.empty"), 162, 88, 78, GS.lang === "ko" ? 10 : 6, C.textDis);
  }

  if (bagState.mode === "actions" && selectedItem) {
    drawWin(134, 98, 70, 56);
    drawText(t("bag.choose"), 140, 110, GS.lang === "ko" ? 8 : 5, C.titleBlue);
    const actions = ["bag.view", "bag.use", "bag.cancel"];
    for (let i = 0; i < actions.length; i += 1) {
      const y = 124 + i * 10;
      if (i === bagState.actionSel) {
        const bounce = Math.sin(Date.now() / 150) * 1;
        drawText("▶", 140 + bounce, y, 8, C.pokered);
      }
      drawText(t(actions[i]), 150, y, GS.lang === "ko" ? 8 : 5, i === bagState.actionSel ? C.text : C.textDis);
    }
  }

  if (bagState.mode === "message" && bagState.message) {
    drawWin(28, 126, 200, 36);
    drawWrappedText(bagState.message, 36, 141, 184, GS.lang === "ko" ? 10 : 6, C.text);
  }
}

function resetBagState() {
  bagState.sel = 0;
  bagState.cat = 0;
  bagState.mode = "list";
  bagState.actionSel = 0;
  bagState.message = null;
}

function getCurrentBagItems() {
  const category = BAG_CATEGORIES[bagState.cat];
  return getCategoryItems(PD.bag, category.id);
}

function handleBagAction(itemEntry) {
  if (!itemEntry) {
    bagState.mode = "list";
    return;
  }

  const itemData = getItemData(itemEntry.id);
  if (!itemData) {
    bagState.mode = "message";
    bagState.message = t("bag.notReady");
    return;
  }

  if (bagState.actionSel === 0) {
    bagState.mode = "message";
    bagState.message = getItemDescription(itemEntry.id, GS.lang);
    return;
  }

  if (bagState.actionSel === 1) {
    bagState.mode = "message";
    bagState.message = itemData.usableInField ? t("bag.notReady") : t("bag.cantUse");
    return;
  }

  bagState.mode = "list";
}

function drawWrappedText(text, x, y, maxWidth, size, color) {
  const words = GS.lang === "ko" ? text.split("") : text.split(" ");
  let line = "";
  let lineY = y;
  const font = GS.lang === "ko" ? "DotGothic16" : "Press Start 2P";

  ctx.font = `${size}px "${font}"`;
  ctx.fillStyle = color;

  for (let i = 0; i < words.length; i += 1) {
    const token = GS.lang === "ko" ? words[i] : `${words[i]} `;
    const testLine = line + token;
    if (ctx.measureText(testLine).width > maxWidth && line) {
      ctx.fillText(line, x, lineY);
      line = token;
      lineY += size + 2;
    } else {
      line = testLine;
    }
  }

  if (line) {
    ctx.fillText(line, x, lineY);
  }
}
