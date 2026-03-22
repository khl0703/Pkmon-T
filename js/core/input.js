// Keyboard input is kept small and explicit to match the original game.
export const keys = {};
export const kp = {};

function markKey(name, value) {
  if (!name) {
    return;
  }
  keys[name] = value;
  if (value) {
    kp[name] = true;
  }
}

function setKeyState(event, value) {
  markKey(event.key, value);

  // Use physical key codes too so controls still work when the user
  // is typing with a Korean IME or another keyboard layout.
  if (event.code === "KeyX") markKey("x", value);
  if (event.code === "KeyZ") markKey("z", value);
  if (event.code === "KeyS") markKey("s", value);
  if (event.code === "KeyA") markKey("a", value);
  if (event.code === "KeyQ") markKey("q", value);
  if (event.code === "KeyW") markKey("w", value);
  if (event.code === "Enter") markKey("Enter", value);
  if (event.code === "ShiftLeft" || event.code === "ShiftRight") markKey("Shift", value);
}

export function initInput() {
  document.addEventListener("keydown", (event) => {
    setKeyState(event, true);
    event.preventDefault();
  });

  document.addEventListener("keyup", (event) => {
    setKeyState(event, false);
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
