// Centralized image loading for sprite sheets.
// Runtime only uses local project files and falls back safely if an asset is missing.

const characterCache = new Map();

export function getCharacterSprite(spriteRef) {
  if (!spriteRef) {
    return null;
  }

  const cacheKey = String(spriteRef);
  if (!characterCache.has(cacheKey)) {
    characterCache.set(cacheKey, createCharacterEntry(cacheKey));
  }

  return characterCache.get(cacheKey);
}

function createCharacterEntry(spriteRef) {
  const entry = {
    ref: spriteRef,
    path: resolveCharacterSpritePath(spriteRef),
    image: null,
    status: "loading",
    loggedError: false,
  };

  const image = new Image();
  image.onload = () => {
    entry.status = "loaded";
    entry.image = image;
  };
  image.onerror = () => {
    entry.status = "error";
    if (!entry.loggedError) {
      entry.loggedError = true;
      console.warn(`Missing character sprite sheet: ${entry.path}`);
    }
  };
  image.src = entry.path;
  entry.image = image;
  return entry;
}

function resolveCharacterSpritePath(spriteRef) {
  if (spriteRef.includes("/") || spriteRef.endsWith(".png")) {
    return new URL(`../../${spriteRef}`, import.meta.url).href;
  }

  return new URL(`../../assets/characters/${spriteRef}.png`, import.meta.url).href;
}
