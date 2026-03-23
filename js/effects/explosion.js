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

  const geometry = new THREE.SphereGeometry(1, 8, 8);
  const mesh = new THREE.Mesh(geometry, material);

  mesh.position.copy(position);
  mesh.scale.set(size, size, size);
  scene.add(mesh);

  let life = 0.25;

  const explosion = {
    mesh,
    material,
    life,
    baseSize: size,

    reset(scene, position, size = 2, color = 0xff8844) {
      this.mesh.position.copy(position);
      this.mesh.scale.set(size, size, size);
      this.material.emissive.setHex(color);
      this.material.opacity = 0.85;
      this.life = 0.25;
      this.baseSize = size;
      this.mesh.visible = true;
      if (!this.mesh.parent) scene.add(this.mesh);
    },

    onRelease() {
      this.mesh.visible = false;
      if (this.mesh.parent) this.mesh.parent.remove(this.mesh);
    },

    update(delta) {
      this.life -= delta;

      const scaleAdd = delta * 4;
      this.mesh.scale.x += scaleAdd;
      this.mesh.scale.y += scaleAdd;
      this.mesh.scale.z += scaleAdd;

      this.material.opacity = Math.max(0, this.life * 2.5);

      if (this.life <= 0) {
        return false;
      }

      return true;
    }
  };

  return explosion;
}