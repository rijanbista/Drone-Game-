import * as THREE from "https://unpkg.com/three@0.160.0/build/three.module.js";

export function createExplosion(scene, position, size = 2, color = 0xff8844) {
  const material = new THREE.MeshStandardMaterial({
    color: 0x222222,
    emissive: color,
    emissiveIntensity: 3.5,
    transparent: true,
    opacity: 0.85,
    roughness: 1.0
  });

  const mesh = new THREE.Mesh(
    new THREE.SphereGeometry(size, 8, 8),
    material
  );

  mesh.position.copy(position);
  scene.add(mesh);

  let life = 0.25;

  return {
    update(delta) {
      life -= delta;

      mesh.scale.x += delta * 4;
      mesh.scale.y += delta * 4;
      mesh.scale.z += delta * 4;

      material.opacity = Math.max(0, life * 2.5);

      if (life <= 0) {
        scene.remove(mesh);
        material.dispose();
        mesh.geometry.dispose();
        return false;
      }

      return true;
    }
  };
}