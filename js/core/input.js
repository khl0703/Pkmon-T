// Keyboard input is kept small and explicit to match the original game.
export const keys = {};
export const kp = {};

export function initInput() {
  document.addEventListener("keydown", (event) => {
    keys[event.key] = true;
    kp[event.key] = true;
    event.preventDefault();
  });

  document.addEventListener("keyup", (event) => {
    keys[event.key] = false;
  });
}

export function ck(key) {
  if (!kp[key]) {
    return false;
  }

  kp[key] = false;
  return true;
}

export function ckAny() {
  const pressed = Object.keys(kp).some((key) => kp[key]);
  if (pressed) {
    for (const key in kp) {
      kp[key] = false;
    }
  }
  return pressed;
}

export function ckDir() {
  if (ck("ArrowUp")) return "up";
  if (ck("ArrowDown")) return "down";
  if (ck("ArrowLeft")) return "left";
  if (ck("ArrowRight")) return "right";
  return null;
}
