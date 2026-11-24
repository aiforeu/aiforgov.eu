import * as THREE from '../agentario-scene/vendor/three.module.min.js';
import { RoundedBoxGeometry } from '../agentario-scene/vendor/RoundedBoxGeometry.js';
import { RoomEnvironment } from '../agentario-scene/vendor/RoomEnvironment.js';
import { addVoice } from './voice.js';
import { addDesktop } from './desktop.js';
import { addWorkflows } from './workflows.js';

function surface(color, metalness, roughness) {
  return new THREE.MeshStandardMaterial({ color, metalness, roughness });
}

function makeKit() {
  const mat = {
    chalk: surface(0xd5d5d0, .22, .45),
    silver: surface(0xa4a9ae, .83, .3),
    graphite: surface(0x404349, .66, .36),
    dark: surface(0x212428, .44, .42),
    accent: surface(0xd39b50, .57, .27),
    ink: surface(0x131619, .26, .48),
    glass: surface(0x3b4649, .52, .19)
  };
  const geometry = new Map();
  function box(w, h, d, r, material) {
    const key = [w, h, d, r].join('/');
    if (!geometry.has(key)) geometry.set(key, new RoundedBoxGeometry(w, h, d, 2, r));
    return new THREE.Mesh(geometry.get(key), material);
  }
  function rod(start, end, radius, material) {
    const a = new THREE.Vector3(...start), b = new THREE.Vector3(...end);
    const direction = b.clone().sub(a);
    const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, direction.length(), 16), material);
    mesh.position.copy(a).lerp(b, .5);
    mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize());
    return mesh;
  }
  function tube(points, radius, material) {
    const curve = new THREE.CatmullRomCurve3(points.map(p => new THREE.Vector3(...p)));
    return new THREE.Mesh(new THREE.TubeGeometry(curve, Math.max(20, points.length * 7), radius, 8), material);
  }
  return { mat, box, rod, tube };
}

function addTable(group, { box, mat }) {
  function part(w, h, d, radius, material, x, y, z) {
    const mesh = box(w, h, d, radius, material);
    mesh.position.set(x, y, z);
    group.add(mesh);
  }
  part(3.3, .087, 1.52, .034, mat.chalk, 0, -.0435, 0);
  part(3.19, .039, 1.41, .018, mat.graphite, 0, -.095, 0);
  for (const x of [-1.48, 1.48]) {
    part(.078, .107, 1.20, .016, mat.silver, x, -.146, 0);
    for (const z of [-.595, .595]) {
      part(.082, 1.105, .085, .012, mat.silver, x, -.695, z);
      part(.070, .033, .073, .01, mat.dark, x, -1.26, z);
    }
  }
  for (const z of [-.595, .595]) {
    part(2.92, .102, .070, .012, mat.silver, 0, -.149, z);
  }
}

export function createStudio(options = {}) {
  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power', ...options });
  renderer.setClearColor(0x000000, 0);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.02;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  const room = new RoomEnvironment();
  const pmrem = new THREE.PMREMGenerator(renderer);
  const environment = pmrem.fromScene(room, .035);
  room.dispose();
  pmrem.dispose();
  const kit = makeKit();

  function model(name) {
    const scene = new THREE.Scene();
    scene.environment = environment.texture;
    scene.environmentIntensity = .72;
    scene.add(new THREE.HemisphereLight(0xf1f5ff, 0x56504b, .94));
    const key = new THREE.DirectionalLight(0xfff2df, 2.05);
    key.position.set(-2.7, 5.8, 3.6);
    key.castShadow = name !== 'workflows';
    Object.assign(key.shadow.camera, { left: -2.5, right: 2.5, top: 2.2, bottom: -2, near: .1, far: 13 });
    key.shadow.mapSize.set(512, 512);
    key.shadow.normalBias = .012;
    key.shadow.bias = -.0004;
    scene.add(key);
    const rim = new THREE.DirectionalLight(0xd3e3ff, 1.55);
    rim.position.set(2, 3, -4);
    scene.add(rim);
    const object = new THREE.Group();
    scene.add(object);
    if (name !== 'workflows') {
      const table = new THREE.Group();
      table.scale.x = 1.095;
      addTable(table, kit);
      object.add(table);
    }
    const drawModel = { voice: addVoice, desktop: addDesktop, workflows: addWorkflows }[name];
    const advance = drawModel(THREE, object, kit);
    object.traverse(mesh => {
      if (mesh.isMesh && !mesh.material.isMeshBasicMaterial) {
        mesh.receiveShadow = true;
        mesh.castShadow = true;
      }
    });
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, .1, 40);
    const center = new THREE.Vector3(0, name === 'workflows' ? -.17 : .025, 0);
    camera.position.copy(center).add(new THREE.Vector3(3.65, 2.75, 7));
    camera.lookAt(center);
    return { scene, camera, object, advance, name };
  }

  function render(item, width, height, rotation = 0, seconds = 0) {
    const canvas = renderer.domElement;
    if (canvas.width !== width || canvas.height !== height) renderer.setSize(width, height, false);
    const aspect = width / height;
    const heightAtRest = item.name === 'workflows' ? 3.22 : 3.86;
    const span = Math.max(heightAtRest, heightAtRest * 1.5 / aspect);
    const camera = item.camera;
    camera.top = span / 2;
    camera.bottom = -camera.top;
    camera.right = span * aspect / 2;
    camera.left = -camera.right;
    camera.updateProjectionMatrix();
    item.object.rotation.y = rotation;
    if (item.advance) item.advance(seconds);
    renderer.render(item.scene, camera);
    return canvas;
  }

  return { renderer, model, render };
}
