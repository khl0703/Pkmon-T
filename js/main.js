import { C, H, TICK, W } from "./core/constants.js";
import { ck, ckAny, ckDir, initInput } from "./core/input.js";
import { beginFrame, ctx, drawFade, drawPokeball, drawText, drawTextCentered, drawWin } from "./core/renderer.js";
import { loadSettingsFromStorage, saveSettingsToStorage } from "./core/storage.js";
import { clamp } from "./core/utils.js";
import { GS, fadeState, optState, proState, resetPrologueState, screenState, setScreen, startFade, titleState, updateFade, PD } from "./core/state.js";
import { t } from "./data/i18n.js";
import { updateBattle, renderBattle } from "./systems/battleSystem.js";
import { renderDialog, showDialog, updateDialog } from "./systems/dialogSystem.js";
import { loadMap, renderField, renderStarter, updateField, updateStarter } from "./systems/fieldSystem.js";
import { loadGame } from "./systems/saveSystem.js";
import { renderBag, renderMenu, renderParty, updateBag, updateMenu, updateParty } from "./systems/menuSystem.js";

let lastTime = 0;
let accumulator = 0;

initInput();
loadSettings();

function loadSettings() {
  const saved = loadSettingsFromStorage();
  if (saved) {
    Object.assign(GS, saved);
  }
}

function saveSettings() {
  saveSettingsToStorage(GS);
}

function updateTitle() {
  optState.returnScreen = "title";
  titleState.ballAnim += 0.02;
  titleState.pressTimer += 1;

  if (titleState.phase === "press") {
    if (ckAny()) {
      titleState.phase = "menu";
    }
    return;
  }

  const dir = ckDir();
  if (dir === "up") titleState.sel = (titleState.sel + 3) % 4;
  if (dir === "down") titleState.sel = (titleState.sel + 1) % 4;

  if (!(ck("x") || ck("X"))) {
    return;
  }

  if (titleState.sel === 0) {
    startFade(1, () => {
      if (PD.flags.prologue_done) {
        setScreen("field");
        loadMap(PD.flags.currentMap || "robarts-5f");
      } else {
        setScreen("prologue");
        resetPrologueState();
      }
    });
  }

  if (titleState.sel === 1 && loadGame()) {
    startFade(1, () => {
      setScreen("field");
      loadMap(PD.flags.currentMap || "robarts-5f");
    });
  }

  if (titleState.sel === 2) {
    optState.returnScreen = "title";
    setScreen("options");
    optState.sel = 0;
  }
}

function renderTitle() {
  ctx.fillStyle = C.white;
  ctx.fillRect(0, 0, W, H);

  for (let i = 0; i < 6; i += 1) {
    const ballX = (i * 50 + titleState.ballAnim * 30) % (W + 40) - 20;
    const ballY = 20 + Math.sin(titleState.ballAnim * 2 + i * 1.2) * 15 + i * 25;
    ctx.globalAlpha = 0.15;
    drawPokeball(ballX, ballY, 24);
    ctx.globalAlpha = 1;
  }

  drawTextCentered(t("title.name"), 50, GS.lang === "ko" ? 16 : 10, C.titleBlue);

  ctx.fillStyle = C.hint;
  ctx.font = `8px "${GS.lang === "ko" ? "DotGothic16" : "Press Start 2P"}"`;
  const subtitle = GS.lang === "ko" ? "캐나다 토론토를 배경으로 한 포켓몬 팬게임" : "A Pokémon fan game set in Toronto";
  const width = ctx.measureText(subtitle).width;
  ctx.fillText(subtitle, (W - width) / 2, 65);

  if (titleState.phase === "press") {
    if (Math.floor(titleState.pressTimer / 30) % 2 === 0) {
      drawTextCentered(t("title.press"), 140, GS.lang === "ko" ? 12 : 8, C.text);
    }
    return;
  }

  const items = ["title.new", "title.continue", "title.options", "title.credits"];
  for (let i = 0; i < items.length; i += 1) {
    const y = 85 + i * 22;
    if (i === titleState.sel) {
      drawWin(60, y - 4, W - 120, 20);
      const bounce = Math.sin(Date.now() / 150) * 1;
      drawText("▶", 65 + bounce, y + 9, 10, C.pokered);
    }
    drawText(t(items[i]), 80, y + 10, GS.lang === "ko" ? 12 : 8, i === titleState.sel ? C.text : C.textDis);
  }
}

function updateOptions() {
  const dir = ckDir();
  if (dir === "up") optState.sel = (optState.sel + 5) % 6;
  if (dir === "down") optState.sel = (optState.sel + 1) % 6;

  if (dir === "left" || dir === "right") {
    const delta = dir === "right" ? 1 : -1;
    if (optState.sel === 0) GS.lang = GS.lang === "ko" ? "en" : "ko";
    if (optState.sel === 1) GS.bgm = clamp(GS.bgm + delta, 0, 10);
    if (optState.sel === 2) GS.sfx = clamp(GS.sfx + delta, 0, 10);
    if (optState.sel === 3) GS.speed = GS.speed === 1 ? 2 : GS.speed === 2 ? 3 : 1;
    if (optState.sel === 4) GS.textSpd = (GS.textSpd + 1) % 3;
    saveSettings();
  }

  if (ck("z") || ck("Z") || ((ck("x") || ck("X")) && optState.sel === 5)) {
    setScreen(optState.returnScreen || "title");
    saveSettings();
  }
}

function renderOptions() {
  ctx.fillStyle = C.sky;
  ctx.fillRect(0, 0, W, H);
  drawWin(16, 10, W - 32, H - 20);
  drawTextCentered(t("opt.title"), 30, GS.lang === "ko" ? 14 : 10, C.titleBlue);

  const items = [
    { label: "opt.lang", val: GS.lang === "ko" ? "한국어" : "English" },
    { label: "opt.bgm", val: `◀ ${"█".repeat(GS.bgm)}${"░".repeat(10 - GS.bgm)} ▶` },
    { label: "opt.sfx", val: `◀ ${"█".repeat(GS.sfx)}${"░".repeat(10 - GS.sfx)} ▶` },
    { label: "opt.speed", val: `◀ x${GS.speed} ▶` },
    { label: "opt.textspd", val: `◀ ${["느림/Slow", "보통/Mid", "빠름/Fast"][GS.textSpd]} ▶` },
    { label: "opt.back", val: "" },
  ];

  for (let i = 0; i < items.length; i += 1) {
    const y = 46 + i * 22;
    if (i === optState.sel) {
      const bounce = Math.sin(Date.now() / 150) * 1;
      drawText("▶", 24 + bounce, y + 10, 10, C.pokered);
    }
    drawText(t(items[i].label), 38, y + 10, GS.lang === "ko" ? 11 : 7, i === optState.sel ? C.text : C.textDis);
    if (items[i].val) {
      drawText(items[i].val, 120, y + 10, 7, C.text, "Press Start 2P");
    }
  }
}

function updatePrologue() {
  proState.timer += 1;
  const steps = ["pro.1", "pro.2", "pro.3", "pro.4", "pro.5", "pro.6", "pro.7"];

  if (proState.step < steps.length) {
    if (proState.timer < 30) {
      proState.alpha = Math.max(0, 1 - proState.timer / 30);
    } else if (proState.timer < 120) {
      proState.alpha = 0;
      proState.typing = true;
      proState.charTimer += [0.5, 1, 2][GS.textSpd];
    } else if (ck("x") || ck("X") || ck("z") || ck("Z") || proState.timer > 240) {
      proState.step += 1;
      proState.timer = 0;
      proState.charTimer = 0;
    }
  } else {
    PD.flags.prologue_done = true;
    startFade(1, () => {
      setScreen("field");
      loadMap("robarts-5f");
    });
  }
}

function renderPrologue() {
  ctx.fillStyle = C.black;
  ctx.fillRect(0, 0, W, H);

  const steps = ["pro.1", "pro.2", "pro.3", "pro.4", "pro.5", "pro.6", "pro.7"];
  if (proState.step < steps.length) {
    const text = t(steps[proState.step]);
    const shown = text.substring(0, Math.floor(proState.charTimer));
    if (proState.step <= 4) {
      drawTextCentered(shown, H / 2 + 4, GS.lang === "ko" ? 14 : 9, C.white);
    } else {
      const brightness = Math.min(1, (proState.timer - 20) / 60);
      ctx.fillStyle = `rgba(184,200,216,${brightness * 0.5})`;
      ctx.fillRect(0, 0, W, H);
      drawTextCentered(shown, H / 2 + 4, GS.lang === "ko" ? 14 : 9, brightness > 0.3 ? C.text : C.white);
    }
  }

  if (proState.timer < 5 && proState.step > 0) {
    ctx.fillStyle = `rgba(255,255,255,${1 - proState.timer / 5})`;
    ctx.fillRect(0, 0, W, H);
  }
}

function update() {
  updateFade();
  if (fadeState.active) {
    return;
  }
  if (screenState.current === "title") updateTitle();
  if (screenState.current === "options") updateOptions();
  if (screenState.current === "prologue") updatePrologue();
  if (screenState.current === "field") updateField();
  if (screenState.current === "battle") updateBattle();
  if (screenState.current === "menu") updateMenu();
  if (screenState.current === "dialog") updateDialog();
  if (screenState.current === "starter") updateStarter();
  if (screenState.current === "party") updateParty();
  if (screenState.current === "bag_menu") updateBag();
}

function render() {
  beginFrame();
  if (screenState.current === "title") renderTitle();
  if (screenState.current === "options") renderOptions();
  if (screenState.current === "prologue") renderPrologue();
  if (screenState.current === "field") renderField();
  if (screenState.current === "battle") renderBattle();
  if (screenState.current === "menu") renderMenu();
  if (screenState.current === "dialog") {
    renderField();
    renderDialog();
  }
  if (screenState.current === "starter") renderStarter();
  if (screenState.current === "party") renderParty();
  if (screenState.current === "bag_menu") renderBag();
  drawFade();
}

function gameLoop(time) {
  requestAnimationFrame(gameLoop);
  const dt = time - lastTime;
  lastTime = time;
  accumulator += dt * GS.speed;

  while (accumulator >= TICK) {
    accumulator -= TICK;
    update();
  }

  render();
}

requestAnimationFrame(gameLoop);
