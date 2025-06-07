import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export function initControls(camera, renderer) {
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.target.set(0, 0, 0);
  controls.enableDamping = true;
  controls.dampingFactor = 0.1;
  controls.enablePan = false;
  controls.maxPolarAngle = Math.PI / 2.2;
  controls.minDistance = 20;
  controls.maxDistance = 80;

  return controls;
}
