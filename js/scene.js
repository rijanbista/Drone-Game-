import * as THREE from "https://unpkg.com/three@0.160.0/build/three.module.js";

export function createScene() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x739180);
  scene.fog = new THREE.FogExp2(0x739180, 0.0025);

  const camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    2000
  );

  camera.position.set(0, 70, 18);
  camera.lookAt(0, 0, 0);

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  document.body.appendChild(renderer.domElement);

  const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.6);
  hemiLight.position.set(0, 200, 0);
  scene.add(hemiLight);

  const light = new THREE.DirectionalLight(0xfffee0, 1.8);
  light.position.set(120, 180, 80);
  light.castShadow = true;
  light.shadow.mapSize.width = 2048;
  light.shadow.mapSize.height = 2048;
  light.shadow.camera.near = 0.5;
  light.shadow.camera.far = 500;
  const d = 250;
  light.shadow.camera.left = -d;
  light.shadow.camera.right = d;
  light.shadow.camera.top = d;
  light.shadow.camera.bottom = -d;
  light.shadow.bias = -0.0005;
  scene.add(light);

  const groundMaterial = new THREE.MeshStandardMaterial({ 
    vertexColors: true,
    roughness: 0.9,
    metalness: 0.05
  });

  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(800, 800, 60, 60),
    groundMaterial
  );
  
  // Flat terrain with slight noise and vertex coloring
  const positions = ground.geometry.attributes.position;
  const count = positions.count;
  const colors = new Float32Array(count * 3);

  const colorLow = new THREE.Color(0x354c25);
  const colorMid = new THREE.Color(0x476a38);
  const colorHigh = new THREE.Color(0x4a6e3a);

  for (let i = 0; i < count; i++) {
    const x = positions.getX(i);
    const y = positions.getY(i);
    
    // Very flat terrain, removed zOffset to prevent z-fighting with roads
    positions.setZ(i, 0);

    // Color based on noise map rather than height
    const normalizedNoise = (Math.sin(x * 0.1) * Math.cos(y * 0.1) + 1) / 2;
    const baseColor = new THREE.Color();
    if (normalizedNoise < 0.5) {
      baseColor.lerpColors(colorLow, colorMid, normalizedNoise / 0.5);
    } else {
      baseColor.lerpColors(colorMid, colorHigh, (normalizedNoise - 0.5) / 0.5);
    }
    
    baseColor.r += (Math.random() - 0.5) * 0.02;
    baseColor.g += (Math.random() - 0.5) * 0.02;
    baseColor.b += (Math.random() - 0.5) * 0.02;

    colors[i * 3] = baseColor.r;
    colors[i * 3 + 1] = baseColor.g;
    colors[i * 3 + 2] = baseColor.b;
  }
  
  ground.geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  ground.geometry.computeVertexNormals();

  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  // subtle terrain patches
  const patchMaterial1 = new THREE.MeshStandardMaterial({ color: 0x547a46, roughness: 0.9, metalness: 0.0 });
  const patchMaterial2 = new THREE.MeshStandardMaterial({ color: 0x3d5a2f, roughness: 0.95, metalness: 0.0 });

  for (let i = 0; i < 24; i++) {
    const patch = new THREE.Mesh(
      new THREE.CircleGeometry(15 + Math.random() * 25, 32),
      i % 2 === 0 ? patchMaterial1 : patchMaterial2
    );
    patch.rotation.x = -Math.PI / 2;
    patch.position.set(
      (Math.random() - 0.5) * 600,
      0.05 + Math.random() * 0.05, 
      (Math.random() - 0.5) * 600
    );
    patch.scale.set(1.6, 0.8 + Math.random() * 0.8, 1);
    patch.receiveShadow = true;
    scene.add(patch);
  }

  // Network of intersecting roads
  const roadMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x5c564c,
    roughness: 0.8,
    metalness: 0.1
  });

  const roadsData = [
    { w: 28, l: 800, x: -90, z: 0, rot: 0 },
    { w: 32, l: 800, x: 140, z: 0, rot: 0 },
    { w: 24, l: 800, x: -250, z: 0, rot: 0 },
    { w: 26, l: 800, x: 0, z: -100, rot: Math.PI / 2 },
    { w: 30, l: 800, x: 0, z: 180, rot: Math.PI / 2 },
    { w: 20, l: 800, x: 0, z: -300, rot: Math.PI / 2 }
  ];

  roadsData.forEach(r => {
    const road = new THREE.Mesh(new THREE.PlaneGeometry(r.w, r.l), roadMaterial);
    road.rotation.x = -Math.PI / 2;
    road.rotation.z = r.rot;
    road.position.set(r.x, 0.1, r.z);
    road.receiveShadow = true;
    scene.add(road);
  });

  window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  return { scene, camera, renderer };
}