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
const crosshairEl = document.getElementById("crosshair");
const mainMenuEl = document.getElementById("main-menu");
const pauseScreenEl = document.getElementById("pause-screen");
const btnStart = document.getElementById("btn-start");
const btnResume = document.getElementById("btn-resume");
const difficultyBtns = document.querySelectorAll(".difficulty-btn");

// Menu Logic
difficultyBtns.forEach(btn => {
  btn.onclick = () => {
    difficultyBtns.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    gameState.difficulty = btn.dataset.level;
    
    // Update multipliers and starting money
    if (gameState.difficulty === "easy") {
      gameState.difficultyMultiplier = 0.7;
      gameState.money = 300;
    } else if (gameState.difficulty === "medium") {
      gameState.difficultyMultiplier = 1.0;
      gameState.money = 200;
    } else {
      gameState.difficultyMultiplier = 1.5;
      gameState.money = 150;
    }
    updateUI(gameState, enemyManager.enemies.length, allySystem.activeTime);
  };
});

if (btnStart) {
  btnStart.onclick = () => {
    gameState.inMenu = false;
    mainMenuEl.style.display = "none";
    enemyManager.setDifficultyMultiplier(gameState.difficultyMultiplier);
    allySystem.setLevel(gameState.wave, gameState.difficultyMultiplier);
    initAudio();
  };
}

if (btnResume) {
  btnResume.onclick = () => {
    gameState.isPaused = false;
    pauseScreenEl.style.display = "none";
  };
}

window.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !gameState.inMenu && !gameState.gameOver) {
    gameState.isPaused = !gameState.isPaused;
    pauseScreenEl.style.display = gameState.isPaused ? "flex" : "none";
  }
});

// Loading Manager Setup
const loadingScreen = document.getElementById("loading-screen");
const loadingBar = document.getElementById("loading-bar");
const loadingText = document.getElementById("loading-text");

const loadingManager = new THREE.LoadingManager();

loadingManager.onProgress = (url, itemsLoaded, itemsTotal) => {
  const progress = (itemsLoaded / itemsTotal) * 100;
  if (loadingBar) loadingBar.style.width = progress + "%";
  if (loadingText) loadingText.textContent = `Initializing Systems... ${Math.round(progress)}%`;
};

function completeLoading() {
  if (loadingScreen) {
    loadingScreen.classList.add("fade-out");
    setTimeout(() => {
      loadingScreen.style.display = "none";
    }, 500);
  }
}

loadingManager.onLoad = completeLoading;

const sceneData = createScene();
const gameState = createGameState();

const isTouch =
  ("ontouchstart" in window) ||
  (navigator.maxTouchPoints && navigator.maxTouchPoints > 0) ||
  (navigator.msMaxTouchPoints && navigator.msMaxTouchPoints > 0);

if (isTouch) {
  document.body.classList.add("touch");
}

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

world.spawnTrees();
world.spawnRocks();
world.spawnBuildings();
world.spawnCrates();
world.spawnCamps();
world.spawnBarrels();

// Finalize initial loading
if (loadingBar) loadingBar.style.width = "100%";
if (loadingText) loadingText.textContent = "Systems Online... 100%";
setTimeout(completeLoading, 400);

const enemyLabels = new Map();
let waveChanging = false;
let waveCooldownLeft = 0;
let waveCompleted = 0;
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
  enemyManager.setCurrentWave(wave);
  enemyManager.clearEnemies();
  rebuildEnemyLabels();

  const setup = spawnWave(enemyManager, wave);

  gameState.wave = wave;
  allySystem.setLevel(gameState.wave, gameState.difficultyMultiplier);
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
    const scaledCost = gameState.allyCost + gameState.wave * 40;

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

function fireWeapon(targetPoint = null) {
  initAudio();

  const weapon = gameState.weaponSystem.current;
  const config = gameState.weaponSystem.ammo[weapon];

  if (gameState.weaponSystem.isReloading) return;

  const start = drone.mesh.position.clone();
  // Adjust starting height to match drone's height exactly
  start.y = drone.mesh.position.y;

  let target;
  if (targetPoint) {
    target = targetPoint.clone();
  } else {
    const direction = new THREE.Vector3(0, 0, 1);
    direction.applyAxisAngle(new THREE.Vector3(0, 1, 0), drone.mesh.rotation.y);
    target = start.clone().add(direction.multiplyScalar(35));
    target.y = 0;
  }

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

    // Start reload
    gameState.weaponSystem.isReloading = true;
    gameState.weaponSystem.reloadTimer = config.reloadTime;
  }
}

window.addEventListener("mousedown", (e) => {
  if (e.button !== 0) return; // Only left click
  const target = getMouseGroundPoint();
  if (target) fireWeapon(target);
});

// Mobile Tap-to-fire (on main game area)
window.addEventListener("touchstart", (e) => {
  if (e.target.tagName === "BUTTON" || e.target.closest("#joystick-zone")) return;
  
  // Update mouse coords for raycasting
  const touch = e.touches[0];
  gameState.mouse.x = (touch.clientX / window.innerWidth) * 2 - 1;
  gameState.mouse.y = -(touch.clientY / window.innerHeight) * 2 + 1;

  const target = getMouseGroundPoint();
  if (target) fireWeapon(target);
}, { passive: false });

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
  const selectSmall = (e) => { e.preventDefault(); gameState.weaponSystem.current = "small"; updateWeaponBtns("btn-small"); };
  btnSmall.addEventListener("touchstart", selectSmall, {passive: false});
  btnSmall.addEventListener("mousedown", selectSmall);

  const selectBig = (e) => { e.preventDefault(); gameState.weaponSystem.current = "big"; updateWeaponBtns("btn-big"); };
  btnBig.addEventListener("touchstart", selectBig, {passive: false});
  btnBig.addEventListener("mousedown", selectBig);

  const selectNuke = (e) => { e.preventDefault(); gameState.weaponSystem.current = "nuke"; updateWeaponBtns("btn-nuke"); };
  btnNuke.addEventListener("touchstart", selectNuke, {passive: false});
  btnNuke.addEventListener("mousedown", selectNuke);
}

if (btnZoom) {
  const zoomAction = (e) => {
    e.preventDefault();
    gameState.zoomMode = !gameState.zoomMode;
    lensStatusEl.textContent = gameState.zoomMode ? "Lens: ON" : "Lens: OFF";
    if (gameState.zoomMode) {
      gameState.cameraHeight = CONFIG.CAMERA.ZOOM_MIN;
      gameState.cameraOffsetZ = CONFIG.CAMERA.DEFAULT_OFFSET_Z * 0.7;
    } else {
      gameState.cameraHeight = CONFIG.CAMERA.DEFAULT_HEIGHT;
      gameState.cameraOffsetZ = CONFIG.CAMERA.DEFAULT_OFFSET_Z;
    }
  };
  btnZoom.addEventListener("touchstart", zoomAction, {passive: false});
  btnZoom.addEventListener("mousedown", zoomAction);
}

if (btnAlly) {
  const allyAction = (e) => {
    e.preventDefault();
    const scaledCost = gameState.allyCost + gameState.wave * 40;
    if (!gameState.allyUsedThisWave && allySystem.activeTime <= 0 && gameState.money >= scaledCost) {
      gameState.money -= scaledCost;
      allySystem.spawnAllies(drone.mesh.position);
      gameState.allyUsedThisWave = true;
    }
  };
  btnAlly.addEventListener("touchstart", allyAction, {passive: false});
  btnAlly.addEventListener("mousedown", allyAction);
}

if (btnFire) {
  const fireAction = (e) => {
    e.preventDefault();
    fireWeapon();
  };
  btnFire.addEventListener("touchstart", fireAction, {passive: false});
  btnFire.addEventListener("mousedown", fireAction);
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

  if (gameState.gameOver || gameState.isPaused || gameState.inMenu) {
    sceneData.renderer.render(sceneData.scene, sceneData.camera);
    return;
  }

  const delta = (now - clock.old) / 1000;
  clock.old = now;

  updateDrone(drone, gameState, sceneData.camera, delta, world);
  
  // Weapon reload logic
  if (gameState.weaponSystem.isReloading) {
    gameState.weaponSystem.reloadTimer -= delta;
    if (gameState.weaponSystem.reloadTimer <= 0) {
      gameState.weaponSystem.isReloading = false;
      gameState.weaponSystem.reloadTimer = 0;
    }
  }

  enemyManager.updateEnemies(drone, delta, gameState.wave, now, enemyBulletManager, world.obstacles);
  allySystem.update(
    delta,
    drone,
    enemyManager.enemies,
    bulletManager,
    gameState.jammerActive
  );
  bulletManager.updateBullets(delta, enemyManager, gameState, drone, world);
  enemyBulletManager.updateEnemyBullets(delta, drone, gameState);

  world.updateVisibility(drone.mesh.position);
  for (const obs of world.obstacles) {
    if (obs && obs.type === "tent" && obs.hpBar && obs.hpBar.visible) {
      obs.hpBar.lookAt(sceneData.camera.position);
    }
  }

  // Update Crosshair Position
  if (crosshairEl) {
    const cx = (gameState.mouse.x + 1) * 0.5 * window.innerWidth;
    const cy = (-gameState.mouse.y + 1) * 0.5 * window.innerHeight;
    crosshairEl.style.left = cx + "px";
    crosshairEl.style.top = cy + "px";
  }

  cleanupDeadLabels();

  if (gameState.health <= 0 && !gameState.gameOver) {
    triggerGameOver();
  }

  // Check for Out of Money Game Over
  const minWeaponCost = Math.min(...Object.values(gameState.weaponSystem.cost));
  if (gameState.money < minWeaponCost && enemyManager.enemies.length > 0 && !gameState.gameOver) {
    gameState.statusText = "OUT OF FUNDS";
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

  // Apply Screen Shake
  if (gameState.screenShake > 0) {
    sceneData.camera.position.x += (Math.random() - 0.5) * gameState.screenShake * 3;
    sceneData.camera.position.y += (Math.random() - 0.5) * gameState.screenShake * 3;
    sceneData.camera.position.z += (Math.random() - 0.5) * gameState.screenShake * 3;
    gameState.screenShake *= 0.9; // Decay
    if (gameState.screenShake < 0.01) gameState.screenShake = 0;
  }

  sceneData.camera.lookAt(
    drone.mesh.position.x,
    drone.mesh.position.y * 0.5, // Look halfway between ground and drone
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
    waveCooldownLeft = 5;
    waveCompleted = gameState.wave;

    gameState.money += 1000;

    playWaveClearSound();
    gameState.objectiveText = `WELL DONE! WAVE ${waveCompleted} COMPLETED`;
    gameState.statusText = "NEXT WAVE IN 5s";
  }

  if (waveChanging && waveCooldownLeft > 0) {
    waveCooldownLeft -= delta;
    const secondsLeft = Math.max(0, Math.ceil(waveCooldownLeft));
    gameState.objectiveText = `WELL DONE! WAVE ${waveCompleted} COMPLETED`;
    gameState.statusText = `NEXT WAVE IN ${secondsLeft}s`;

    if (waveCooldownLeft <= 0) {
      waveCooldownLeft = 0;
      startWave(gameState.wave + 1);
    }
  }

  updateUI(gameState, enemyManager.enemies.length, allySystem.activeTime);
  minimap.draw(drone, enemyManager.enemies);
  sceneData.renderer.render(sceneData.scene, sceneData.camera);
}

requestAnimationFrame(gameLoop);
