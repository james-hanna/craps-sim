import * as THREE from 'three';
import { player, gameState } from '../state/player';
import { displayMessage } from '../ui/message';
import { updateBalanceDisplay } from '../ui/balance';

let betChips = [];

export function placeBet(amount, playerX, throwZ, scene) {
  if (!gameState.canBet) {
    displayMessage('Bets are locked until the round is over.');
    return;
  }

  if (!player.balance || player.balance < amount) return;
  player.balance -= amount;
  player.lineBet += amount;
  updateBalanceDisplay();
  updateChipDisplay(playerX, throwZ, scene);
}

export function placeComeBet(amount) {
  if (gameState.phase !== 'point') {
    displayMessage('Come bets only allowed after the point is set.');
    return;
  }
  if (player.balance < amount) return;
  player.balance -= amount;
  player.comeBets.push({ amount, point: null, odds: 0 });
  updateBalanceDisplay();
}

export function placeDontPass(amount) {
  if (gameState.phase !== 'comeOut') {
    displayMessage("Don't Pass only on come out.");
    return;
  }
  if (player.balance < amount) return;
  player.balance -= amount;
  player.dontPass += amount;
  updateBalanceDisplay();
}

export function placeDontCome(amount) {
  if (gameState.phase !== 'point') {
    displayMessage("Don't Come only after point is set.");
    return;
  }
  if (player.balance < amount) return;
  player.balance -= amount;
  player.dontComeBets.push({ amount, point: null, odds: 0 });
  updateBalanceDisplay();
}

export function placeFieldBet(amount) {
  if (player.balance < amount) return;
  player.balance -= amount;
  player.fieldBet += amount;
  updateBalanceDisplay();
}

export function placeOdds(type, point, amount) {
  if (player.balance < amount) return;
  if (type === 'line') {
    if (gameState.phase !== 'point') {
      displayMessage('Pass line odds only after a point.');
      return;
    }
    player.balance -= amount;
    player.lineOdds += amount;
  } else if (type === 'come') {
    const bet = player.comeBets.find(b => b.point === point);
    if (!bet) return;
    player.balance -= amount;
    bet.odds = (bet.odds || 0) + amount;
  } else if (type === 'dontCome') {
    const bet = player.dontComeBets.find(b => b.point === point);
    if (!bet) return;
    player.balance -= amount;
    bet.odds = (bet.odds || 0) + amount;
  }
  updateBalanceDisplay();
}

export function placeHardway(number, amount) {
  if (![4,6,8,10].includes(number)) return;
  if (player.balance < amount) return;
  player.balance -= amount;
  player.hardways[number] += amount;
  updateBalanceDisplay();
}

export function updateChipDisplay(playerX, throwZ, scene) {
  clearChips();
  const chips = consolidateChips(player.lineBet);
  const maxChipsPerStack = 20;
  let stackCount = 0;
  let chipIndex = 0;

  chips.forEach((value) => {
    if (chipIndex >= maxChipsPerStack) {
      stackCount++;
      chipIndex = 0;
    }
    const chip = createChipMesh(value, playerX, stackCount, chipIndex, throwZ);
    scene.add(chip);
    betChips.push(chip);
    chipIndex++;
  });
}

export function clearChips() {
  betChips.forEach(c => {
    if (c.parent) c.parent.remove(c);
  });
  betChips = [];
}

function consolidateChips(totalAmount) {
  const chipValues = [1000, 500, 100, 25, 5, 1];
  const result = [];
  for (let val of chipValues) {
    while (totalAmount >= val) {
      result.push(val);
      totalAmount -= val;
    }
  }
  return result;
}

function createChipMesh(amount, x, stackIndex, chipIndex, throwZ) {
  const chipHeight = 0.4;
  const geometry = new THREE.CylinderGeometry(0.5, 0.5, chipHeight, 32);
  const colorMap = {
    1: 0xffffff,
    5: 0xff0000,
    25: 0x00ff00,
    100: 0x111111,
    500: 0x800080,
    1000: 0xffff00
  };
  const material = new THREE.MeshStandardMaterial({ color: colorMap[amount] || 0xffffff });
  const chip = new THREE.Mesh(geometry, material);
  const spacing = 1.2;
  chip.position.set(
    x + stackIndex * spacing,
    chipHeight / 2 + chipIndex * (chipHeight + 0.01),
    throwZ - 3
  );
  return chip;
}
