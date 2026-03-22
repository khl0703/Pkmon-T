import { C, H, TYPE_COLOR, TYPE_EN, W } from "../core/constants.js";
import { ck, ckDir } from "../core/input.js";
import { ctx, drawEXPBar, drawHPBar, drawPokemonSprite, drawText, drawWin } from "../core/renderer.js";
import { battleState, fadeState, GS, partyState, PD, setBattleState, setScreen, startFade } from "../core/state.js";
import { t } from "../data/i18n.js";
import { ENCOUNTERS, calcStat, createPokemon, getPkDisplayName, getTypeEff, MOVES, moveName, POKEDEX } from "../data/pokedex.js";
import { weightedPick } from "../core/utils.js";

export function startWildBattle(encounterTableId) {
  const table = ENCOUNTERS[encounterTableId];
  const leadPokemon = PD.party.find((pokemon) => pokemon.curHP > 0);
  if (!table || PD.party.length === 0 || !leadPokemon) {
    return;
  }

  const chosen = weightedPick(table, Math.random() * 100);
  const level = chosen.minLv + Math.floor(Math.random() * (chosen.maxLv - chosen.minLv + 1));
  const wild = createPokemon(chosen.id, level);

  if (!PD.pokedex.seen.includes(chosen.id)) {
    PD.pokedex.seen.push(chosen.id);
  }

  setBattleState({
    type: "wild",
    enemy: wild,
    playerPk: leadPokemon,
    phase: "intro",
    sel: 0,
    moveSel: 0,
    msg: [t("bat.wild", { name: getPkDisplayName(wild) }), t("bat.go", { name: getPkDisplayName(leadPokemon) })],
    msgIdx: 0,
    msgCharIdx: 0,
    msgTyping: true,
    turn: 0,
    animTimer: 0,
    playerAnim: { x: 0, shake: 0 },
    enemyAnim: { x: 0, shake: 0, alpha: 1 },
    catchAnim: { phase: 0, shakes: 0, timer: 0 },
    runAttempts: 0,
  });

  startFade(1, () => {
    setScreen("battle");
  }, 0.08);
}

export function updateBattle() {
  if (fadeState.active || !battleState.enemy) {
    return;
  }

  if (battleState.msg.length > 0 && battleState.msgIdx < battleState.msg.length) {
    battleState.msgCharIdx += [0.5, 1, 2][GS.textSpd];
    const currentMessage = battleState.msg[battleState.msgIdx];
    if (battleState.msgCharIdx >= currentMessage.length) {
      battleState.msgCharIdx = currentMessage.length;
      battleState.msgTyping = false;
    }

    if (ck("x") || ck("X")) {
      if (battleState.msgTyping) {
        battleState.msgCharIdx = currentMessage.length;
        battleState.msgTyping = false;
      } else {
        advanceBattleMessage();
      }
    }
    return;
  }

  if (battleState.phase === "menu") {
    const dir = ckDir();
    if (dir === "up" || dir === "down") battleState.sel ^= 2;
    if (dir === "left" || dir === "right") battleState.sel ^= 1;

    if (ck("x") || ck("X")) {
      if (battleState.sel === 0) {
        battleState.phase = "fight";
        battleState.moveSel = 0;
      }
      if (battleState.sel === 1) tryUsePokeball();
      if (battleState.sel === 2) {
        setScreen("party");
        partyState.sel = 0;
        partyState.fromBattle = true;
      }
      if (battleState.sel === 3) tryRun();
    }
    return;
  }

  if (battleState.phase === "fight") {
    const dir = ckDir();
    const moveCount = battleState.playerPk.moves.length;
    if (dir === "up" || dir === "down") battleState.moveSel = (battleState.moveSel ^ 2) % moveCount;
    if (dir === "left" || dir === "right") {
      const nextSel = battleState.moveSel ^ 1;
      if (nextSel < moveCount) {
        battleState.moveSel = nextSel;
      }
    }

    if (ck("z") || ck("Z")) {
      battleState.phase = "menu";
      return;
    }

    if (ck("x") || ck("X")) {
      const move = battleState.playerPk.moves[battleState.moveSel];
      if (move && move.pp > 0) {
        executeTurn(move.name);
      }
    }
  }
}

function advanceBattleMessage() {
  battleState.msgIdx += 1;
  battleState.msgCharIdx = 0;
  battleState.msgTyping = true;

  if (battleState.msgIdx < battleState.msg.length) {
    return;
  }

  if (battleState.phase === "intro") battleState.phase = "menu";
  if (battleState.phase === "ranaway" || battleState.phase === "caught") {
    endBattle(true);
    return;
  }

  if (battleState.phase === "result") {
    if (battleState.enemy.curHP <= 0) {
      endBattle(true);
      return;
    }

    if (battleState.playerPk.curHP <= 0) {
      const nextPokemon = PD.party.find((pokemon) => pokemon.curHP > 0);
      if (nextPokemon) {
        battleState.playerPk = nextPokemon;
        battleState.msg = [t("bat.go", { name: getPkDisplayName(nextPokemon) })];
        battleState.msgIdx = 0;
        battleState.msgCharIdx = 0;
        battleState.msgTyping = true;
        battleState.phase = "intro";
      } else {
        endBattle(false);
      }
      return;
    }

    battleState.phase = "menu";
  }
}

export function executeTurn(playerMove) {
  const player = battleState.playerPk;
  const enemy = battleState.enemy;
  const playerMoveData = MOVES[playerMove];
  const enemyMoves = enemy.moves.filter((move) => move.pp > 0);
  const enemyMoveName = enemyMoves.length > 0 ? enemyMoves[Math.floor(Math.random() * enemyMoves.length)].name : "몸통박치기";
  const enemyMoveData = MOVES[enemyMoveName];

  battleState.msg = [];
  battleState.msgIdx = 0;
  battleState.msgCharIdx = 0;
  battleState.msgTyping = true;

  const playerPriority = playerMoveData?.priority || 0;
  const enemyPriority = enemyMoveData?.priority || 0;
  const playerFirst = playerPriority > enemyPriority || (playerPriority === enemyPriority && player.stats.spe >= enemy.stats.spe);

  const first = playerFirst ? { pk: player, move: playerMove, md: playerMoveData } : { pk: enemy, move: enemyMoveName, md: enemyMoveData };
  const second = playerFirst ? { pk: enemy, move: enemyMoveName, md: enemyMoveData } : { pk: player, move: playerMove, md: playerMoveData };

  const playerMoveIndex = player.moves.findIndex((move) => move.name === playerMove);
  if (playerMoveIndex >= 0) player.moves[playerMoveIndex].pp -= 1;
  const enemyMoveIndex = enemy.moves.findIndex((move) => move.name === enemyMoveName);
  if (enemyMoveIndex >= 0) enemy.moves[enemyMoveIndex].pp -= 1;

  executeMove(first, playerFirst ? enemy : player);

  const secondTarget = playerFirst ? player : enemy;
  if (second.pk.curHP > 0 && secondTarget.curHP > 0) {
    executeMove(second, secondTarget);
  }

  if (enemy.curHP <= 0) {
    battleState.msg.push(t("bat.fainted", { name: getPkDisplayName(enemy) }));
    const expGain = Math.floor((enemy.stats.hp * POKEDEX[enemy.id].bexp) / 7);
    battleState.msg.push(t("bat.exp", { name: getPkDisplayName(player), exp: expGain }));
    player.exp += expGain;

    while (player.exp >= player.expNext && player.level < 100) {
      player.level += 1;
      const data = POKEDEX[player.id];
      const oldMaxHP = player.stats.hp;
      player.stats.hp = calcStat(data.bs.hp, player.level, player.iv.hp, true);
      player.stats.atk = calcStat(data.bs.atk, player.level, player.iv.atk);
      player.stats.def = calcStat(data.bs.def, player.level, player.iv.def);
      player.stats.spa = calcStat(data.bs.spa, player.level, player.iv.spa);
      player.stats.spd = calcStat(data.bs.spd, player.level, player.iv.spd);
      player.stats.spe = calcStat(data.bs.spe, player.level, player.iv.spe);
      player.curHP = Math.min(player.stats.hp, player.curHP + (player.stats.hp - oldMaxHP));
      player.exp -= player.expNext;
      player.expNext = Math.pow(player.level + 1, 3) - Math.pow(player.level, 3);
      battleState.msg.push(t("bat.levelup", { name: getPkDisplayName(player), lv: player.level }));

      const newMoves = data.moves.filter((move) => move.l === player.level);
      for (const move of newMoves) {
        if (player.moves.length < 4) {
          player.moves.push({ name: move.m, pp: MOVES[move.m]?.pp || 10, maxPP: MOVES[move.m]?.pp || 10 });
          battleState.msg.push(GS.lang === "ko" ? `${getPkDisplayName(player)}(은)는 ${moveName(move.m)}(을)를 배웠다!` : `${getPkDisplayName(player)} learned ${moveName(move.m)}!`);
        }
      }
    }

    battleState.phase = "result";
    return;
  }

  if (player.curHP <= 0) {
    battleState.msg.push(t("bat.fainted", { name: getPkDisplayName(player) }));
  }

  battleState.phase = "result";
}

function executeMove(attacker, defender) {
  battleState.msg.push(t("bat.used", { name: getPkDisplayName(attacker.pk), move: moveName(attacker.move) }));
  const moveData = attacker.md;
  if (!moveData) {
    return;
  }

  if (moveData.cat === "변화") {
    return;
  }

  if (Math.random() * 100 > (moveData.acc || 100)) {
    battleState.msg.push(GS.lang === "ko" ? "빗나갔다!" : "It missed!");
    return;
  }

  const level = attacker.pk.level;
  const power = moveData.pow;
  const attack = moveData.cat === "물리" ? attacker.pk.stats.atk : attacker.pk.stats.spa;
  const defense = moveData.cat === "물리" ? defender.stats.def : defender.stats.spd;
  const base = Math.floor(((2 * level / 5 + 2) * power * attack / defense) / 50) + 2;
  const stab = attacker.pk.types.includes(moveData.type) ? 1.5 : 1;
  const effectiveness = getTypeEff(moveData.type, defender.types);
  const critical = Math.random() < 0.0625 ? 1.5 : 1;
  const randomFactor = 0.85 + Math.random() * 0.15;
  const damage = Math.max(1, Math.floor(base * stab * effectiveness * critical * randomFactor));

  defender.curHP = Math.max(0, defender.curHP - damage);

  if (effectiveness > 1) battleState.msg.push(t("bat.effective"));
  if (effectiveness > 0 && effectiveness < 1) battleState.msg.push(t("bat.noteffective"));
  if (effectiveness === 0) battleState.msg.push(t("bat.noeffect", { name: getPkDisplayName(defender) }));
  if (critical > 1) battleState.msg.push(GS.lang === "ko" ? "급소에 맞았다!" : "A critical hit!");
}

export function tryRun() {
  battleState.runAttempts += 1;
  const playerSpeed = battleState.playerPk.stats.spe;
  const enemySpeed = battleState.enemy.stats.spe;
  const chance = Math.floor((playerSpeed * 128 / Math.max(1, enemySpeed)) + 30 * battleState.runAttempts) % 256;

  if (Math.random() * 256 < chance || battleState.type === "wild") {
    battleState.msg = [t("bat.ranaway")];
    battleState.phase = "ranaway";
  } else {
    battleState.msg = [t("bat.cantrun")];
    battleState.phase = "result";
  }

  battleState.msgIdx = 0;
  battleState.msgCharIdx = 0;
  battleState.msgTyping = true;
}

export function tryUsePokeball() {
  if (battleState.type !== "wild") {
    return;
  }

  const ballItem = PD.bag.pokeballs.find((ball) => ball.qty > 0);
  if (!ballItem) {
    battleState.msg = [GS.lang === "ko" ? "포켓볼이 없다!" : "No POKé BALLs!"];
    battleState.msgIdx = 0;
    battleState.msgCharIdx = 0;
    battleState.msgTyping = true;
    battleState.phase = "result";
    return;
  }

  ballItem.qty -= 1;
  const enemy = battleState.enemy;
  const catchRate = POKEDEX[enemy.id]?.cr || 45;
  const ballBonus = ballItem.id === "greatball" ? 1.5 : 1;
  const statusBonus = enemy.status === "sleep" || enemy.status === "freeze" ? 2.5 : enemy.status ? 1.5 : 1;
  const a = Math.floor((3 * enemy.stats.hp - 2 * enemy.curHP) * catchRate * ballBonus / (3 * enemy.stats.hp) * statusBonus);
  const b = Math.floor(65536 / Math.sqrt(Math.sqrt(255 * 3 / Math.max(1, a))));

  let shakes = 0;
  for (let i = 0; i < 4; i += 1) {
    if (Math.random() * 65536 < b) shakes += 1;
    else break;
  }

  battleState.msg = [t("bat.catch.throw", { name: t(`item.${ballItem.id}`) })];
  for (let i = 0; i < Math.min(shakes, 3); i += 1) {
    battleState.msg.push("...");
  }

  if (shakes >= 4) {
    battleState.msg.push(t("bat.catch.success", { name: getPkDisplayName(enemy) }));
    if (PD.party.length < 6) PD.party.push(enemy);
    else PD.pc.push(enemy);
    if (!PD.pokedex.caught.includes(enemy.id)) PD.pokedex.caught.push(enemy.id);
    battleState.phase = "caught";
  } else {
    battleState.msg.push(t("bat.catch.fail"));
    const enemyMoves = enemy.moves.filter((move) => move.pp > 0);
    if (enemyMoves.length > 0) {
      const enemyMove = enemyMoves[Math.floor(Math.random() * enemyMoves.length)];
      executeMove({ pk: enemy, move: enemyMove.name, md: MOVES[enemyMove.name] }, battleState.playerPk);
    }
    battleState.phase = "result";
  }

  battleState.msgIdx = 0;
  battleState.msgCharIdx = 0;
  battleState.msgTyping = true;
}

export function endBattle() {
  startFade(1, () => {
    setScreen("field");
  });
}

export function renderBattle() {
  if (!battleState.enemy) {
    return;
  }
  const panelHeight = 96;
  const panelY = H - panelHeight;
  const enemyBox = { x: 20, y: 20, w: 172, h: 52 };
  const playerBox = { x: W - 214, y: 234, w: 194, h: 76 };
  const enemySprite = { x: Math.floor(W * 0.6), y: 70, size: 88 };
  const playerSprite = { x: 80, y: 186, size: 108 };

  ctx.fillStyle = C.white;
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = "#d8e4d0";
  ctx.fillRect(0, 110, W, 120);
  ctx.fillStyle = "#b8d0a8";
  ctx.fillRect(0, 150, W, 90);

  if (battleState.enemy.curHP > 0) {
    drawPokemonSprite(enemySprite.x, enemySprite.y, battleState.enemy.id, enemySprite.size);
  }

  if (battleState.playerPk.curHP > 0) {
    drawPokemonSprite(playerSprite.x, playerSprite.y, battleState.playerPk.id, playerSprite.size, true);
  }

  drawWin(enemyBox.x, enemyBox.y, enemyBox.w, enemyBox.h);
  drawText(getPkDisplayName(battleState.enemy), enemyBox.x + 10, enemyBox.y + 17, GS.lang === "ko" ? 11 : 7, C.text);
  drawText(`Lv.${battleState.enemy.level}`, enemyBox.x + enemyBox.w - 52, enemyBox.y + 17, 7, C.text, "Press Start 2P");
  drawHPBar(enemyBox.x + 10, enemyBox.y + 30, enemyBox.w - 24, battleState.enemy.curHP, battleState.enemy.stats.hp);

  drawWin(playerBox.x, playerBox.y, playerBox.w, playerBox.h);
  drawText(getPkDisplayName(battleState.playerPk), playerBox.x + 10, playerBox.y + 17, GS.lang === "ko" ? 11 : 7, C.text);
  drawText(`Lv.${battleState.playerPk.level}`, playerBox.x + playerBox.w - 52, playerBox.y + 17, 7, C.text, "Press Start 2P");
  drawHPBar(playerBox.x + 10, playerBox.y + 30, playerBox.w - 24, battleState.playerPk.curHP, battleState.playerPk.stats.hp);
  drawText(`HP:${battleState.playerPk.curHP}/${battleState.playerPk.stats.hp}`, playerBox.x + 10, playerBox.y + 48, 7, C.text, "Press Start 2P");
  drawEXPBar(playerBox.x + 10, playerBox.y + 58, playerBox.w - 24, battleState.playerPk.exp, battleState.playerPk.expNext);

  if (battleState.phase === "menu") {
    ctx.fillStyle = "#282828";
    ctx.fillRect(0, panelY, W / 2, panelHeight);
    ctx.fillStyle = "#383838";
    ctx.fillRect(2, panelY + 2, W / 2 - 4, panelHeight - 4);
    drawWin(W / 2, panelY, W / 2, panelHeight);

    const commands = ["bat.fight", "bat.bag", "bat.pokemon", "bat.run"];
    for (let i = 0; i < 4; i += 1) {
      const x = W / 2 + 28 + (i % 2) * 118;
      const y = panelY + 24 + Math.floor(i / 2) * 34;
      if (i === battleState.sel) {
        const bounce = Math.sin(Date.now() / 150) * 1;
        drawText("▶", x - 8 + bounce, y + 10, 8, C.pokered);
      }
      drawText(t(commands[i]), x, y + 10, GS.lang === "ko" ? 10 : 7, i === battleState.sel ? C.text : C.textDis);
    }
    return;
  }

  if (battleState.phase === "fight") {
    drawWin(0, panelY, W, panelHeight);
    for (let i = 0; i < battleState.playerPk.moves.length; i += 1) {
      const move = battleState.playerPk.moves[i];
      const moveData = MOVES[move.name];
      const x = 26 + (i % 2) * Math.floor(W / 2);
      const y = panelY + 22 + Math.floor(i / 2) * 34;

      if (i === battleState.moveSel) {
        const bounce = Math.sin(Date.now() / 150) * 1;
        drawText("▶", x - 8 + bounce, y + 10, 8, C.pokered);
        if (moveData) {
          ctx.fillStyle = TYPE_COLOR[moveData.type] || "#a8a878";
          ctx.fillRect(x + 120, y + 1, 54, 14);
          drawText(GS.lang === "ko" ? moveData.type : TYPE_EN[moveData.type], x + 124, y + 11, 6, C.white, "Press Start 2P");
        }
      }

      drawText(moveName(move.name), x, y + 10, GS.lang === "ko" ? 10 : 7, i === battleState.moveSel ? C.text : C.textDis);
      drawText(`${move.pp}/${move.maxPP}`, x + 78, y + 10, 6, C.hint, "Press Start 2P");
    }
    return;
  }

  ctx.fillStyle = "#282828";
  ctx.fillRect(0, panelY, W, panelHeight);
  ctx.fillStyle = "#383838";
  ctx.fillRect(2, panelY + 2, W - 4, panelHeight - 4);

  if (battleState.msgIdx < battleState.msg.length) {
    const shown = battleState.msg[battleState.msgIdx].substring(0, Math.floor(battleState.msgCharIdx));
    drawText(shown, 16, panelY + 34, GS.lang === "ko" ? 13 : 8, C.white);
    if (!battleState.msgTyping) {
      const bounce = Math.sin(Date.now() / 200) * 2;
      ctx.fillStyle = C.white;
      ctx.fillRect(W - 22, panelY + panelHeight - 18 + bounce, 8, 8);
    }
  }
}
