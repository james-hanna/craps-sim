// src/main.js
import * as THREE from 'three';
import { Vec3 } from 'cannon-es';

import { setupSceneAndRenderer, setupPhysicsWorld, setupTableAndWalls } from './environment/setup.js';



import { initControls } from './ui/controls.js';
import { createDie, getTopFace } from './dice/index.js';
import { initializeBalanceDisplay, updateBalanceDisplay } from './ui/balance.js';
import { placeBet, updateChipDisplay, clearChips } from './betting/index.js';
import { setupUI, messagePanel } from './ui/index.js';
import { checkRoll } from './logic/rollHandler.js';

const {
  scene,
  camera,
  renderer,
  throwZ,
  diceMaterial,
  world,
  tableWidth
} = setupSceneAndRenderer();

setupPhysicsWorld(world);
setupTableAndWalls(scene, world);
initControls(camera, renderer);
initializeBalanceDisplay();
setupUI(() => spawnDice(), (amount) => placeBet(amount, playerX, throwZ, scene, updateBalanceDisplay));

let playerX = 0;
let dice = [];
let waitingForRollToSettle = false;
let rollDisplayPending = false;
let rollTimer = 0;

function spawnDice() {
  clearDice();

  const d1 = createDie(new THREE.Vector3(playerX - 0.3, 1.2, throwZ), diceMaterial);
  const d2 = createDie(new THREE.Vector3(playerX + 0.3, 1.2, throwZ), diceMaterial);

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
  rollDisplayPending = true;
}

function clearDice() {
  dice.forEach(d => {
    scene.remove(d.mesh);
    world.removeBody(d.body);
  });
  dice = [];
}

function displayMessage(text) {
  messagePanel.textContent = text;
}

function animate() {
  requestAnimationFrame(animate);
  world.step(1 / 60);

  dice.forEach(die => {
    die.mesh.position.copy(die.body.position);
    die.mesh.quaternion.copy(die.body.quaternion);
  });

  if (waitingForRollToSettle) {
    checkRoll({
      dice,
      waitingForRollToSettle,
      rollDisplayPending,
      rollTimer,
      updateBalanceDisplay,
      displayMessage,
      clearDice,
      clearChips,
      updateChipDisplay,
      scene,
      playerX,
      throwZ,
      onRollComplete: () => {
        waitingForRollToSettle = false;
        rollDisplayPending = false;
        rollTimer = 0;
      },
      incrementTimer: () => {
        rollTimer += 1 / 60;
      },
      resetTimer: () => {
        rollTimer = 0;
      }
    });
  }

  renderer.render(scene, camera);
}
animate();
