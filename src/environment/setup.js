// src/environment/setup.js
import * as THREE from 'three';
import { World, Body, Box, Vec3, Material, ContactMaterial } from 'cannon-es';

export const diceMaterial = new Material('dice');
export const tableMaterial = new Material('table');

export function setupSceneAndRenderer() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x1e1e1e);

  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 25, 55);
  camera.lookAt(0, 0, 0);

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  document.body.appendChild(renderer.domElement);

  const controls = {
    camera,
    target: new THREE.Vector3(0, 0, 0),
    enableDamping: true,
    dampingFactor: 0.1,
    enablePan: false,
    maxPolarAngle: Math.PI / 2.2,
    minDistance: 20,
    maxDistance: 80,
  };

  scene.add(new THREE.HemisphereLight(0xffffff, 0x444444, 0.3));
  scene.add(new THREE.AmbientLight(0xffffff, 0.3));
  const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
  dirLight.position.set(10, 20, 10);
  dirLight.castShadow = true;
  scene.add(dirLight);

  return { scene, camera, renderer };
}

export function setupPhysicsWorld() {
  const world = new World();
  world.gravity.set(0, -30, 0);

  const contactMaterial = new ContactMaterial(diceMaterial, tableMaterial, {
    friction: 0.5,
    restitution: 0.25,
  });
  world.addContactMaterial(contactMaterial);

  return world;
}


export function setupTableAndWalls(scene, world) {
  const tableLength = 36;
  const tableWidth = 85;
  const tableHeight = 1;

  const tableMat = new THREE.MeshStandardMaterial({ color: 0x228B22 });
  const tableGeo = new THREE.BoxGeometry(tableLength, tableHeight, tableWidth);
  const tableMesh = new THREE.Mesh(tableGeo, tableMat);
  tableMesh.position.set(0, -0.5, 0);
  tableMesh.receiveShadow = true;
  scene.add(tableMesh);

  const tableBody = new Body({
    mass: 0,
    shape: new Box(new Vec3(tableLength / 2, tableHeight / 2, tableWidth / 2)),
    position: new Vec3(0, -0.5, 0),
    material: tableMaterial,
  });
  world.addBody(tableBody);

  const wallHeight = 10;

  const walls = [
    { x: -tableLength / 2, y: wallHeight / 2, z: 0, w: 1, h: wallHeight, d: tableWidth },
    { x: tableLength / 2, y: wallHeight / 2, z: 0, w: 1, h: wallHeight, d: tableWidth },
    { x: 0, y: wallHeight / 2, z: -tableWidth / 2, w: tableLength, h: wallHeight, d: 5 },
    { x: 0, y: 0.5, z: tableWidth / 2, w: tableLength, h: 1, d: 1 },
    { x: 0, y: wallHeight / 2, z: -tableWidth / 2 - 3, w: tableLength, h: wallHeight, d: 0.5 },
  ];

  for (const wall of walls) {
    const wallMat = new THREE.MeshStandardMaterial({ color: 0x444444 });
    const wallGeo = new THREE.BoxGeometry(wall.w, wall.h, wall.d);
    const wallMesh = new THREE.Mesh(wallGeo, wallMat);
    wallMesh.position.set(wall.x, wall.y, wall.z);
    wallMesh.castShadow = true;
    scene.add(wallMesh);

    const wallBody = new Body({
      mass: 0,
      shape: new Box(new Vec3(wall.w / 2, wall.h / 2, wall.d / 2)),
      position: new Vec3(wall.x, wall.y, wall.z),
      material: tableMaterial,
    });
    world.addBody(wallBody);
  }

  return { tableLength, tableWidth };
}
