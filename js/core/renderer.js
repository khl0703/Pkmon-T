import { C, H, TILE, TYPE_COLOR, W } from "./constants.js";
import { fadeState, GS } from "./state.js";
import { POKEDEX } from "../data/pokedex.js";

export const cv = document.getElementById("gc");
export const ctx = cv.getContext("2d");
ctx.imageSmoothingEnabled = false;

export function beginFrame() {
  ctx.imageSmoothingEnabled = false;
  ctx.clearRect(0, 0, W, H);
}

export function drawWin(x, y, w, h) {
  ctx.fillStyle = C.winBrd;
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = C.winBg;
  ctx.fillRect(x + 2, y + 2, w - 4, h - 4);
  ctx.fillStyle = "#e8e8e0";
  ctx.fillRect(x + 2, y + 2, w - 4, 1);
  ctx.fillRect(x + 2, y + 2, 1, h - 4);
  ctx.fillStyle = "#c8c8b8";
  ctx.fillRect(x + w - 3, y + 3, 1, h - 5);
  ctx.fillRect(x + 3, y + h - 3, w - 5, 1);
}

export function drawText(txt, x, y, size, color = C.text, font) {
  const resolvedFont = font || (GS.lang === "ko" ? "DotGothic16" : "Press Start 2P");
  ctx.fillStyle = color;
  ctx.font = `${size}px "${resolvedFont}"`;
  ctx.fillText(txt, x, y);
}

export function drawTextCentered(txt, y, size, color = C.text) {
  const font = GS.lang === "ko" ? "DotGothic16" : "Press Start 2P";
  ctx.fillStyle = color;
  ctx.font = `${size}px "${font}"`;
  const metrics = ctx.measureText(txt);
  ctx.fillText(txt, (W - metrics.width) / 2, y);
}

export function drawHPBar(x, y, w, cur, max) {
  const ratio = Math.max(0, cur / max);
  const color = ratio > 0.5 ? C.hpGreen : ratio > 0.2 ? C.hpYellow : C.hpRed;
  ctx.fillStyle = "#383838";
  ctx.fillRect(x, y, w, 4);
  ctx.fillStyle = "#181818";
  ctx.fillRect(x + 1, y + 1, w - 2, 2);
  ctx.fillStyle = color;
  ctx.fillRect(x + 1, y + 1, Math.floor((w - 2) * ratio), 2);
}

export function drawEXPBar(x, y, w, cur, max) {
  const ratio = max > 0 ? Math.min(1, cur / max) : 0;
  ctx.fillStyle = "#383838";
  ctx.fillRect(x, y, w, 3);
  ctx.fillStyle = "#181818";
  ctx.fillRect(x + 1, y + 1, w - 2, 1);
  ctx.fillStyle = C.expBlue;
  ctx.fillRect(x + 1, y + 1, Math.floor((w - 2) * ratio), 1);
}

export function drawPokeball(x, y, size) {
  const radius = size / 2;
  ctx.fillStyle = C.pokered;
  ctx.beginPath();
  ctx.arc(x + radius, y + radius, radius, Math.PI, 0);
  ctx.fill();
  ctx.fillStyle = C.white;
  ctx.beginPath();
  ctx.arc(x + radius, y + radius, radius, 0, Math.PI);
  ctx.fill();
  ctx.fillStyle = C.black;
  ctx.fillRect(x, y + radius - 1, size, 2);
  ctx.beginPath();
  ctx.arc(x + radius, y + radius, radius, 0, Math.PI * 2);
  ctx.lineWidth = 1;
  ctx.strokeStyle = C.black;
  ctx.stroke();
  ctx.fillStyle = C.white;
  ctx.beginPath();
  ctx.arc(x + radius, y + radius, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + radius, y + radius, 3, 0, Math.PI * 2);
  ctx.stroke();
}

export function drawCharSprite(x, y, dir, frame, isPlayer, color) {
  const primaryColor = isPlayer ? "#3868b0" : color || "#c04040";
  const skin = "#f8c898";
  const hair = isPlayer ? "#483820" : "#282828";

  ctx.fillStyle = hair;
  ctx.fillRect(x + 4, y, 8, 4);
  ctx.fillStyle = skin;
  ctx.fillRect(x + 4, y + 4, 8, 6);
  ctx.fillStyle = C.black;

  if (dir === "down" || dir === undefined) {
    ctx.fillRect(x + 5, y + 6, 2, 2);
    ctx.fillRect(x + 9, y + 6, 2, 2);
  } else if (dir === "up") {
    ctx.fillStyle = hair;
    ctx.fillRect(x + 4, y + 4, 8, 3);
  } else if (dir === "left") {
    ctx.fillRect(x + 4, y + 6, 2, 2);
  } else {
    ctx.fillRect(x + 10, y + 6, 2, 2);
  }

  ctx.fillStyle = primaryColor;
  ctx.fillRect(x + 3, y + 10, 10, 10);

  const armOffset = frame % 2 === 1 ? 1 : 0;
  ctx.fillStyle = skin;
  ctx.fillRect(x + 1, y + 11 + armOffset, 2, 6);
  ctx.fillRect(x + 13, y + 11 - armOffset, 2, 6);

  ctx.fillStyle = "#384868";
  const legOffset = frame === 1 ? 2 : frame === 3 ? -2 : 0;
  ctx.fillRect(x + 4, y + 20, 3, 8 + legOffset);
  ctx.fillRect(x + 9, y + 20, 3, 8 - legOffset);

  ctx.fillStyle = "#a03030";
  ctx.fillRect(x + 3, y + 28 + legOffset, 4, 3);
  ctx.fillRect(x + 9, y + 28 - legOffset, 4, 3);
}

export function drawPokemonSprite(x, y, id, size = 32, isBack = false) {
  const data = POKEDEX[id];
  if (!data) {
    return;
  }

  const typeColor = TYPE_COLOR[data.types[0]] || "#a8a878";
  const centerX = x + size / 2;
  const centerY = y + size / 2;

  ctx.fillStyle = typeColor;
  ctx.beginPath();
  ctx.ellipse(centerX, centerY + 2, size * 0.35, size * 0.4, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.ellipse(centerX, centerY - size * 0.2, size * 0.25, size * 0.25, 0, 0, Math.PI * 2);
  ctx.fill();

  if (!isBack) {
    ctx.fillStyle = C.white;
    ctx.fillRect(centerX - size * 0.12, centerY - size * 0.25, size * 0.08, size * 0.08);
    ctx.fillRect(centerX + size * 0.05, centerY - size * 0.25, size * 0.08, size * 0.08);
    ctx.fillStyle = C.black;
    ctx.fillRect(centerX - size * 0.1, centerY - size * 0.23, size * 0.05, size * 0.05);
    ctx.fillRect(centerX + size * 0.07, centerY - size * 0.23, size * 0.05, size * 0.05);
  }

  if (data.types.includes("불꽃")) {
    ctx.fillStyle = "#f8a830";
    ctx.beginPath();
    ctx.ellipse(centerX + size * 0.3, centerY + size * 0.1, size * 0.08, size * 0.15, 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#f8d030";
    ctx.beginPath();
    ctx.ellipse(centerX + size * 0.32, centerY + size * 0.05, size * 0.04, size * 0.08, 0.3, 0, Math.PI * 2);
    ctx.fill();
  }

  if (data.types.includes("물")) {
    ctx.fillStyle = "#88c0f0";
    ctx.fillRect(centerX - size * 0.02, centerY + size * 0.3, size * 0.04, size * 0.06);
  }

  if (data.types.includes("풀")) {
    ctx.fillStyle = "#58c850";
    ctx.beginPath();
    ctx.ellipse(centerX, centerY - size * 0.4, size * 0.1, size * 0.06, -0.5, 0, Math.PI * 2);
    ctx.fill();
  }

  if (data.types.includes("전기")) {
    ctx.fillStyle = "#f8d030";
    ctx.fillRect(centerX + size * 0.2, centerY - size * 0.1, size * 0.05, size * 0.15);
  }

  if (data.types.includes("에스퍼")) {
    ctx.fillStyle = "rgba(248,88,136,0.3)";
    ctx.beginPath();
    ctx.arc(centerX, centerY - size * 0.15, size * 0.3, 0, Math.PI * 2);
    ctx.fill();
  }
}

export function drawTile(x, y, type) {
  const px = x * TILE;
  const py = y * TILE;

  switch (type) {
    case 0:
      ctx.fillStyle = C.floor;
      ctx.fillRect(px, py, TILE, TILE);
      ctx.fillStyle = "#d0c090";
      ctx.fillRect(px, py + TILE - 1, TILE, 1);
      break;
    case 1:
      ctx.fillStyle = C.wall;
      ctx.fillRect(px, py, TILE, TILE);
      ctx.fillStyle = "#605040";
      ctx.fillRect(px, py, TILE, 2);
      ctx.fillRect(px, py, 2, TILE);
      break;
    case 2:
      ctx.fillStyle = C.grassGreen;
      ctx.fillRect(px, py, TILE, TILE);
      ctx.fillStyle = C.grassDark;
      for (let i = 0; i < 4; i += 1) {
        const gx = px + 2 + i * 4;
        const gy = py + 4 + ((i * 3) % 5);
        ctx.fillRect(gx, gy, 1, 4);
        ctx.fillRect(gx + 1, gy + 1, 1, 3);
      }
      break;
    case 3:
      ctx.fillStyle = C.floor;
      ctx.fillRect(px, py, TILE, TILE);
      ctx.fillStyle = C.desk;
      ctx.fillRect(px + 1, py + 2, TILE - 2, TILE - 4);
      ctx.fillStyle = "#908060";
      ctx.fillRect(px + 1, py + 2, TILE - 2, 2);
      break;
    case 4:
      ctx.fillStyle = C.floor;
      ctx.fillRect(px, py, TILE, TILE);
      ctx.fillStyle = C.door;
      ctx.fillRect(px + 2, py, TILE - 4, TILE);
      ctx.fillStyle = "#a08050";
      ctx.fillRect(px + 3, py + 1, TILE - 6, TILE - 2);
      ctx.fillStyle = "#d0b060";
      ctx.fillRect(px + TILE - 5, py + 8, 2, 2);
      break;
    case 5:
      ctx.fillStyle = C.floor;
      ctx.fillRect(px, py, TILE, TILE);
      ctx.fillStyle = "#b0a080";
      for (let i = 0; i < 4; i += 1) {
        ctx.fillRect(px, py + i * 4, TILE - i * 3, 4);
      }
      break;
    case 6:
      ctx.fillStyle = C.floor;
      ctx.fillRect(px, py, TILE, TILE);
      break;
    case 7:
      ctx.fillStyle = C.bookshelf;
      ctx.fillRect(px, py, TILE, TILE);
      ctx.fillStyle = "#e04040";
      ctx.fillRect(px + 1, py + 1, 4, 6);
      ctx.fillStyle = "#4060c0";
      ctx.fillRect(px + 5, py + 1, 4, 6);
      ctx.fillStyle = "#40a040";
      ctx.fillRect(px + 9, py + 1, 4, 6);
      ctx.fillStyle = "#d0a020";
      ctx.fillRect(px + 1, py + 8, 5, 6);
      ctx.fillStyle = "#8040a0";
      ctx.fillRect(px + 6, py + 8, 5, 6);
      break;
    case 8:
      ctx.fillStyle = C.carpet;
      ctx.fillRect(px, py, TILE, TILE);
      ctx.fillStyle = "#c05858";
      ctx.fillRect(px + 1, py + 1, TILE - 2, TILE - 2);
      break;
    case 9:
      ctx.fillStyle = C.water;
      ctx.fillRect(px, py, TILE, TILE);
      ctx.fillStyle = "#60a0e0";
      ctx.fillRect(px + 2, py + 4, 8, 1);
      ctx.fillRect(px + 6, py + 10, 6, 1);
      break;
    default:
      ctx.fillStyle = C.black;
      ctx.fillRect(px, py, TILE, TILE);
  }
}

export function drawFade() {
  if (!fadeState.active && fadeState.alpha <= 0) {
    return;
  }

  ctx.fillStyle = `rgba(0,0,0,${fadeState.alpha})`;
  ctx.fillRect(0, 0, W, H);
}
