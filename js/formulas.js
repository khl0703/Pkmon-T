export function clampLevel(level) {
  return Math.max(1, Math.min(100, Math.floor(level)));
}

export function getGrowthRateExp(rateId, level) {
  const n = clampLevel(level);

  switch (rateId) {
    case "fast":
      return Math.floor((4 * Math.pow(n, 3)) / 5);
    case "medium-fast":
      return Math.floor(Math.pow(n, 3));
    case "medium-slow":
      return Math.floor((6 * Math.pow(n, 3)) / 5 - 15 * Math.pow(n, 2) + 100 * n - 140);
    case "slow":
      return Math.floor((5 * Math.pow(n, 3)) / 4);
    case "erratic":
      if (n <= 50) return Math.floor((Math.pow(n, 3) * (100 - n)) / 50);
      if (n <= 68) return Math.floor((Math.pow(n, 3) * (150 - n)) / 100);
      if (n <= 98) return Math.floor((Math.pow(n, 3) * Math.floor((1911 - 10 * n) / 3)) / 500);
      return Math.floor((Math.pow(n, 3) * (160 - n)) / 100);
    case "fluctuating":
      if (n <= 15) return Math.floor(Math.pow(n, 3) * (((n + 1) / 3) + 24) / 50);
      if (n <= 36) return Math.floor(Math.pow(n, 3) * (n + 14) / 50);
      return Math.floor(Math.pow(n, 3) * ((n / 2) + 32) / 50);
    default:
      return Math.floor(Math.pow(n, 3));
  }
}

export function getExpToNextLevel(rateId, level) {
  const current = clampLevel(level);
  if (current >= 100) {
    return 0;
  }
  return getGrowthRateExp(rateId, current + 1) - getGrowthRateExp(rateId, current);
}

export function calculateCatchValue({
  maxHp,
  currentHp,
  captureRate,
  ballBonus = 1,
  statusBonus = 1,
}) {
  if (maxHp <= 0) {
    return 0;
  }

  return Math.floor(((3 * maxHp - 2 * currentHp) * captureRate * ballBonus * statusBonus) / (3 * maxHp));
}

export function calculateShakeThreshold(catchValue) {
  if (catchValue <= 0) {
    return 0;
  }

  if (catchValue >= 255) {
    return 65535;
  }

  return Math.floor(65536 / Math.sqrt(Math.sqrt((255 * 3) / catchValue)));
}

export function calculateCaptureShakes(params) {
  const threshold = calculateShakeThreshold(calculateCatchValue(params));
  if (threshold >= 65535) {
    return 4;
  }

  let shakes = 0;
  for (let i = 0; i < 4; i += 1) {
    if (Math.random() * 65536 < threshold) {
      shakes += 1;
    } else {
      break;
    }
  }
  return shakes;
}

export function calculateBattleExp({
  baseExperience,
  targetLevel,
  recipientLevel = targetLevel,
  battleType = "wild",
  participants = 1,
  scaled = true,
}) {
  const battleBonus = battleType === "trainer" ? 1.5 : 1;
  const split = Math.max(1, participants);

  if (!scaled) {
    return Math.floor((battleBonus * baseExperience * targetLevel) / (7 * split));
  }

  const numerator = Math.pow(2 * targetLevel + 10, 2.5);
  const denominator = Math.pow(targetLevel + recipientLevel + 10, 2.5);
  return Math.floor((battleBonus * baseExperience * targetLevel * numerator) / (5 * split * denominator) + 1);
}
