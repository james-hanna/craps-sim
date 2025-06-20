// src/environment/setup.js
import * as THREE from 'three';
import { World, Body, Box, Vec3, Material, ContactMaterial } from 'cannon-es';

export const diceMaterial = new Material('dice');
export const tableMaterial = new Material('table');
export const chipMaterial = new Material('chip');

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

  const diceTable = new ContactMaterial(diceMaterial, tableMaterial, {
    friction: 0.5,
    restitution: 0.25,
  });
  world.addContactMaterial(diceTable);

  const chipTable = new ContactMaterial(chipMaterial, tableMaterial, {
    friction: 0.6,
    restitution: 0.1,
  });
  world.addContactMaterial(chipTable);

  const diceChip = new ContactMaterial(diceMaterial, chipMaterial, {
    friction: 0.6,
    restitution: 0.2,
  });
  world.addContactMaterial(diceChip);

  const chipChip = new ContactMaterial(chipMaterial, chipMaterial, {
    friction: 0.6,
    restitution: 0.2,
  });
  world.addContactMaterial(chipChip);

  return world;
}

function createCrapsLayoutTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 1500;
  canvas.height = 2048;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#0b6623';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 4;
  ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);

  const areas = {
    passLine: { x: 50, y: canvas.height - 200, w: canvas.width - 100, h: 150, label: 'PASS LINE' },
    lineOdds: { x: 70, y: canvas.height - 240, w: canvas.width - 140, h: 40, label: 'ODDS' },
    dontPass: { x: 50, y: canvas.height - 320, w: canvas.width - 100, h: 70, label: "DON'T PASS" },
    field: { x: 50, y: canvas.height - 460, w: canvas.width - 100, h: 100, label: 'FIELD' },
    come: { x: 50, y: canvas.height - 680, w: canvas.width - 100, h: 190, label: 'COME' },
    dontCome: { x: 50, y: canvas.height - 760, w: canvas.width - 100, h: 80, label: "DON'T COME" }
  };

  const points = [4, 5, 6, 8, 9, 10];
  const comeW = 350;
  const comeH = 200;
  const dontH = 80;
  const spacingX = 80; // add more horizontal gap between boxes
  const startX = (canvas.width - (comeW * 3 + spacingX * 2)) / 2;
  const baseY = 760; // move rows slightly upward
  const rowSpacing = 320; // a bit more vertical spacing
  points.forEach((p, i) => {
    const row = Math.floor(i / 3);
    const col = i % 3;
    const x = startX + col * (comeW + spacingX);
    const comeY = baseY + row * rowSpacing;
    const dontY = comeY - dontH - 40; // extra gap from don't come box
    areas[`come${p}`] = { x, y: comeY, w: comeW, h: comeH, label: `${p}` };
    areas[`dontCome${p}`] = { x, y: dontY, w: comeW, h: dontH, label: `DC ${p}` };
    areas[`place${p}`] = { x, y: comeY, w: comeW, h: comeH, label: `${p}` };
  });

  const hwW = 200;
  const hwH = 200;
  const hwSpacing = 60;
  const hwStartX = (canvas.width - (hwW * 2 + hwSpacing)) / 2;
  const hwStartY = 220; // move hardways slightly toward top
  areas.hard4 = { x: hwStartX, y: hwStartY, w: hwW, h: hwH, label: 'HARD 4' };
  areas.hard6 = { x: hwStartX + hwW + hwSpacing, y: hwStartY, w: hwW, h: hwH, label: 'HARD 6' };
  areas.hard8 = { x: hwStartX, y: hwStartY + hwH + 20, w: hwW, h: hwH, label: 'HARD 8' };
  areas.hard10 = { x: hwStartX + hwW + hwSpacing, y: hwStartY + hwH + 20, w: hwW, h: hwH, label: 'HARD 10' };

  ctx.font = '48px Arial';
  ctx.textAlign = 'center';
  ctx.fillStyle = '#ffffff';

  for (const key in areas) {
    const a = areas[key];
    ctx.strokeRect(a.x, a.y, a.w, a.h);
    ctx.fillText(a.label, a.x + a.w / 2, a.y + a.h / 2 + 16);
  }

  return {
    texture: new THREE.CanvasTexture(canvas),
    areas,
    size: { width: canvas.width, height: canvas.height }
  };
}


export function setupTableAndWalls(scene, world) {
  const tableLength = 36;
  const tableWidth = 85;
  const tableHeight = 1;

  const { texture: layoutTex, areas, size } = createCrapsLayoutTexture();
  layoutTex.wrapS = THREE.RepeatWrapping;
  layoutTex.wrapT = THREE.RepeatWrapping;
  layoutTex.repeat.set(1, 1);
  const tableMat = new THREE.MeshStandardMaterial({ map: layoutTex });
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

  const mapX = cX => ((cX / size.width) - 0.5) * tableLength;
  const mapZ = cY => (cY / size.height - 0.5) * tableWidth;
  const chipSlots = {};
  const betAreas = {};
  for (const [key, a] of Object.entries(areas)) {
    const cx = a.x + a.w / 2;
    const cy = a.y + a.h / 2;
    chipSlots[key] = { x: mapX(cx), z: mapZ(cy) };
    const w = (a.w / size.width) * tableLength;
    const d = (a.h / size.height) * tableWidth;
    betAreas[key] = { x: mapX(cx), z: mapZ(cy), width: w, depth: d };
  }

  return { tableLength, tableWidth, chipSlots, betAreas };
}
