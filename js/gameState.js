import { createWeaponSystem } from "./weapons.js";
import { CONFIG } from "./config.js";

export function createGameState() {
  return {
    health: 100,
    money: 500,
    score: 0,
    wave: 1,
    objectiveText: "",
    statusText: "Normal",
    jammerActive: false,

    weaponSystem: createWeaponSystem(),

    keys: {},
    mouse: { x: 0, y: 0 },
    joystick: { x: 0, y: 0, active: false },

    waveStarted: false,
    gameOver: false,

    allyCost: 200,
    allyUsedThisWave: false,

    difficulty: "medium", // Default
    difficultyMultiplier: 1.0,

    isPaused: false,
    inMenu: true,
    screenShake: 0,

    zoomMode: false,
    cameraHeight: CONFIG.CAMERA.DEFAULT_HEIGHT,
    cameraOffsetZ: CONFIG.CAMERA.DEFAULT_OFFSET_Z
  };
}