import { createWeaponSystem } from "./weapons.js";

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

    zoomMode: false,
    cameraHeight: 70,
    cameraOffsetZ: 18
  };
}