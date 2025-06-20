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
import {
  initBetting,
  placeBet,
  placeComeBet,
  placeDontPass,
  placeDontCome,
  placeFieldBet,
  placeOdds,
  placeHardway,
  placeNumberBet
} from './betting/index.js';
import { setupUI, getSelectedDenomination } from './ui/index.js';
import { getChipMeshes, handleChipClick, updateChipMeshes, decreaseBetForBox } from './betting/index.js';
import { checkRoll } from './logic/rollHandler.js';
import { player, gameState } from './state/player.js';
import { displayMessage } from './ui/message.js';

const { scene, camera, renderer } = setupSceneAndRenderer();
const world = setupPhysicsWorld();
const { tableWidth, chipSlots, betAreas } = setupTableAndWalls(scene, world);
const throwZ = tableWidth / 2 - 4;
const controls = initControls(camera, renderer);

const betBoxMeshes = [];
for (const [key, area] of Object.entries(betAreas)) {
  const geo = new THREE.BoxGeometry(area.width, 0.2, area.depth);
  const mat = new THREE.MeshBasicMaterial({ visible: false });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.set(area.x, 0.1, area.z);
  mesh.userData.betKey = key;
  scene.add(mesh);
  betBoxMeshes.push(mesh);
}

initBetting(scene, chipSlots, world);
setupUI({
  onRollDice: spawnDice,
  onLineBet: (amount) => placeBet(amount),
  onComeBet: (amount) => placeComeBet(amount),
  onDontPass: (amount) => placeDontPass(amount),
  onDontCome: (amount) => placeDontCome(amount),
  onFieldBet: (amount) => placeFieldBet(amount),
  onOddsLine: (amount) => placeOdds('line', null, amount),
  onHardway: (number, amount) => placeHardway(number, amount),
  onPlaceBet: (number, amount) => placeNumberBet(number, amount)
});

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
const clickInfo = { x: 0, y: 0, object: null, kind: null, down: false };

function onPointerDown(event) {
  if (event.button !== 0) return;
  event.preventDefault();
  clickInfo.x = event.clientX;
  clickInfo.y = event.clientY;
  clickInfo.down = true;
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);
  let intersect = raycaster.intersectObjects(getChipMeshes(), true);
  if (intersect.length) {
    clickInfo.object = intersect[0].object;
    clickInfo.kind = 'chip';
    controls.enabled = false;
  } else {
    intersect = raycaster.intersectObjects(betBoxMeshes, true);
    clickInfo.object = intersect.length ? intersect[0].object : null;
    clickInfo.kind = clickInfo.object ? 'box' : null;
  }
}

function onPointerUp(event) {
  if (!clickInfo.down) return;
  clickInfo.down = false;
  controls.enabled = true;
  const dx = Math.abs(event.clientX - clickInfo.x);
  const dy = Math.abs(event.clientY - clickInfo.y);
  if (dx < 4 && dy < 4 && clickInfo.object) {
    if (clickInfo.kind === 'chip') {
      handleChipClick(clickInfo.object);
    } else if (clickInfo.kind === 'box') {
      const denom = getSelectedDenomination();
      const key = clickInfo.object.userData.betKey;
      decreaseBetForBox(key, denom);
    }
  }
  clickInfo.object = null;
  clickInfo.kind = null;
}

renderer.domElement.addEventListener('pointerdown', onPointerDown);
renderer.domElement.addEventListener('pointerup', onPointerUp);

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
  updateChipMeshes();

  if (waitingForRollToSettle && checkRoll(dice)) {
    waitingForRollToSettle = false;
  }

  renderer.render(scene, camera);
}
animate();
