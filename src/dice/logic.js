import * as THREE from 'three';

// Determines which face is on top by comparing direction vectors
export function getTopFace(die) {
  const up = new THREE.Vector3(0, 1, 0);

  const faceDirections = [
    { dir: new THREE.Vector3(0, 1, 0), value: 3 },   // top
    { dir: new THREE.Vector3(0, -1, 0), value: 4 },  // bottom
    { dir: new THREE.Vector3(1, 0, 0), value: 1 },   // right
    { dir: new THREE.Vector3(-1, 0, 0), value: 2 },  // left
    { dir: new THREE.Vector3(0, 0, 1), value: 5 },   // front
    { dir: new THREE.Vector3(0, 0, -1), value: 6 },  // back
  ];

  let maxDot = -Infinity;
  let topFace = 1;

  for (const { dir, value } of faceDirections) {
    const worldDir = dir.clone().applyQuaternion(die.mesh.quaternion);
    const dot = worldDir.dot(up);
    if (dot > maxDot) {
      maxDot = dot;
      topFace = value;
    }
  }

  return topFace;
}
