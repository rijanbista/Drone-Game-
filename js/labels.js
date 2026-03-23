export function createEnemyLabel(enemy) {
  const root = document.createElement("div");
  root.className = "enemyLabel";
  root.style.fontSize = "10px";
  root.style.padding = "1px 3px";
  root.style.borderRadius = "4px";

  const tag = document.createElement("div");
  tag.className = "enemyTag";
  tag.textContent = enemy.labelText;
  tag.style.background = enemy.labelColor;
  tag.style.fontSize = "10px";
  tag.style.padding = "1px 4px";
  tag.style.minWidth = "14px";

  const barWrap = document.createElement("div");
  barWrap.className = "barWrap";
  barWrap.style.width = "32px";
  barWrap.style.height = "4px";

  const barFill = document.createElement("div");
  barFill.className = "barFill";

  barWrap.appendChild(barFill);
  root.appendChild(tag);
  root.appendChild(barWrap);

  document.getElementById("overlay").appendChild(root);

  const arrow = document.createElement("div");
  arrow.className = "enemyArrow";
  arrow.textContent = "▲";
  arrow.style.display = "none";
  document.getElementById("overlay").appendChild(arrow);

  return { root, tag, barFill, arrow };
}

export function updateEnemyLabels(enemies, labels, camera, drone) {
  const width = window.innerWidth;
  const height = window.innerHeight;
  const centerX = width / 2;
  const centerY = height / 2;
  const margin = 56;
  const arrowRange = 120;

  for (const enemy of enemies) {
    const label = labels.get(enemy);
    if (!label || !enemy.mesh) continue;

    const worldPos = enemy.mesh.position.clone();
    worldPos.y += enemy.air ? 3.2 : 2.4;

    const screen = worldPos.clone().project(camera);

    const visible =
      screen.z > 0 &&
      screen.z < 1 &&
      screen.x >= -1 &&
      screen.x <= 1 &&
      screen.y >= -1 &&
      screen.y <= 1;

    const camDx = enemy.mesh.position.x - camera.position.x;
    const camDz = enemy.mesh.position.z - camera.position.z;
    const camDist = Math.hypot(camDx, camDz);

    const droneDx = enemy.mesh.position.x - drone.mesh.position.x;
    const droneDz = enemy.mesh.position.z - drone.mesh.position.z;
    const droneDist = Math.hypot(droneDx, droneDz);

    if (visible) {
      const sx = (screen.x * 0.5 + 0.5) * width;
      const sy = (-screen.y * 0.5 + 0.5) * height;

      const scale = Math.max(0.55, Math.min(0.95, 170 / camDist));
      const opacity = camDist > 170 ? 0.45 : 0.9;

      if (camDist < 35) {
        label.root.style.display = "none";
      } else {
        label.root.style.display = "block";
        label.root.style.left = `${sx}px`;
        label.root.style.top = `${sy}px`;
        label.root.style.transform = `translate(-50%, -50%) scale(${scale})`;
        label.root.style.opacity = opacity;
      }

      label.arrow.style.display = "none";
      
      label.tag.textContent = enemy.alerted ? enemy.labelText + " (!)" : enemy.labelText;

      const hp = Math.max(0, enemy.health / enemy.maxHealth) * 100;
      label.barFill.style.width = `${hp}%`;
    } else {
      label.root.style.display = "none";

      if (droneDist <= arrowRange) {
        let dx = screen.x;
        let dy = -screen.y;

        if (screen.z <= 0) {
          dx *= -1;
          dy *= -1;
        }

        const len = Math.hypot(dx, dy) || 1;
        dx /= len;
        dy /= len;

        const px = centerX + dx * (Math.min(centerX, centerY) - margin);
        const py = centerY + dy * (Math.min(centerX, centerY) - margin);

        label.arrow.style.display = "block";
        label.arrow.style.left = `${px}px`;
        label.arrow.style.top = `${py}px`;

        const angle = Math.atan2(dy, dx) + Math.PI / 2;
        label.arrow.style.transform = `translate(-50%, -50%) rotate(${angle}rad) scale(0.85)`;
        label.arrow.style.color = enemy.labelColor;
        label.arrow.style.opacity = "0.9";
      } else {
        label.arrow.style.display = "none";
      }
    }
  }
}