import { createInfantry } from "./infantry.js";
import { createCar } from "./car.js";
import { createJeep } from "./jeep.js";
import { createTruck } from "./truck.js";
import { createTank } from "./tank.js";
import { createChopper } from "./chopper.js";
import { applyWeakspots } from "./weakspots.js";

export function createEnemy(type, x, z) {
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

  return applyWeakspots(enemy);
}