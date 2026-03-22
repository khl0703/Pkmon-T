import { C, H, W } from "../core/constants.js";
import { ck } from "../core/input.js";
import { ctx, drawText, drawWin } from "../core/renderer.js";
import { dialogState, GS, setScreen } from "../core/state.js";
import { t } from "../data/i18n.js";

export function showDialog(lines, callback) {
  setScreen("dialog");
  dialogState.lines = lines;
  dialogState.idx = 0;
  dialogState.charIdx = 0;
  dialogState.done = false;
  dialogState.typing = true;
  dialogState.callback = callback || null;
}

export function updateDialog() {
  const line = dialogState.lines[dialogState.idx];
  if (!line) {
    if (dialogState.callback) {
      dialogState.callback();
    }
    return;
  }

  const text = typeof line === "string" ? t(line) : (GS.lang === "ko" ? line.ko : line.en);

  if (dialogState.typing) {
    dialogState.charIdx += [0.5, 1, 2][GS.textSpd];
    if (dialogState.charIdx >= text.length) {
      dialogState.charIdx = text.length;
      dialogState.typing = false;
    }
  }

  if (ck("x") || ck("X")) {
    if (dialogState.typing) {
      dialogState.charIdx = text.length;
      dialogState.typing = false;
      return;
    }

    dialogState.idx += 1;
    dialogState.charIdx = 0;
    dialogState.typing = true;

    if (dialogState.idx >= dialogState.lines.length) {
      dialogState.done = true;
      if (dialogState.callback) {
        dialogState.callback();
      }
    }
  }
}

export function renderDialog() {
  const line = dialogState.lines[dialogState.idx];
  if (!line) {
    return;
  }

  const text = typeof line === "string" ? t(line) : (GS.lang === "ko" ? line.ko : line.en);
  const shown = text.substring(0, Math.floor(dialogState.charIdx));

  drawWin(4, H - 52, W - 8, 48);
  drawText(shown, 12, H - 32, GS.lang === "ko" ? 12 : 8, C.text);

  if (!dialogState.typing) {
    const bounce = Math.sin(Date.now() / 200) * 2;
    ctx.fillStyle = C.textHi;
    ctx.fillRect(W - 18, H - 12 + bounce, 6, 6);
  }
}
