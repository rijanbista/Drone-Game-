import * as THREE from "https://unpkg.com/three@0.160.0/build/three.module.js";

export function createBuilding(x, z) {
  const group = new THREE.Group();
  
  const width = 6 + Math.random() * 2;
  const height = 3 + Math.random() * 1.5;
  const depth = 6 + Math.random() * 2;

  const tentMat = new THREE.MeshStandardMaterial({ 
    color: 0x6b5a45, 
    roughness: 0.9, 
    metalness: 0.0,
    side: THREE.DoubleSide
  });
  const poleMat = new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.8 });

  // Tent Body (Prism Shape)
  const tentGeo = new THREE.CylinderGeometry(0.1, Math.max(width, depth), height, 4);
  const tentBody = new THREE.Mesh(tentGeo, tentMat);
  tentBody.rotation.y = Math.PI / 4;
  tentBody.castShadow = true;
  tentBody.receiveShadow = true;
  group.add(tentBody);

  // HP Bar UI
  const barGroup = new THREE.Group();
  barGroup.position.y = height / 2 + 1.0;
  group.add(barGroup);

  const barBg = new THREE.Mesh(
    new THREE.PlaneGeometry(4, 0.4),
    new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.5, side: THREE.DoubleSide })
  );
  barGroup.add(barBg);

  const barFill = new THREE.Mesh(
    new THREE.PlaneGeometry(4, 0.4),
    new THREE.MeshBasicMaterial({ color: 0x00ff00, side: THREE.DoubleSide })
  );
  barFill.position.z = 0.01;
  barGroup.add(barFill);
  barGroup.visible = false; // Hide until hit

  // Poles
  const poleGeo = new THREE.CylinderGeometry(0.1, 0.1, height, 8);
  for (let i = 0; i < 4; i++) {
    const pole = new THREE.Mesh(poleGeo, poleMat);
    const angle = (i / 4) * Math.PI * 2 + Math.PI / 4;
    const dist = Math.max(width, depth) * 0.45;
    pole.position.set(Math.cos(angle) * dist, -height / 2, Math.sin(angle) * dist);
    group.add(pole);
  }

  group.position.set(x, height / 2, z);

  const initialHP = 15;

  return {
    type: "tent",
    mesh: group,
    x,
    z,
    halfW: width / 2,
    halfD: depth / 2,
    height,
    health: initialHP,
    maxHealth: initialHP,
    hpBar: barGroup,
    hpFill: barFill,
    
    updateHPBar() {
      this.hpBar.visible = true;
      const scale = Math.max(0, this.health / this.maxHealth);
      this.hpFill.scale.x = scale;
      this.hpFill.position.x = -2 * (1 - scale);
    }
  };
}
