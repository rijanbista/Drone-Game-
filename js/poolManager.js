import * as THREE from "https://unpkg.com/three@0.160.0/build/three.module.js";

import { createPlayerBullet } from "./bullets/playerBullet.js";
import { createExplosion } from "./effects/explosion.js";

class Pool {
  constructor(createFn) {
    this.createFn = createFn;
    this.free = [];
  }

  get(scene, ...args) {
    if (this.free.length > 0) {
      const obj = this.free.pop();
      if (obj.reset) obj.reset(scene, ...args);
      return obj;
    }
    return this.createFn(scene, ...args);
  }

  release(obj) {
    if (obj.onRelease) obj.onRelease();
    this.free.push(obj);
  }
}

export const poolManager = {
  bulletPool: null,
  explosionPool: null,

  init(scene) {
    this.bulletPool = new Pool(createPlayerBullet);
    this.explosionPool = new Pool(createExplosion);
  }
};
