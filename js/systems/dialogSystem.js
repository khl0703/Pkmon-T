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
  const boxHeight = 78;
  const boxY = H - boxHeight - 8;

  drawWin(8, boxY, W - 16, boxHeight);
  drawWrappedDialogText(shown, 20, boxY + 22, W - 44, GS.lang === "ko" ? 12 : 8, C.text);

  if (!dialogState.typing) {
    const bounce = Math.sin(Date.now() / 200) * 2;
    ctx.fillStyle = C.textHi;
    ctx.fillRect(W - 24, H - 20 + bounce, 8, 8);
  }
}

function drawWrappedDialogText(text, x, y, maxWidth, size, color) {
  const font = GS.lang === "ko" ? "DotGothic16" : "Press Start 2P";
  const tokens = GS.lang === "ko" ? text.split("") : text.split(" ");
  let line = "";
  let lineY = y;

  ctx.font = `${size}px "${font}"`;
  ctx.fillStyle = color;

  for (let i = 0; i < tokens.length; i += 1) {
    const token = GS.lang === "ko" ? tokens[i] : `${tokens[i]} `;
    const testLine = line + token;
    if (ctx.measureText(testLine).width > maxWidth && line) {
      ctx.fillText(line, x, lineY);
      line = token;
      lineY += size + 6;
    } else {
      line = testLine;
    }
  }

  if (line) {
    ctx.fillText(line, x, lineY);
  }
}
