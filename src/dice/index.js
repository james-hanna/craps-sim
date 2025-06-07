import * as THREE from 'three';
import { Body, Box, Vec3 } from 'cannon-es';
import { diceMaterial } from '../environment/setup';
import { getTopFace } from './logic';

let dice = [];

export function createDie(position) {
  const size = 1;
  const geometry = new THREE.BoxGeometry(size, size, size);
  const materials = [];

  const loader = new THREE.TextureLoader();
  for (let i = 1; i <= 6; i++) {
    const texture = loader.load(`/dice/${i}.png`);
    materials.push(new THREE.MeshStandardMaterial({ map: texture }));
  }

  const mesh = new THREE.Mesh(geometry, materials);
  mesh.castShadow = true;
  mesh.position.copy(position);

  const shape = new Box(new Vec3(size / 2, size / 2, size / 2));
  const body = new Body({
    material: diceMaterial,
    mass: 1,
    shape: shape,
    linearDamping: 0.2,
    angularDamping: 0.2,
    position: new Vec3(position.x, position.y, position.z)
  });

  return { mesh, body };
}

export function spawnDice(scene, world, playerX, throwZ) {
  clearDice(scene, world);

  const d1 = createDie(new THREE.Vector3(playerX - 0.3, 1.2, throwZ));
  const d2 = createDie(new THREE.Vector3(playerX + 0.3, 1.2, throwZ));

  dice.push(d1, d2);
  scene.add(d1.mesh);
  scene.add(d2.mesh);
  world.addBody(d1.body);
  world.addBody(d2.body);

  dice.forEach(die => {
    const isLineDrive = Math.random() > 0.5;
    const force = isLineDrive
      ? new Vec3((Math.random() - 0.5) * 4.8, 9.6, -108 - Math.random() * 20)
      : new Vec3((Math.random() - 0.5) * 4.8, 19.2 + Math.random() * 7.2, -91.2 - Math.random() * 12);
    const torque = new Vec3(Math.random() * 10, Math.random() * 10, Math.random() * 10);

    die.body.velocity.set(force.x, force.y, force.z);
    die.body.angularVelocity.set(torque.x, torque.y, torque.z);
  });
}

export function clearDice(scene, world) {
  dice.forEach(die => {
    scene.remove(die.mesh);
    world.removeBody(die.body);
  });
  dice = [];
}

export function updateDiceMeshes() {
  dice.forEach(die => {
    die.mesh.position.copy(die.body.position);
    die.mesh.quaternion.copy(die.body.quaternion);
  });
}

export { getTopFace };
