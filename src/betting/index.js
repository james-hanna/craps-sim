import * as THREE from 'three';
import { player, gameState } from '../state/player';
import { displayMessage } from '../ui/message';
import { updateBalanceDisplay } from '../ui/balance';

let betChips = [];
let sceneRef = null;
let slots = {};

export function initBetting(scene, chipSlots) {
  sceneRef = scene;
  slots = chipSlots;
}

export function placeBet(amount) {
  if (!gameState.canBet) {
    displayMessage('Bets are locked until the round is over.');
    return;
  }

  if (!player.balance || player.balance < amount) return;
  player.balance -= amount;
  player.lineBet += amount;
  updateBalanceDisplay();
  updateAllBetChips();
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
  updateAllBetChips();
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
  updateAllBetChips();
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
  updateAllBetChips();
}

export function placeFieldBet(amount) {
  if (player.balance < amount) return;
  player.balance -= amount;
  player.fieldBet += amount;
=======
export function placeBet(amount, playerX, throwZ, scene) {
  if (!gameState.canBet) {
    displayMessage('Bets are locked until the round is over.');
    return;
  }

  if (!player.balance || player.balance < amount) return;
  player.balance -= amount;
  player.lineBet += amount;

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
  updateAllBetChips();
}

export function placeHardway(number, amount) {
  if (![4,6,8,10].includes(number)) return;
  if (player.balance < amount) return;
  player.balance -= amount;
  player.hardways[number] += amount;
  updateBalanceDisplay();
  updateAllBetChips();
}

export function updateAllBetChips() {
  if (!sceneRef) return;
  clearChips();

  if (player.lineBet > 0 && slots.passLine) {
    addChips(player.lineBet, slots.passLine);
  }
  if (player.lineOdds > 0 && slots.lineOdds) {
    addChips(player.lineOdds, slots.lineOdds);
  }
  if (player.dontPass > 0 && slots.dontPass) {
    addChips(player.dontPass, slots.dontPass);
  }
  if (player.fieldBet > 0 && slots.field) {
    addChips(player.fieldBet, slots.field);
  }
  player.comeBets.forEach(b => {
    const total = b.amount + (b.odds || 0);
    if (total > 0 && slots.come) addChips(total, slots.come);
  });
  player.dontComeBets.forEach(b => {
    const total = b.amount + (b.odds || 0);
    if (total > 0 && slots.dontCome) addChips(total, slots.dontCome);
  });
  Object.entries(player.hardways).forEach(([n, amt]) => {
    if (amt > 0 && slots[`hard${n}`]) {
      addChips(amt, slots[`hard${n}`]);
    }
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

function createChipMesh(amount) {
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
  return new THREE.Mesh(geometry, material);
}

function addChips(amount, pos) {
  const chips = consolidateChips(amount);
  const chipHeight = 0.4;
  chips.forEach((value, idx) => {
    const chip = createChipMesh(value);
    chip.position.set(pos.x, chipHeight / 2 + idx * (chipHeight + 0.01), pos.z);
    sceneRef.add(chip);
    betChips.push(chip);
  });
}
