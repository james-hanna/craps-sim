import * as THREE from 'three';
import { Body, Cylinder, Vec3 } from 'cannon-es';
import { chipMaterial } from '../environment/setup.js';
import { player, gameState } from '../state/player';
import { displayMessage } from '../ui/message';
import { updateBalanceDisplay } from '../ui/balance';

let betChips = [];
let sceneRef = null;
let worldRef = null;
let slots = {};

export function initBetting(scene, chipSlots, world) {
  sceneRef = scene;
  slots = chipSlots;
  worldRef = world;
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
  updateBalanceDisplay();
  updateAllBetChips();
}

export function placeNumberBet(number, amount) {
  if (!gameState.point) {
    displayMessage('Place bets only after the point is set.');
    return;
  }
  if (![4,5,6,8,9,10].includes(number)) return;
  if (player.balance < amount) return;
  player.balance -= amount;
  player.placeBets[number] += amount;
  updateBalanceDisplay();
  updateAllBetChips();
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
  if (!sceneRef || !worldRef) return;
  clearChips();

  if (player.lineBet > 0 && slots.passLine) {
    addChips(player.lineBet, slots.passLine, { kind: 'passLine' });
  }
  if (player.lineOdds > 0 && slots.lineOdds) {
    addChips(player.lineOdds, slots.lineOdds, { kind: 'lineOdds' });
  }
  if (player.dontPass > 0 && slots.dontPass) {
    addChips(player.dontPass, slots.dontPass, { kind: 'dontPass' });
  }
  if (player.fieldBet > 0 && slots.field) {
    addChips(player.fieldBet, slots.field, { kind: 'field' });
  }
  player.comeBets.forEach(b => {
    const total = b.amount + (b.odds || 0);
    const key = b.point ? `come${b.point}` : 'come';
    if (total > 0 && slots[key]) addChips(total, slots[key], { kind: 'come', bet: b });
  });
  Object.entries(player.placeBets).forEach(([n, amt]) => {
    if (amt > 0 && slots[`place${n}`]) {
      addChips(amt, slots[`place${n}`], { kind: 'place', point: Number(n) });
    }
  });
  player.dontComeBets.forEach(b => {
    const total = b.amount + (b.odds || 0);
    const key = b.point ? `dontCome${b.point}` : 'dontCome';
    if (total > 0 && slots[key]) addChips(total, slots[key], { kind: 'dontCome', bet: b });
  });
  Object.entries(player.hardways).forEach(([n, amt]) => {
    if (amt > 0 && slots[`hard${n}`]) {
      addChips(amt, slots[`hard${n}`], { kind: 'hardway', point: Number(n) });
    }
  });
}

export function clearChips() {
  betChips.forEach(c => {
    if (c.mesh.parent) c.mesh.parent.remove(c.mesh);
    if (worldRef && c.body) worldRef.removeBody(c.body);
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
  const chipHeight = 0.3;
  const radius = 0.65;
  const geometry = new THREE.CylinderGeometry(radius, radius, chipHeight, 32);
  const colorMap = {
    1: 0xffffff,
    5: 0xff0000,
    25: 0x00ff00,
    100: 0x111111,
    500: 0x800080,
    1000: 0xffff00
  };
  const material = new THREE.MeshStandardMaterial({ color: colorMap[amount] || 0xffffff });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.castShadow = true;
  return mesh;
}

function addChips(amount, pos, info) {
  if (!worldRef) return;
  const chips = consolidateChips(amount);
  const chipHeight = 0.3;
  const radius = 0.65;
  chips.forEach((value, idx) => {
    const mesh = createChipMesh(value);
    mesh.position.set(pos.x, chipHeight / 2 + idx * (chipHeight + 0.01), pos.z);
    const shape = new Cylinder(radius, radius, chipHeight, 16);
    const body = new Body({
      mass: 0.1,
      material: chipMaterial,
      shape,
      position: new Vec3(mesh.position.x, mesh.position.y, mesh.position.z),
      angularDamping: 0.9,
      linearDamping: 0.9
    });
    sceneRef.add(mesh);
    worldRef.addBody(body);
    betChips.push({ mesh, body, value, info });
  });
}

export function getChipMeshes() {
  return betChips.map(c => c.mesh);
}

export function handleChipClick(mesh) {
  const idx = betChips.findIndex(c => c.mesh === mesh);
  if (idx === -1) return;
  const chip = betChips[idx];
  removeChipFromState(chip);
  if (chip.mesh.parent) chip.mesh.parent.remove(chip.mesh);
  if (worldRef) worldRef.removeBody(chip.body);
  betChips.splice(idx, 1);
  updateBalanceDisplay();
  updateAllBetChips();
}

function removeChipFromState(chip) {
  const { value, info } = chip;
  player.balance += value;
  switch (info.kind) {
    case 'passLine':
      player.lineBet = Math.max(0, player.lineBet - value);
      break;
    case 'lineOdds':
      player.lineOdds = Math.max(0, player.lineOdds - value);
      break;
    case 'dontPass':
      player.dontPass = Math.max(0, player.dontPass - value);
      break;
    case 'field':
      player.fieldBet = Math.max(0, player.fieldBet - value);
      break;
    case 'place':
      player.placeBets[info.point] = Math.max(0, player.placeBets[info.point] - value);
      break;
    case 'hardway':
      player.hardways[info.point] = Math.max(0, player.hardways[info.point] - value);
      break;
    case 'come':
      adjustBetObject(info.bet, value, player.comeBets);
      break;
    case 'dontCome':
      adjustBetObject(info.bet, value, player.dontComeBets);
      break;
  }
}

function adjustBetObject(bet, value, list) {
  if (!bet) return;
  if (bet.odds >= value) {
    bet.odds -= value;
  } else {
    const remain = value - bet.odds;
    bet.odds = 0;
    bet.amount -= remain;
  }
  if (bet.amount <= 0 && bet.odds <= 0) {
    const i = list.indexOf(bet);
    if (i !== -1) list.splice(i, 1);
  }
}

export function updateChipMeshes() {
  betChips.forEach(c => {
    c.mesh.position.copy(c.body.position);
    c.mesh.quaternion.copy(c.body.quaternion);
  });
}
