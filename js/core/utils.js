export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export function weightedPick(entries, roll) {
  let total = 0;
  for (const entry of entries) {
    total += entry.rate;
    if (roll < total) {
      return entry;
    }
  }
  return entries[0];
}
