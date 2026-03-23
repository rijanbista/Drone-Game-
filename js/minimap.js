const MAP_SIZE = 640;
const MAP_HALF = MAP_SIZE / 2;

export function createMinimap() {
  const canvas = document.getElementById("minimapCanvas");
  const ctx = canvas.getContext("2d");

  const size = 180;
  const pad = 10;
  const drawSize = size - pad * 2;

  canvas.width = size;
  canvas.height = size;

  function worldToMap(x, z) {
    const mx = pad + ((x + MAP_HALF) / MAP_SIZE) * drawSize;
    const my = pad + ((z + MAP_HALF) / MAP_SIZE) * drawSize;
    return { x: mx, y: my };
  }

  function draw(drone, enemies) {
    ctx.clearRect(0, 0, size, size);

    ctx.fillStyle = "#1f2d1f";
    ctx.fillRect(0, 0, size, size);

    ctx.strokeStyle = "rgba(255,255,255,0.18)";
    ctx.lineWidth = 2;
    ctx.strokeRect(pad, pad, drawSize, drawSize);

    ctx.strokeStyle = "rgba(255,255,255,0.08)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(size / 2, pad);
    ctx.lineTo(size / 2, size - pad);
    ctx.moveTo(pad, size / 2);
    ctx.lineTo(size - pad, size / 2);
    ctx.stroke();

    enemies.forEach((enemy) => {
      const p = worldToMap(enemy.mesh.position.x, enemy.mesh.position.z);

      if (enemy.isJammer) {
        ctx.fillStyle = "#bb66ff";
      } else if (enemy.type === "infantry") {
        ctx.fillStyle = "#33cc66";
      } else if (enemy.type === "chopper") {
        ctx.fillStyle = "#4da6ff";
      } else {
        ctx.fillStyle = "#ff4d4d";
      }

      ctx.beginPath();
      ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
      ctx.fill();
    });

    const player = worldToMap(drone.mesh.position.x, drone.mesh.position.z);

    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(player.x, player.y, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "#00e5ff";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(player.x, player.y, 7, 0, Math.PI * 2);
    ctx.stroke();
  }

  return { draw };
}