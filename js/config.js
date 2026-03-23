export const CONFIG = {
  MAP_SIZE: 1000,
  MAP_HALF: 500,
  DRONE: {
    START_Y: 55,
    SPEED: 35,
    HIT_RADIUS: 0.8,
    SCALE: 0.28
  },
  CAMERA: {
    DEFAULT_HEIGHT: 110,
    DEFAULT_OFFSET_Z: 25,
    ZOOM_MIN: 60,
    ZOOM_MAX: 180
  },
  SPAWN_LIMITS: {
    MIN_CENTER: 60,
    WORLD_RANGE: 900 // Slightly smaller than map size
  }
};
