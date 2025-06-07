// src/main.js
import * as THREE from 'three';
import { Vec3 } from 'cannon-es';

import {
  setupSceneAndRenderer,
  setupPhysicsWorld,
  setupTableAndWalls
} from './environment/setup.js';


import { initControls } from './ui/controls.js';
import { createDie } from './dice/index.js';
import { updateBalanceDisplay } from './ui/balance.js';
import {
  placeBet,
  placeComeBet,
  placeDontPass,
  placeDontCome,
  placeFieldBet,
  placeOdds,
  placeHardway
} from './betting/index.js';

import { setupUI } from './ui/index.js';
import { checkRoll } from './logic/rollHandler.js';
import { player, gameState } from './state/player.js';
import { displayMessage } from './ui/message.js';

const { scene, camera, renderer } = setupSceneAndRenderer();
const world = setupPhysicsWorld();
const { tableWidth } = setupTableAndWalls(scene, world);
const throwZ = tableWidth / 2 - 4;
initControls(camera, renderer);
setupUI({
  onRollDice: spawnDice,
  onLineBet: (amount) => placeBet(amount, playerX, throwZ, scene, updateBalanceDisplay),
  onComeBet: (amount) => placeComeBet(amount),
  onDontPass: (amount) => placeDontPass(amount),
  onDontCome: (amount) => placeDontCome(amount),
  onFieldBet: (amount) => placeFieldBet(amount),
  onOddsLine: (amount) => placeOdds('line', null, amount),
  onHardway: (number, amount) => placeHardway(number, amount)
});

let playerX = 0;
let dice = [];
let waitingForRollToSettle = false;

function spawnDice() {
  if (gameState.phase === 'comeOut' && player.lineBet === 0) {

    displayMessage('Place a line bet before rolling.');
    return;
  }

  clearDice();

  const d1 = createDie(new THREE.Vector3(playerX - 0.3, 1.2, throwZ));
  const d2 = createDie(new THREE.Vector3(playerX + 0.3, 1.2, throwZ));

  scene.add(d1.mesh, d2.mesh);
  world.addBody(d1.body);
  world.addBody(d2.body);

  dice = [d1, d2];

  dice.forEach(die => {
    const isLineDrive = Math.random() > 0.5;
    const force = isLineDrive
      ? new Vec3((Math.random() - 0.5) * 4.8, 9.6, -108 - Math.random() * 20)
      : new Vec3((Math.random() - 0.5) * 4.8, 19.2 + Math.random() * 7.2, -91.2 - Math.random() * 12);
    const torque = new Vec3(Math.random() * 10, Math.random() * 10, Math.random() * 10);

    die.body.velocity.set(force.x, force.y, force.z);
    die.body.angularVelocity.set(torque.x, torque.y, torque.z);
  });

  waitingForRollToSettle = true;
}

function clearDice() {
  dice.forEach(d => {
    scene.remove(d.mesh);
    world.removeBody(d.body);
  });
  dice = [];
}

function animate() {
  requestAnimationFrame(animate);
  world.step(1 / 60);

  dice.forEach(die => {
    die.mesh.position.copy(die.body.position);
    die.mesh.quaternion.copy(die.body.quaternion);
  });

  if (waitingForRollToSettle && checkRoll(dice)) {
    waitingForRollToSettle = false;
  }

  renderer.render(scene, camera);
}
animate();
