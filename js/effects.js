import * as THREE from "https://unpkg.com/three@0.160.0/build/three.module.js";

export function createEffectsSystem(scene, camera) {
  const rings = [];
  const popups = [];
  const popupLayer = document.createElement("div");
  popupLayer.style.position = "absolute";
  popupLayer.style.inset = "0";
  popupLayer.style.pointerEvents = "none";
  popupLayer.style.zIndex = "35";
  document.body.appendChild(popupLayer);

  function addPopup(text, color = "#ffffff") {
    const el = document.createElement("div");
    el.textContent = text;
    el.style.position = "absolute";
    el.style.left = "50%";
    el.style.top = "20%";
    el.style.transform = "translate(-50%, -50%)";
    el.style.padding = "6px 12px";
    el.style.borderRadius = "8px";
    el.style.background = "rgba(0,0,0,0.45)";
    el.style.color = color;
    el.style.fontSize = "16px";
    el.style.fontWeight = "bold";
    el.style.opacity = "1";
    popupLayer.appendChild(el);

    popups.push({ el, life: 0.9, y: 20 });
  }

  function addExplosion(position, radius = 4, color = 0xff8844) {
    const ring = new THREE.Mesh(
      new THREE.RingGeometry(radius * 0.25, radius, 32),
      new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 0.75,
        side: THREE.DoubleSide
      })
    );
    ring.rotation.x = -Math.PI / 2;
    ring.position.set(position.x, 0.12, position.z);
    scene.add(ring);

    const scorch = new THREE.Mesh(
      new THREE.CircleGeometry(radius * 0.7, 24),
      new THREE.MeshBasicMaterial({
        color: 0x222222,
        transparent: true,
        opacity: 0.35
      })
    );
    scorch.rotation.x = -Math.PI / 2;
    scorch.position.set(position.x, 0.04, position.z);
    scene.add(scorch);

    rings.push({
      ring,
      scorch,
      life: 0.55,
      grow: radius * 2.0
    });
  }

  function update(delta) {
    for (let i = rings.length - 1; i >= 0; i--) {
      const fx = rings[i];
      fx.life -= delta;
      fx.ring.scale.addScalar(delta * fx.grow);
      fx.ring.material.opacity = Math.max(0, fx.life * 1.6);
      fx.scorch.material.opacity = Math.max(0, fx.life * 0.4);

      if (fx.life <= 0) {
        scene.remove(fx.ring);
        scene.remove(fx.scorch);
        rings.splice(i, 1);
      }
    }

    for (let i = popups.length - 1; i >= 0; i--) {
      const p = popups[i];
      p.life -= delta;
      p.y -= delta * 18;
      p.el.style.top = `${p.y}%`;
      p.el.style.opacity = `${Math.max(0, p.life / 0.9)}`;

      if (p.life <= 0) {
        p.el.remove();
        popups.splice(i, 1);
      }
    }
  }

  return {
    addExplosion,
    addPopup,
    update
  };
}