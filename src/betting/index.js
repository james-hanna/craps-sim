import * as THREE from 'three';
import { player, gameState } from '../state/player';
import { displayMessage } from '../ui/message';

let betChips = [];

export function placeBet(amount, playerX, throwZ, scene, updateBalanceDisplay) {
  if (!gameState.canBet) {
    displayMessage('Bets are locked until the round is over.');
    return;
  }

  if (!player.balance || player.balance < amount) return;
  player.balance -= amount;
  player.currentBet += amount;
  updateBalanceDisplay();
  updateChipDisplay(playerX, throwZ, scene);
}

export function updateChipDisplay(playerX, throwZ, scene) {
  clearChips();
  const chips = consolidateChips(player.currentBet);
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
