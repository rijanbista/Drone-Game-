import { createMinimap } from "./minimap.js";
import {
  initAudio,
  playMissileSound,
  playBigMissileSound,
  playNukeSound,
  playWaveClearSound,
  playGameOverSound,
  playJammerSound,
  startHoverSound,
  stopHoverSound
} from "./sounds.js";
import * as THREE from "https://unpkg.com/three@0.160.0/build/three.module.js";
import { createScene } from "./scene.js";
import { createGameState } from "./gameState.js";
import { setupInput } from "./input.js";
import { updateUI } from "./ui.js";
import { createDrone, updateDrone } from "./player/drone.js";
import { createWorld } from "./world/worldManager.js";
import { createEnemyManager } from "./enemies/enemyManager.js";
import { createEnemyLabel, updateEnemyLabels } from "./labels.js";
import { spawnWave } from "./waves.js";
import { createBulletManager } from "./bullets/bulletManager.js";
import { createEnemyBulletManager } from "./bullets/enemyBulletManager.js";
import { createAllySystem } from "./allies.js";

const minimap = createMinimap();
const gameOverEl = document.getElementById("gameOverScreen");
const finalScoreText = document.getElementById("finalScoreText");
const feedNoiseEl = document.getElementById("feedNoise");

const sceneData = createScene();
const gameState = createGameState();

setupInput(gameState);

const lensStatusEl = document.createElement("div");
lensStatusEl.style.position = "absolute";
lensStatusEl.style.bottom = "12px";
lensStatusEl.style.right = "12px";
lensStatusEl.style.padding = "6px 10px";
lensStatusEl.style.background = "rgba(0,0,0,0.45)";
lensStatusEl.style.color = "white";
lensStatusEl.style.fontSize = "12px";
lensStatusEl.style.borderRadius = "8px";
lensStatusEl.style.zIndex = "30";
lensStatusEl.textContent = "Lens: OFF";
document.body.appendChild(lensStatusEl);

window.addEventListener("contextmenu", (e) => {
  e.preventDefault();
  gameState.zoomMode = !gameState.zoomMode;
  lensStatusEl.textContent = gameState.zoomMode ? "Lens: ON" : "Lens: OFF";
});

window.addEventListener(
  "wheel",
  (e) => {
    const zoomStep = e.deltaY > 0 ? 4 : -4;

    if (gameState.zoomMode) {
      gameState.cameraHeight = Math.max(
        35,
        Math.min(110, gameState.cameraHeight + zoomStep)
      );
      gameState.cameraOffsetZ = Math.max(
        6,
        Math.min(30, gameState.cameraOffsetZ + zoomStep * 0.35)
      );
    }
  },
  { passive: false }
);

const drone = createDrone(sceneData.scene);
const world = createWorld(sceneData.scene);
const enemyManager = createEnemyManager(sceneData.scene);
const bulletManager = createBulletManager(sceneData.scene);
const enemyBulletManager = createEnemyBulletManager(sceneData.scene);
const allySystem = createAllySystem(sceneData.scene);

world.spawnTrees(22);
world.spawnRocks(14);
world.spawnBuildings(14);
world.spawnCrates(10);
world.spawnCamps(5);
world.spawnBarrels(7);

const enemyLabels = new Map();
let waveChanging = false;
let jammerFlashTimer = 0;

function triggerGameOver() {
  gameState.gameOver = true;
  gameOverEl.style.display = "flex";
  finalScoreText.textContent = "Score: " + gameState.score;
  playGameOverSound();
}

function addLabelForEnemy(enemy) {
  if (!enemy || !enemy.mesh || enemyLabels.has(enemy)) return;
  enemyLabels.set(enemy, createEnemyLabel(enemy));
}

function rebuildEnemyLabels() {
  for (const label of enemyLabels.values()) {
    label.root.remove();
    label.arrow.remove();
  }

  enemyLabels.clear();

  for (const enemy of enemyManager.enemies) {
    addLabelForEnemy(enemy);
  }
}

function cleanupDeadLabels() {
  const aliveEnemies = new Set(enemyManager.enemies);

  for (const [enemy, label] of enemyLabels.entries()) {
    const stillAlive = aliveEnemies.has(enemy) && enemy.mesh && enemy.mesh.parent;

    if (!stillAlive) {
      label.root.remove();
      label.arrow.remove();
      enemyLabels.delete(enemy);
    }
  }

  for (const enemy of enemyManager.enemies) {
    addLabelForEnemy(enemy);
  }
}

function startWave(wave) {
  enemyManager.clearEnemies();
  rebuildEnemyLabels();

  const setup = spawnWave(enemyManager, wave);

  gameState.wave = wave;
  gameState.waveStarted = true;
  gameState.objectiveText = setup.objective;
  gameState.statusText = "Normal";
  gameState.jammerActive = false;
  gameState.allyUsedThisWave = false;
  waveChanging = false;

  rebuildEnemyLabels();
}

function getMouseGroundPoint() {
  const raycaster = new THREE.Raycaster();
  raycaster.setFromCamera(
    new THREE.Vector2(gameState.mouse.x, gameState.mouse.y),
    sceneData.camera
  );

  const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
  const point = new THREE.Vector3();
  const hit = raycaster.ray.intersectPlane(plane, point);

  return hit ? point : null;
}

startWave(1);
gameState.allyUsedThisWave = false;

window.addEventListener("keydown", (e) => {
  if (e.key.toLowerCase() === "n") {
    startWave(gameState.wave + 1);
  }
});

window.addEventListener("keydown", (e) => {
  if (e.key.toLowerCase() === "e") {
    const scaledCost = gameState.allyCost + gameState.wave * 20;

    if (
      !gameState.allyUsedThisWave &&
      allySystem.activeTime <= 0 &&
      gameState.money >= scaledCost
    ) {
      gameState.money -= scaledCost;
      allySystem.spawnAllies(drone.mesh.position);
      gameState.allyUsedThisWave = true;
    }
  }
});

window.addEventListener("mousedown", () => {
  initAudio();

  const target = getMouseGroundPoint();
  if (!target) return;

  const start = drone.mesh.position.clone();
  start.y = 33;

  const weapon = gameState.weaponSystem.current;
  const cost = gameState.weaponSystem.cost[weapon];

  if (gameState.money >= cost) {
    gameState.money -= cost;

    if (gameState.jammerActive) {
      target.x += (Math.random() - 0.5) * 18;
      target.z += (Math.random() - 0.5) * 18;
    }

    bulletManager.firePlayerBullet(start, target, weapon);

    if (weapon === "small") playMissileSound();
    if (weapon === "big") playBigMissileSound();
    if (weapon === "nuke") playNukeSound();
  }
});

const btnSmall = document.getElementById("btn-small");
const btnBig = document.getElementById("btn-big");
const btnNuke = document.getElementById("btn-nuke");
const btnZoom = document.getElementById("btn-zoom");
const btnAlly = document.getElementById("btn-ally");
const btnFire = document.getElementById("btn-fire");

function updateWeaponBtns(activeId) {
  if (btnSmall) btnSmall.classList.remove("active");
  if (btnBig) btnBig.classList.remove("active");
  if (btnNuke) btnNuke.classList.remove("active");
  const b = document.getElementById(activeId);
  if (b) b.classList.add("active");
}

if (btnSmall) {
  btnSmall.addEventListener("touchstart", (e) => { e.preventDefault(); gameState.weaponSystem.current = "small"; updateWeaponBtns("btn-small"); });
  btnBig.addEventListener("touchstart", (e) => { e.preventDefault(); gameState.weaponSystem.current = "big"; updateWeaponBtns("btn-big"); });
  btnNuke.addEventListener("touchstart", (e) => { e.preventDefault(); gameState.weaponSystem.current = "nuke"; updateWeaponBtns("btn-nuke"); });
}

if (btnZoom) {
  btnZoom.addEventListener("touchstart", (e) => {
    e.preventDefault();
    gameState.zoomMode = !gameState.zoomMode;
    lensStatusEl.textContent = gameState.zoomMode ? "Lens: ON" : "Lens: OFF";
    if (gameState.zoomMode) {
      gameState.cameraHeight = 45;
      gameState.cameraOffsetZ = 12;
    } else {
      gameState.cameraHeight = 70;
      gameState.cameraOffsetZ = 18;
    }
  });
}

if (btnAlly) {
  btnAlly.addEventListener("touchstart", (e) => {
    e.preventDefault();
    const scaledCost = gameState.allyCost + gameState.wave * 20;
    if (!gameState.allyUsedThisWave && allySystem.activeTime <= 0 && gameState.money >= scaledCost) {
      gameState.money -= scaledCost;
      allySystem.spawnAllies(drone.mesh.position);
      gameState.allyUsedThisWave = true;
    }
  });
}

if (btnFire) {
  btnFire.addEventListener("touchstart", (e) => {
    e.preventDefault();
    initAudio();

    const start = drone.mesh.position.clone();
    start.y = 33;

    const direction = new THREE.Vector3(0, 0, 1);
    direction.applyAxisAngle(new THREE.Vector3(0, 1, 0), drone.mesh.rotation.y);
    const target = start.clone().add(direction.multiplyScalar(35));
    target.y = 0;

    const weapon = gameState.weaponSystem.current;
    const cost = gameState.weaponSystem.cost[weapon];

    if (gameState.money >= cost) {
      gameState.money -= cost;

      if (gameState.jammerActive) {
        target.x += (Math.random() - 0.5) * 18;
        target.z += (Math.random() - 0.5) * 18;
      }

      bulletManager.firePlayerBullet(start, target, weapon);

      if (weapon === "small") playMissileSound();
      if (weapon === "big") playBigMissileSound();
      if (weapon === "nuke") playNukeSound();
    }
  });
}

window.addEventListener("keydown", (e) => {
  if (e.key === "1") { gameState.weaponSystem.current = "small"; updateWeaponBtns("btn-small"); }
  if (e.key === "2") { gameState.weaponSystem.current = "big"; updateWeaponBtns("btn-big"); }
  if (e.key === "3") { gameState.weaponSystem.current = "nuke"; updateWeaponBtns("btn-nuke"); }
});

const clock = {
  old: performance.now()
};

function gameLoop(now) {
  requestAnimationFrame(gameLoop);

  if (gameState.gameOver) {
    sceneData.renderer.render(sceneData.scene, sceneData.camera);
    return;
  }

  const delta = (now - clock.old) / 1000;
  clock.old = now;

  // Idle check
  const isIdle = (now - gameState.lastActionTime) > 3000;
  const idleReminderEl = document.getElementById("idleReminder");
  const isMobile = window.matchMedia("(pointer: coarse)").matches;

  if (isIdle) {
    if (idleReminderEl) {
      idleReminderEl.style.display = "block";
      idleReminderEl.textContent = isMobile 
        ? "use joystick to control and tap to fire"
        : "aswd same and click to fire";
    }
    startHoverSound();
  } else {
    if (idleReminderEl) {
      idleReminderEl.style.display = "none";
    }
    stopHoverSound();
  }

  updateDrone(drone, gameState, sceneData.camera, delta);
  enemyManager.updateEnemies(drone, delta, now, enemyBulletManager, world.obstacles);
  allySystem.update(
    delta,
    drone,
    enemyManager.enemies,
    bulletManager,
    gameState.jammerActive
  );
  bulletManager.updateBullets(delta, enemyManager, gameState, drone, world);
  enemyBulletManager.updateEnemyBullets(delta, drone, gameState);

  cleanupDeadLabels();

  if (gameState.health <= 0 && !gameState.gameOver) {
    triggerGameOver();
  }

  gameState.jammerActive = enemyManager.isJammerActive(drone);

  if (gameState.jammerActive) {
    gameState.statusText = "JAMMER ACTIVE";
    jammerFlashTimer += delta;

    if (jammerFlashTimer > 0.5) {
      jammerFlashTimer = 0;

      if (feedNoiseEl) {
        feedNoiseEl.style.display =
          feedNoiseEl.style.display === "none" ? "block" : "none";
      }

      playJammerSound();
    }
  } else {
    gameState.statusText = "Normal";

    if (feedNoiseEl) {
      feedNoiseEl.style.display = "none";
    }

    jammerFlashTimer = 0;
  }

  const targetHeight = gameState.cameraHeight;
  const targetOffsetZ = gameState.cameraOffsetZ;

  sceneData.camera.position.x +=
    (drone.mesh.position.x - sceneData.camera.position.x) * 0.08;
  sceneData.camera.position.z +=
    (drone.mesh.position.z + targetOffsetZ - sceneData.camera.position.z) * 0.08;
  sceneData.camera.position.y +=
    (targetHeight - sceneData.camera.position.y) * 0.08;

  sceneData.camera.lookAt(
    drone.mesh.position.x,
    0,
    drone.mesh.position.z
  );

  if (!gameState.jammerActive) {
    updateEnemyLabels(enemyManager.enemies, enemyLabels, sceneData.camera, drone);
  } else {
    for (const label of enemyLabels.values()) {
      label.root.style.display = "none";
      label.arrow.style.display = "none";
    }
  }

  if (enemyManager.enemies.length === 0 && !waveChanging) {
    waveChanging = true;

    // +1000 per completed wave as requested
    gameState.money += 1000;
    gameState.score += 100;

    playWaveClearSound();

    setTimeout(() => {
      startWave(gameState.wave + 1);
    }, 1500);
  }

  updateUI(gameState, enemyManager.enemies.length, allySystem.activeTime);
  minimap.draw(drone, enemyManager.enemies);
  sceneData.renderer.render(sceneData.scene, sceneData.camera);
}

requestAnimationFrame(gameLoop);