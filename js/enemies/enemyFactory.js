import { createInfantry } from "./infantry.js";
import { createCar } from "./car.js";
import { createJeep } from "./jeep.js";
import { createTruck } from "./truck.js";
import { createTank } from "./tank.js";
import { createChopper } from "./chopper.js";
import { applyWeakspots } from "./weakspots.js";

export function createEnemy(type, x, z, wave = 1, difficultyMultiplier = 1.0) {
  let enemy = null;

  if (type === "infantry") enemy = createInfantry(x, z);
  if (type === "car") enemy = createCar(x, z);
  if (type === "jeep") enemy = createJeep(x, z);
  if (type === "truck") enemy = createTruck(x, z);
  if (type === "tank") enemy = createTank(x, z);
  if (type === "chopper") enemy = createChopper(x, z);

  if (!enemy) {
    throw new Error(`Unknown enemy type: ${type}`);
  }

  if (typeof enemy.health !== "number") enemy.health = 1;
  if (typeof enemy.maxHealth !== "number") enemy.maxHealth = enemy.health;

  // Apply difficulty and wave scaling
  const baseScale = difficultyMultiplier;
  const waveScale = 1 + (wave - 1) * 0.15;
  const totalHealthScale = baseScale * waveScale;
  
  enemy.health *= totalHealthScale;
  enemy.maxHealth *= totalHealthScale;
  
  // Speed scales less aggressively
  enemy.speed *= (1 + (baseScale - 1) * 0.5) * (1 + (wave - 1) * 0.05);
  
  // Damage scales with difficulty and wave
  enemy.damage *= baseScale * (1 + (wave - 1) * 0.1);

  return applyWeakspots(enemy);
}
